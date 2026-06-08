/**
 * DeepSeek API client (OpenAI-compatible).
 *
 * Confirmed from official docs (api-docs.deepseek.com/quick_start/pricing):
 *   model id: "deepseek-v4-flash"
 *   base url: https://api.deepseek.com  (OpenAI format)
 *   json_object output: supported
 *   thinking_mode: default ON — we OPT OUT for fast chat.
 *
 * We bypass the openai SDK and fetch directly: one less dependency,
 * easier to audit, identical OpenAI-format request body.
 */

export type DeepSeekMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

const ENDPOINT = 'https://api.deepseek.com/chat/completions'
const MODEL = 'deepseek-v4-flash'
const DEFAULT_TIMEOUT_MS = 15_000

export type DeepSeekCallResult =
  | { ok: true; raw: string; latency_ms: number; usage?: Record<string, number> }
  | { ok: false; reason: 'no_key' | 'http_error' | 'timeout' | 'network'; detail: string }

export async function callDeepSeek(messages: DeepSeekMessage[]): Promise<DeepSeekCallResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    return { ok: false, reason: 'no_key', detail: 'DEEPSEEK_API_KEY is not set' }
  }

  const t0 = Date.now()
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        max_tokens: 800,
        temperature: 0.3,
        // Force strict JSON object output — output guard parses this.
        response_format: { type: 'json_object' },
        // Disable thinking mode for fast customer chat. Per official
        // docs (api-docs.deepseek.com/guides/thinking_mode), the
        // toggle is a ThinkingOptions struct, not a boolean.
        thinking: { type: 'disabled' },
      }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!res.ok) {
      const detail = await res.text().catch(() => '<no body>')
      return {
        ok: false,
        reason: 'http_error',
        detail: `HTTP ${res.status}: ${detail.slice(0, 500)}`,
      }
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[]
      usage?: Record<string, number>
    }
    const raw = json.choices?.[0]?.message?.content ?? ''

    return {
      ok: true,
      raw,
      latency_ms: Date.now() - t0,
      usage: json.usage,
    }
  } catch (err: unknown) {
    clearTimeout(timeout)
    if (err instanceof Error && err.name === 'AbortError') {
      return { ok: false, reason: 'timeout', detail: `aborted after ${DEFAULT_TIMEOUT_MS}ms` }
    }
    return {
      ok: false,
      reason: 'network',
      detail: err instanceof Error ? err.message : String(err),
    }
  }
}
