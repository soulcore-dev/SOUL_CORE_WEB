import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `You are NEXUS, the AI assistant of SoulCore.dev — a dev studio that builds AI-powered software, DevSecOps infrastructure, and custom web/mobile apps. You help visitors understand SoulCore's services, answer technical questions, and guide them toward contacting the team. Be concise, helpful, and professional. Respond in the same language the user writes in. If asked about pricing, guide them to the contact form.`

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null

export async function POST(req: NextRequest) {
  const { message, session_id } = await req.json()

  if (!message || typeof message !== 'string') {
    return NextResponse.json({ error: 'message required' }, { status: 400 })
  }

  if (!anthropic) {
    return NextResponse.json({
      reply: 'Chat is currently unavailable. Please contact us via the form or WhatsApp.',
      session_id: session_id ?? crypto.randomUUID().slice(0, 8),
    })
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: message }],
    })

    const reply = response.content[0].type === 'text' ? response.content[0].text : ''

    return NextResponse.json({
      reply,
      session_id: session_id ?? crypto.randomUUID().slice(0, 8),
    })
  } catch (err) {
    console.error('Chat error:', err)
    return NextResponse.json({
      reply: 'Sorry, I encountered an error. Please try again or contact us directly.',
      session_id: session_id ?? crypto.randomUUID().slice(0, 8),
    })
  }
}
