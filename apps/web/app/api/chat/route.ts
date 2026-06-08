/**
 * NEXUS chat endpoint — DeepSeek-v4-flash backed, three-layer defense:
 * input guard → sandwich prompt → output guard.
 *
 * Replaces the previous Anthropic-direct route. Server-only system
 * prompt + audit log + rate limit + injection detection + leak
 * detection + claim sanitization.
 */

import { NextRequest, NextResponse } from 'next/server'
import { inputGuard } from '@/lib/chat/guards/input-guard'
import { outputGuard } from '@/lib/chat/guards/output-guard'
import { callDeepSeek, type DeepSeekMessage } from '@/lib/chat/deepseek'
import { buildSystemPrompt, buildReminder } from '@/lib/chat/prompt'
import { audit, hashIp } from '@/lib/chat/audit'

export const runtime = 'nodejs'

function newSessionId(): string {
  return crypto.randomUUID().slice(0, 8)
}

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for') ?? ''
  const first = fwd.split(',')[0]?.trim()
  if (first) return first
  return req.headers.get('x-real-ip') ?? 'unknown'
}

export async function POST(req: NextRequest) {
  const t0 = Date.now()
  const body = await req.json().catch(() => ({}))
  const message: unknown = body?.message
  const session_id: string =
    typeof body?.session_id === 'string' && body.session_id.length > 0
      ? body.session_id
      : newSessionId()

  const ip_hash = hashIp(clientIp(req))

  if (typeof message !== 'string') {
    return NextResponse.json({ error: 'message required' }, { status: 400 })
  }

  // -------- INPUT GUARD --------
  const guard = inputGuard({ message, ipHash: ip_hash })
  if (!guard.ok) {
    audit({
      ts: new Date().toISOString(),
      session_id,
      ip_hash,
      in: message.slice(0, 500),
      out: guard.reply,
      guards_fired: [`block:${guard.reason}`],
      latency_ms: Date.now() - t0,
      confidence: 'low',
      out_of_scope: true,
      language: 'unknown',
      blocked_reason: guard.reason,
    })
    return NextResponse.json({ reply: guard.reply, session_id })
  }

  // -------- SANDWICH PROMPT --------
  const messages: DeepSeekMessage[] = [
    { role: 'system', content: buildSystemPrompt() },
    { role: 'user', content: guard.sanitized },
    { role: 'system', content: buildReminder() },
  ]

  // -------- DEEPSEEK CALL --------
  const call = await callDeepSeek(messages)
  if (!call.ok) {
    const fallback =
      'Chat is currently unavailable. Please use the contact form or write to founder@soulcore.dev.'
    audit({
      ts: new Date().toISOString(),
      session_id,
      ip_hash,
      in: message.slice(0, 500),
      out: fallback,
      guards_fired: [`upstream:${call.reason}`],
      latency_ms: Date.now() - t0,
      confidence: 'low',
      out_of_scope: false,
      language: 'unknown',
      blocked_reason: call.reason,
    })
    console.error('[nexus]', call.reason, call.detail)
    return NextResponse.json({ reply: fallback, session_id })
  }

  // -------- OUTPUT GUARD --------
  const out = outputGuard(call.raw)

  audit({
    ts: new Date().toISOString(),
    session_id,
    ip_hash,
    in: message.slice(0, 500),
    out: out.reply.slice(0, 1000),
    guards_fired: out.guards_fired,
    latency_ms: Date.now() - t0,
    confidence: out.confidence,
    out_of_scope: out.out_of_scope,
    language: out.language,
    model_usage: call.usage,
  })

  return NextResponse.json({ reply: out.reply, session_id })
}
