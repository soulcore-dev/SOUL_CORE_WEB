import { NextRequest, NextResponse } from 'next/server'
import { sendFreeLicense, sendWelcome } from '@/lib/email/service'

const LICENSE_API = process.env.LICENSE_API_URL || 'http://127.0.0.1:8090'
const SERVICE_SECRET = process.env.LICENSE_SERVICE_SECRET || ''

export async function POST(request: NextRequest) {
  const { email, product_slug } = await request.json()

  if (!email || !product_slug) {
    return NextResponse.json(
      { error: 'email and product_slug required' },
      { status: 400 }
    )
  }

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  try {
    // Generate free license via license-server
    const res = await fetch(`${LICENSE_API}/api/v1/licenses/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SERVICE_SECRET}`,
      },
      body: JSON.stringify({
        customer_email: email,
        product_slug: product_slug,
        expires_in_days: 0, // perpetual for free products
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[free-license] License server error:', err)
      return NextResponse.json(
        { error: 'Failed to generate license' },
        { status: 502 }
      )
    }

    const data = await res.json()

    // Send emails (fire-and-forget, don't block response)
    sendWelcome(email).catch(() => {})
    sendFreeLicense(email, {
      productName: data.product_name,
      licenseKey: data.license_key,
      repoUrl: `https://github.com/soulcore-dev/${product_slug}`,
    }).catch(() => {})

    return NextResponse.json({
      license_key: data.license_key,
      product_name: data.product_name,
    })
  } catch (err) {
    console.error('[free-license] Error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
