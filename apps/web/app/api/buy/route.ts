import { NextRequest, NextResponse } from 'next/server'

const LICENSE_API = process.env.LICENSE_API_URL || 'http://127.0.0.1:8090'
const SERVICE_SECRET = process.env.LICENSE_SERVICE_SECRET || ''

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('product')
  if (!slug) {
    return NextResponse.json({ error: 'product slug required' }, { status: 400 })
  }

  try {
    // Fetch product from license-server
    const res = await fetch(`${LICENSE_API}/api/v1/products`, {
      headers: { Authorization: `Bearer ${SERVICE_SECRET}` },
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 502 })
    }

    const products = await res.json()
    const product = (products as any[]).find(
      (p) => p.slug === slug || String(p.id) === slug
    )

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Free product → redirect to free flow
    if (product.price_cents === 0) {
      const locale = request.nextUrl.searchParams.get('locale') || 'es'
      return NextResponse.redirect(
        new URL(`/${locale}/account?free=${encodeURIComponent(product.slug)}`, request.url)
      )
    }

    // Paid product → redirect to Whop checkout
    if (!product.whop_product_id) {
      return NextResponse.json(
        { error: 'Product not configured for checkout' },
        { status: 501 }
      )
    }

    return NextResponse.redirect(`https://whop.com/checkout/${product.whop_product_id}/`)
  } catch (err) {
    console.error('[buy] Error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
