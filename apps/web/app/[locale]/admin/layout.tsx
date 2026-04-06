'use client'

import { useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { Lock, LogOut, Package, LayoutDashboard, User } from 'lucide-react'

const ADMIN_TOKEN_KEY = 'soulcore_admin_token'
const ADMIN_USER_KEY = 'soulcore_admin_user'

function AdminLogin() {
  const t = useTranslations('admin')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/licenses/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error === 'invalid_credentials'
          ? (t('loginError'))
          : 'Error del servidor')
        return
      }

      sessionStorage.setItem(ADMIN_TOKEN_KEY, data.token)
      sessionStorage.setItem(ADMIN_USER_KEY, JSON.stringify({ username: data.username, role: data.role }))
      window.location.reload()
    } catch {
      setError('No se pudo conectar al servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-soul-dark pt-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-soul-dark-card rounded-2xl border border-gray-800 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-soul-purple/20 flex items-center justify-center mx-auto mb-4">
              <Lock size={32} className="text-soul-purple" />
            </div>
            <h2 className="text-2xl font-bold text-white">{t('loginTitle')}</h2>
            <p className="text-gray-400 mt-2">{t('loginSubtitle')}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Usuario</label>
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError('') }}
                placeholder="admin"
                className="w-full px-4 py-3 bg-soul-dark-lighter border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-soul-purple transition-colors text-white"
                autoFocus
                autoComplete="username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">{t('passwordPlaceholder')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                placeholder="••••••••"
                className={`w-full px-4 py-3 bg-soul-dark-lighter border rounded-xl focus:outline-none focus:ring-2 focus:ring-soul-purple transition-colors text-white ${
                  error ? 'border-red-500' : 'border-gray-700'
                }`}
                autoComplete="current-password"
              />
              {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </div>
            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full py-3 bg-soul-purple hover:bg-soul-purple-dark rounded-xl font-semibold text-white transition-all duration-200 glow-hover disabled:opacity-50"
            >
              {loading ? 'Accediendo...' : t('loginButton')}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const locale = useLocale()
  const t = useTranslations('admin')
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(false)
  const [adminUser, setAdminUser] = useState<{ username: string; role: string } | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const token = sessionStorage.getItem(ADMIN_TOKEN_KEY)
    if (token) {
      // Verify session is still valid
      fetch('/api/licenses/auth/admin/me', {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => {
        if (res.ok) {
          setAuthenticated(true)
          try {
            const user = JSON.parse(sessionStorage.getItem(ADMIN_USER_KEY) || '{}')
            setAdminUser(user)
          } catch { /* */ }
        } else {
          sessionStorage.removeItem(ADMIN_TOKEN_KEY)
          sessionStorage.removeItem(ADMIN_USER_KEY)
        }
      }).catch(() => {
        // Offline — allow if token exists
        setAuthenticated(true)
      })
    }
  }, [])

  if (!mounted) return null
  if (!authenticated) return <AdminLogin />

  const handleLogout = () => {
    const token = sessionStorage.getItem(ADMIN_TOKEN_KEY)
    if (token) {
      fetch('/api/licenses/auth/admin/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {})
    }
    sessionStorage.removeItem(ADMIN_TOKEN_KEY)
    sessionStorage.removeItem(ADMIN_USER_KEY)
    router.push(`/${locale}`)
  }

  const navItems = [
    { href: `/${locale}/admin`, icon: LayoutDashboard, label: t('dashboard') },
    { href: `/${locale}/admin/products`, icon: Package, label: t('products') },
  ]

  return (
    <div className="min-h-screen bg-soul-dark pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8 bg-soul-dark-card rounded-2xl border border-gray-800 p-4"
        >
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center px-4 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-soul-dark-lighter transition-all"
              >
                <item.icon size={18} className="mr-2" />
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {adminUser && (
              <span className="flex items-center text-gray-500 text-sm">
                <User size={14} className="mr-1" />
                {adminUser.username}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut size={18} className="mr-2" />
              {t('logout')}
            </button>
          </div>
        </motion.div>
        {children}
      </div>
    </div>
  )
}
