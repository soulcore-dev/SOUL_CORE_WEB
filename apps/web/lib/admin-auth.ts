'use client'

const ADMIN_STORAGE_KEY = 'soulcore_admin_session'

export function isAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem(ADMIN_STORAGE_KEY) === 'authenticated'
}

export async function adminLogin(password: string): Promise<boolean> {
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      sessionStorage.setItem(ADMIN_STORAGE_KEY, 'authenticated')
      return true
    }
    return false
  } catch {
    return false
  }
}

export function adminLogout(): void {
  sessionStorage.removeItem(ADMIN_STORAGE_KEY)
}
