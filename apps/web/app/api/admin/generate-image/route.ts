import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

/**
 * POST /api/admin/generate-image
 *
 * Generates an AI image using Gemini and saves directly to public/generated/.
 * No external service needed — calls Gemini API from server-side.
 *
 * Body:
 *   - prompt: string
 *   - filename: string (e.g. "store-hero-bg.png")
 *   - aspectRatio?: string (e.g. "16:9", "1:1")
 */

const MODELS = [
  'gemini-3.1-flash-image-preview',
  'gemini-3-pro-image-preview',
  'gemini-2.5-flash-image',
] as const

// Always use AI Studio endpoint — works with both AIza and AQ. keys
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models'

async function callGemini(
  model: string,
  prompt: string,
  apiKey: string
): Promise<{ imageData: string; mimeType: string } | null> {
  const url = `${GEMINI_BASE_URL}/${model}:generateContent?key=${apiKey}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `Generate a high-quality professional image. Output ONLY the image.\n\n${prompt}` }] }],
      generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
    }),
  })

  if (!res.ok) {
    console.error(`Gemini ${model} error (${res.status}):`, await res.text())
    return null
  }

  const data = await res.json()
  const parts = data.candidates?.[0]?.content?.parts ?? []

  for (const part of parts) {
    if (part.inlineData?.data && part.inlineData?.mimeType?.startsWith('image/')) {
      return { imageData: part.inlineData.data, mimeType: part.inlineData.mimeType }
    }
  }

  return null
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'GOOGLE_GEMINI_API_KEY not configured' }, { status: 503 })
    }

    const body = await request.json()
    const { prompt, filename } = body

    if (!prompt || !filename) {
      return NextResponse.json({ error: 'prompt and filename are required' }, { status: 400 })
    }

    // Sanitize filename — only allow alphanumeric, hyphens, dots
    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '')
    if (!safeFilename || !safeFilename.endsWith('.png')) {
      return NextResponse.json({ error: 'filename must end in .png' }, { status: 400 })
    }

    // Try each model in order
    let result: { imageData: string; mimeType: string } | null = null
    let usedModel = ''

    for (const model of MODELS) {
      result = await callGemini(model, prompt, apiKey)
      if (result) {
        usedModel = model
        break
      }
    }

    if (!result) {
      return NextResponse.json({ error: 'All models failed to generate image' }, { status: 502 })
    }

    // Save to public/generated/
    const generatedDir = join(process.cwd(), 'public', 'generated')
    if (!existsSync(generatedDir)) {
      await mkdir(generatedDir, { recursive: true })
    }

    const filePath = join(generatedDir, safeFilename)
    const buffer = Buffer.from(result.imageData, 'base64')
    await writeFile(filePath, buffer)

    return NextResponse.json({
      url: `/generated/${safeFilename}?t=${Date.now()}`,
      model: usedModel,
      size: buffer.length,
    }, { status: 201 })
  } catch (err) {
    console.error('Image generation error:', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
