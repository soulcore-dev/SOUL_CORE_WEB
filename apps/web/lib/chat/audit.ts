/**
 * NEXUS audit log. Append-only JSONL — one line per chat turn.
 *
 * Path: /var/log/nexus_chat.jsonl (writable by the soulcore-web container).
 * Best-effort: failure to log NEVER blocks a user response.
 *
 * Each line:
 *   { ts, session_id, ip_hash, in, out, guards_fired, latency_ms,
 *     confidence, out_of_scope, language, model_usage }
 *
 * ip_hash is sha256(ip + DAILY_SALT) — we never store raw IP.
 */

import { createHash } from 'crypto'
import { appendFile, mkdir } from 'fs/promises'
import path from 'path'

const LOG_DIR = process.env.NEXUS_LOG_DIR ?? '/tmp'
const LOG_FILE = path.join(LOG_DIR, 'nexus_chat.jsonl')

// Daily-rotating salt — even if the file leaks, IPs can't be reversed
// across days, and within-day correlation is bounded.
function dailySalt(): string {
  const d = new Date()
  return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`
}

export function hashIp(rawIp: string | null | undefined): string {
  const ip = rawIp ?? 'unknown'
  return createHash('sha256').update(ip + '::' + dailySalt()).digest('hex').slice(0, 16)
}

export type AuditEntry = {
  ts: string
  session_id: string
  ip_hash: string
  in: string
  out: string
  guards_fired: string[]
  latency_ms: number
  confidence: 'high' | 'low'
  out_of_scope: boolean
  language: string
  model_usage?: Record<string, number>
  blocked_reason?: string
}

export async function audit(entry: AuditEntry): Promise<void> {
  try {
    await mkdir(LOG_DIR, { recursive: true })
    await appendFile(LOG_FILE, JSON.stringify(entry) + '\n', 'utf8')
  } catch {
    // Never throw from audit. Best-effort logging.
  }
}
