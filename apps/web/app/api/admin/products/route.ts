import { NextRequest, NextResponse } from 'next/server'

const LICENSE_API = process.env.LICENSE_API_URL || 'http://localhost:8090'
const SERVICE_SECRET = process.env.LICENSE_SERVICE_SECRET || ''

export async function POST(request: NextRequest) {
  if (!SERVICE_SECRET) {
    return NextResponse.json(
      { error: 'Service not configured' },
      { status: 503 }
    )
  }

  const body = await request.json()

  const res = await fetch(`${LICENSE_API}/api/v1/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_SECRET}`,
    },
    body: JSON.stringify(body),
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
