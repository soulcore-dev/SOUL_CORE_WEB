/**
 * NEXUS output guard. Runs AFTER DeepSeek returns. Three jobs:
 * 1. Parse the strict JSON schema the model was instructed to emit
 *    (and rescue malformed output instead of crashing).
 * 2. Detect leak of system-prompt text (verbatim phrases that should
 *    never appear in user-facing output).
 * 3. Replace low-confidence / out-of-scope replies with a safe redirect.
 * 4. Sanitize claims (prices, fixed dates) → append "pending confirmation"
 *    or strip outright.
 *
 * Returns the FINAL user-facing reply + a list of guards that fired
 * (for audit logging).
 */

import { NEXUS_FACTS, type SupportedLanguage } from '../knowledge/nexus-facts'

type RefusalKey = keyof typeof NEXUS_FACTS.refusal_examples

/**
 * Pick the localized refusal for the user's language, falling back to
 * English when the detected language isn't one we have a translation for.
 */
function localizedRefusal(key: RefusalKey, lang: string): string {
  const family = NEXUS_FACTS.refusal_examples[key]
  const code = (['en', 'es', 'pt', 'fr', 'de'] as const).includes(lang as SupportedLanguage)
    ? (lang as SupportedLanguage)
    : 'en'
  return family[code] ?? family.en
}

function localizedFooter(lang: string): string {
  const code = (['en', 'es', 'pt', 'fr', 'de'] as const).includes(lang as SupportedLanguage)
    ? (lang as SupportedLanguage)
    : 'en'
  return NEXUS_FACTS.safety_footer[code] ?? NEXUS_FACTS.safety_footer.en
}

export type OutputGuardResult = {
  reply: string
  confidence: 'high' | 'low'
  out_of_scope: boolean
  language: string
  guards_fired: string[]
}

/**
 * Phrases from the SYSTEM prompt that should NEVER appear verbatim in
 * the user-facing reply. If any of these leak, redact + log.
 *
 * Kept short / distinctive on purpose — we don't want false positives
 * on common words. Exact-string match (case-sensitive).
 */
const SYSTEM_LEAK_MARKERS = [
  'HARD RULES',
  'KNOWLEDGE_BASE',
  'SCOPE_IN',
  'SCOPE_OUT',
  'refusal_examples',
  'pricing_policy',
  'NEVER fabricate facts',
  'OUTPUT FORMAT',
]

/**
 * Claim patterns we either strip or annotate. Tuned conservative —
 * we only flag clear monetary / commitment claims, not generic numbers.
 */
const PRICE_PATTERN = /\$\s?\d{1,3}([,.]?\d{3})*(\.\d+)?|\b(\d+\s?(usd|eur|cop|mxn|ars|clp)|usd\s?\d+|eur\s?\d+)\b/i
const DATE_COMMIT_PATTERN = /\b(deliver|delivery|ready|ship|complete|finish|done)\b\s+(by|in|on)\s+(\d|january|february|march|april|may|june|july|august|september|october|november|december|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d+\s+(days?|weeks?|months?))/i

/**
 * Try to parse DeepSeek's JSON response. The model was instructed to
 * emit JSON, but we still wrap in try/catch and salvage degraded
 * output — never crash the request because of a malformed reply.
 */
function parseStrict(raw: string): {
  reply: string
  confidence: 'high' | 'low'
  out_of_scope: boolean
  language: string
} {
  const fallback = {
    reply: NEXUS_FACTS.refusal_examples.off_topic.en,
    confidence: 'low' as const,
    out_of_scope: true,
    language: 'en',
  }

  if (!raw || typeof raw !== 'string') return fallback

  // Strip markdown fences if the model wrapped JSON in ```json blocks.
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  try {
    const obj = JSON.parse(cleaned) as Record<string, unknown>
    const reply = typeof obj.reply === 'string' ? obj.reply : ''
    const confidence: 'high' | 'low' = obj.confidence === 'high' ? 'high' : 'low'
    const out_of_scope = obj.out_of_scope === true
    const language =
      typeof obj.language === 'string' && /^[a-z]{2}$/i.test(obj.language)
        ? obj.language.toLowerCase()
        : 'en'

    if (!reply) return fallback
    return { reply, confidence, out_of_scope, language }
  } catch {
    return fallback
  }
}

export function outputGuard(rawModelOutput: string): OutputGuardResult {
  const guards_fired: string[] = []

  const parsed = parseStrict(rawModelOutput)
  if (parsed.reply === NEXUS_FACTS.refusal_examples.off_topic.en && parsed.confidence === 'low') {
    guards_fired.push('parse_failed')
  }
  let { reply, confidence, out_of_scope, language } = parsed

  // 1. System-prompt leak detection — REDACT, do not pass through.
  for (const marker of SYSTEM_LEAK_MARKERS) {
    if (reply.includes(marker)) {
      guards_fired.push(`leak:${marker}`)
      reply = localizedRefusal('confidential', language)
      confidence = 'low'
      out_of_scope = true
      break
    }
  }

  // 2. Low-confidence or out-of-scope → replace with safe redirect
  //    (in the user's language).
  if (out_of_scope) {
    guards_fired.push('out_of_scope')
    reply = localizedRefusal('off_topic', language)
  } else if (confidence === 'low') {
    guards_fired.push('low_confidence')
    reply = localizedRefusal('pricing', language)
  }

  // 3. Price claim → replace with the localized pricing refusal.
  if (PRICE_PATTERN.test(reply)) {
    guards_fired.push('price_claim')
    reply = localizedRefusal('pricing', language)
  }

  // 4. Date / delivery commitment → strip + replace.
  if (DATE_COMMIT_PATTERN.test(reply)) {
    guards_fired.push('date_commit')
    reply = reply.replace(
      DATE_COMMIT_PATTERN,
      '[timing to be confirmed during scoping]'
    )
  }

  // 5. Identity coercion — if reply claims to be Claude / GPT / etc, strip.
  if (/\b(claude|gpt|chatgpt|gemini|llama|deepseek)\b/i.test(reply)) {
    guards_fired.push('identity_leak')
    reply = reply.replace(/\b(claude|gpt|chatgpt|gemini|llama|deepseek)\b/gi, 'AI')
  }

  // 6. Always-on safety footer (in the user's language) for non-trivial replies.
  if (reply.length > 100 && !reply.includes('founder@soulcore.dev')) {
    reply = reply + '\n\n' + localizedFooter(language)
  }

  return { reply, confidence, out_of_scope, language, guards_fired }
}
