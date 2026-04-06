import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'founder@soulcore.dev'
const FROM_EMAIL = process.env.FROM_EMAIL ?? 'hello@soulcore.dev'

export async function POST(req: NextRequest) {
  const { name, email, service, budget, message } = await req.json()

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'name, email, message required' }, { status: 400 })
  }

  const leadId = crypto.randomUUID().slice(0, 8)

  // Send email notification to admin
  if (resend) {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: `New lead: ${name} — ${service ?? 'General'}`,
        html: `
          <h2>New contact from soulcore.dev</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Service:</strong> ${service ?? 'Not specified'}</p>
          <p><strong>Budget:</strong> ${budget ?? 'Not specified'}</p>
          <p><strong>Message:</strong></p>
          <blockquote>${message}</blockquote>
          <p><em>Lead ID: ${leadId}</em></p>
        `,
      })
    } catch (err) {
      console.error('Email send error:', err)
    }
  }

  // TODO: save to Supabase leads table when DB is connected

  return NextResponse.json({
    success: true,
    lead_id: leadId,
    message: 'Gracias por contactarnos. Te responderemos pronto.',
  })
}
