const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`)
  return res.json()
}

// --- Types ---

export interface Product {
  id: number
  name: string
  slug: string
  tagline: string
  description: string
  icon: string
  category: string
  color: string           // tailwind gradient
  tech_stack: string      // JSON array of tech tags
  version: string         // e.g. "1.2.0"
  updated_at: string      // e.g. "2026-04-01"
  demo_url: string        // live demo link
  author: string          // e.g. "SoulCore Dev"
  author_avatar: string
  price_cents: number
  price_type: string
  badge: string
  downloads: number
  rating: number          // 0-50 (4.8 = 48)
  review_count: number
  features: string        // JSON array
  specs: string           // JSON object
  whop_product_id?: string
  features_mask: number
  visible: boolean
}

export interface ProductListResponse {
  data: Product[]
}

// Compat aliases
export type WhopProduct = Product
export type WhopPlan = { id: string; product_id: string; plan_type: string; billing_period?: string; initial_price: number; currency: string; name?: string }
export type WhopListResponse<T> = { data: T[] }

// --- Helpers ---

export function formatPrice(cents: number, type: string): string {
  if (cents === 0) return 'Free'
  const dollars = (cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)
  const suffix = type === 'monthly' ? '/mo' : type === 'yearly' ? '/yr' : ''
  return `$${dollars}${suffix}`
}

export function formatRating(rating: number): string {
  return (rating / 10).toFixed(1)
}

export function parseFeatures(json: string): string[] {
  try { return JSON.parse(json) } catch { return [] }
}

export function parseSpecs(json: string): Record<string, string> {
  try { return JSON.parse(json) } catch { return {} }
}

export function parseTechStack(json: string): string[] {
  try { return JSON.parse(json) } catch { return [] }
}

export function timeAgo(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const days = Math.floor((now.getTime() - date.getTime()) / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

// --- Products (public, no auth needed) ---

export const getProducts = async (): Promise<ProductListResponse> => {
  try {
    const res = await apiFetch<{ data: Product[] }>('/api/licenses/products')
    return { data: res.data || [] }
  } catch {
    return { data: [] }
  }
}

export const getProduct = async (id: string): Promise<Product | null> => {
  try {
    return await apiFetch<Product>(`/api/licenses/products/${id}`)
  } catch {
    return null
  }
}

// Admin operations must go through server-side API routes (not client-side)
// The service secret is only available server-side via LICENSE_SERVICE_SECRET env var
export const createProduct = async (data: Partial<Product> & { name: string; slug: string }): Promise<Product> => {
  return apiFetch<Product>('/api/admin/products', {
    method: 'POST',
    body: JSON.stringify({
      name: data.name,
      slug: data.slug,
      tagline: data.tagline || '',
      description: data.description || '',
      icon: data.icon || 'Package',
      category: data.category || '',
      price_cents: data.price_cents || 0,
      price_type: data.price_type || 'one_time',
      badge: data.badge || '',
      features: data.features || '[]',
      specs: data.specs || '{}',
      features_mask: data.features_mask || 65535,
    }),
  })
}

export const deleteProduct = async (_id: string): Promise<void> => {
  console.warn('Delete not implemented yet')
}

export const getMemberships = async () => ({ data: [] })
export const getPlans = async () => ({ data: [] })
export const createCheckout = async (_planId: string, _redirectUrl?: string) => {
  throw new Error('Checkout requires Whop — coming soon')
}
