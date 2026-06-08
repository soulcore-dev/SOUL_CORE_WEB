import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Empty default = same-origin relative paths. Caddy routes /api/* to
// the Next.js container on prod. Setting NEXT_PUBLIC_API_URL only makes
// sense for a cross-origin dev server (rare).
export const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

export async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_URL}${endpoint}`
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`)
  }

  return response.json()
}
