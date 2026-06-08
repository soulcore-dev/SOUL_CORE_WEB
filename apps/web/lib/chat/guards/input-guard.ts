/**
 * NEXUS input guard. Runs BEFORE the message reaches DeepSeek.
 *
 * Layers (each can short-circuit):
 * 1. Length cap
 * 2. Rate limit (per-IP, sliding window, in-process LRU)
 * 3. Prompt-injection regex
 * 4. Off-topic / abuse keyword filter
 *
 * Returns either:
 *   { ok: true, sanitized }      → proceed to model
 *   { ok: false, reason, reply } → return the polite refusal directly
 */

import { sanitizeUserMessage } from '../prompt'

export type InputGuardResult =
  | { ok: true; sanitized: string }
  | { ok: false; reason: string; reply: string }

const MAX_MESSAGE_CHARS = 4000
const MAX_MESSAGE_BYTES = 16_000 // UTF-8 worst case is ~4 bytes/char
const MAX_REQUESTS_PER_WINDOW = 10
const WINDOW_MS = 5 * 60 * 1000 // 5 minutes

// If a message is mostly invisible / control chars after normalization,
// it's almost certainly a smuggling attempt. Reject if >20% of the
// codepoints fall into the suspicious classes.
const SUSPICIOUS_RATIO_THRESHOLD = 0.20

/**
 * Count "suspicious" codepoints — invisible, zero-width, direction-
 * override, control chars. Used to detect Unicode-smuggling attempts
 * where the visible-to-human text is short but the actual codepoint
 * stream is loaded with adversarial markers.
 */
function suspiciousCodepointRatio(s: string): number {
  if (s.length === 0) return 0
  let suspicious = 0
  for (const ch of s) {
    const code = ch.codePointAt(0) ?? 0
    if (
      (code >= 0x200B && code <= 0x200F) ||
      (code >= 0x202A && code <= 0x202E) ||
      (code >= 0x2060 && code <= 0x2064) ||
      (code >= 0x2066 && code <= 0x2069) ||
      code === 0xFEFF ||
      code === 0x00AD ||
      (code >= 0x180B && code <= 0x180D) ||
      // ASCII control chars except \n \t \r
      (code <= 0x1F && code !== 0x09 && code !== 0x0A && code !== 0x0D) ||
      code === 0x7F
    ) {
      suspicious++
    }
  }
  return suspicious / [...s].length
}

/**
 * In-process rate limiter. Survives module reload between requests in
 * the same Node process. NOT shared across multiple replicas — for that
 * we'd need Redis or a real KV. For a single-container landing chat
 * this is enough.
 *
 * If we ever scale to N replicas, swap this for upstash/redis.
 */
const rateBuckets = new Map<string, number[]>()

function hitRateLimit(ipHash: string): boolean {
  const now = Date.now()
  const bucket = rateBuckets.get(ipHash) ?? []
  const recent = bucket.filter((t) => now - t < WINDOW_MS)
  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    rateBuckets.set(ipHash, recent)
    return true
  }
  recent.push(now)
  rateBuckets.set(ipHash, recent)

  // Lightweight GC — drop cold buckets so the map doesn't grow unbounded.
  if (rateBuckets.size > 5000) {
    for (const [k, v] of rateBuckets) {
      if (v.length === 0 || now - v[v.length - 1] > WINDOW_MS) {
        rateBuckets.delete(k)
      }
    }
  }
  return false
}

/**
 * Hard injection patterns. Hitting any of these returns a polite
 * refusal — we do NOT pass the request to the model. This is the
 * first line of defense; sanitizeUserMessage() defangs anything that
 * does pass through.
 */
const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i,
  /forget\s+(everything|all|your\s+instructions|previous)/i,
  /you\s+are\s+now\s+(a|an|the)?\s*(different|new|another)/i,
  /(act|behave|respond)\s+as\s+(if\s+you\s+were\s+)?(?:dan|jailbreak|developer\s+mode|do\s+anything)/i,
  /reveal\s+(your|the)\s+(system|hidden)\s+(prompt|instructions|rules)/i,
  /print\s+(your|the)\s+(system|hidden|raw)\s+(prompt|instructions)/i,
  /show\s+me\s+(your|the)\s+(system|hidden)\s+(prompt|instructions)/i,
  /<\|im_start\|>|<\|im_end\|>|<\|endoftext\|>|<\|system\|>/i,
  /^\s*system\s*:/im,
]

/**
 * Abuse keywords. Soft list — used together with injection detection to
 * decide refusal. Tuned for false-positive avoidance; only matches
 * unambiguous abuse intent, not the bare words.
 */
const ABUSE_PATTERNS: RegExp[] = [
  /how\s+(do\s+)?i?\s*(make|build|create)\s+(a\s+)?(bomb|weapon|virus|malware|ransomware)/i,
  /generate\s+(an?\s+)?(child|csam|cp)\s+/i,
  /(kill|harm)\s+(yourself|myself|themselves)/i,
]

export function inputGuard(opts: {
  message: string
  ipHash: string
}): InputGuardResult {
  const { message, ipHash } = opts

  // 1a. Length cap by char count.
  if (typeof message !== 'string' || message.trim().length === 0) {
    return { ok: false, reason: 'empty', reply: 'Please type your question.' }
  }
  if (message.length > MAX_MESSAGE_CHARS) {
    return {
      ok: false,
      reason: 'too_long',
      reply:
        "Your message is too long for the chat. Could you summarize it in a few sentences, or use the contact form at https://soulcore.dev/#contact for longer requests?",
    }
  }

  // 1b. Length cap by UTF-8 byte size. Defends against pathological
  //     input where a moderate char count expands to a huge byte payload
  //     (4-byte sequences, surrogate pairs, deeply combined emoji).
  if (new TextEncoder().encode(message).byteLength > MAX_MESSAGE_BYTES) {
    return {
      ok: false,
      reason: 'too_large',
      reply:
        "Your message is too large for the chat. Please keep it under ~16KB or use the contact form.",
    }
  }

  // 1c. Unicode-smuggling check. If >20% of the codepoint stream is
  //     invisible / control / direction-override chars, it's almost
  //     certainly a smuggling attempt — refuse instead of trying to
  //     sanitize, since the visible text is mostly hidden.
  if (suspiciousCodepointRatio(message) > SUSPICIOUS_RATIO_THRESHOLD) {
    return {
      ok: false,
      reason: 'unicode_smuggle',
      reply:
        "Your message contains a lot of invisible characters. Please paste it as plain text and try again.",
    }
  }

  // 2. Rate limit (per-IP sliding window).
  if (hitRateLimit(ipHash)) {
    return {
      ok: false,
      reason: 'rate_limit',
      reply:
        "You've sent quite a few messages quickly — please wait a couple of minutes before trying again. For urgent matters, founder@soulcore.dev is the fastest channel.",
    }
  }

  // 3. Injection / system-prompt extraction attempts.
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(message)) {
      return {
        ok: false,
        reason: 'injection',
        reply:
          "I'm only able to help with questions about SoulCore's services. If there's something specific you'd like to know, ask in your own words and I'll do my best.",
      }
    }
  }

  // 4. Abuse / safety-critical refusal.
  for (const pattern of ABUSE_PATTERNS) {
    if (pattern.test(message)) {
      return {
        ok: false,
        reason: 'abuse',
        reply: "I can't help with that. For SoulCore-related questions I'm here.",
      }
    }
  }

  // Defang anything residual and pass on.
  return { ok: true, sanitized: sanitizeUserMessage(message) }
}
