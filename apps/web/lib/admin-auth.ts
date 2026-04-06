'use client'

const ADMIN_STORAGE_KEY = 'soulcore_admin_session'

export function isAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem(ADMIN_STORAGE_KEY) === 'true'
}

export function adminLogin(password: string): boolean {
  // Simple admin password check — in production this would validate against the backend
  const adminPass = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'soulcore2026'
  if (password === adminPass) {
    sessionStorage.setItem(ADMIN_STORAGE_KEY, 'true')
    return true
  }
  return false
}

export function adminLogout(): void {
  sessionStorage.removeItem(ADMIN_STORAGE_KEY)
}
