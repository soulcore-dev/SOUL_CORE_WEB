import { NextRequest, NextResponse } from 'next/server'
import { send } from '@/lib/email/service'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'founder@soulcore.dev'

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const name = typeof body?.name === 'string' ? body.name.slice(0, 200) : ''
  const email = typeof body?.email === 'string' ? body.email.slice(0, 200) : ''
  const service = typeof body?.service === 'string' ? body.service.slice(0, 200) : ''
  const budget = typeof body?.budget === 'string' ? body.budget.slice(0, 200) : ''
  const message = typeof body?.message === 'string' ? body.message.slice(0, 4000) : ''

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'name, email, message required' }, { status: 400 })
  }

  const leadId = crypto.randomUUID().slice(0, 8)

  const result = await send(
    ADMIN_EMAIL,
    `New lead: ${name} — ${service || 'General'}`,
    `
      <h2>New contact from soulcore.dev</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Service:</strong> ${escapeHtml(service || 'Not specified')}</p>
      <p><strong>Budget:</strong> ${escapeHtml(budget || 'Not specified')}</p>
      <p><strong>Message:</strong></p>
      <blockquote>${escapeHtml(message)}</blockquote>
      <p><em>Lead ID: ${leadId}</em></p>
    `
  )

  // Honest response: if SMTP failed, tell the client. Previous behavior
  // returned success=true even when the email never left — that's the
  // "silent broken" bug we cleaned up during the Gmail SMTP migration.
  if (!result.success) {
    console.error(`[contact] lead ${leadId} failed to send:`, result.error)
    return NextResponse.json(
      {
        success: false,
        lead_id: leadId,
        error:
          'Could not deliver your message right now. Please email founder@soulcore.dev directly.',
      },
      { status: 502 }
    )
  }

  return NextResponse.json({
    success: true,
    lead_id: leadId,
    message: 'Gracias por contactarnos. Te responderemos pronto.',
  })
}
