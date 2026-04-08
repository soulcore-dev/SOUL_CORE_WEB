'use client'

import { useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { Lock, LogOut, Package, LayoutDashboard, User, ImageIcon, Mail } from 'lucide-react'
import { adminLogin } from '@/lib/admin-auth'

const ADMIN_SESSION_KEY = 'soulcore_admin_session'

function AdminLogin() {
  const t = useTranslations('admin')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const success = await adminLogin(password)
      if (success) {
        window.location.reload()
      } else {
        setError(t('loginError'))
      }
    } catch {
      setError(t('connectionError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-soul-dark pt-20">
      <div className="w-full max-w-md">
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
              <label className="block text-sm font-medium text-gray-400 mb-1.5">{t('passwordPlaceholder')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                placeholder="••••••••"
                className={`w-full px-4 py-3 bg-soul-dark-lighter border rounded-xl focus:outline-none focus:ring-2 focus:ring-soul-purple transition-colors text-white ${
                  error ? 'border-red-500' : 'border-gray-700'
                }`}
                autoFocus
                autoComplete="current-password"
              />
              {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </div>
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-3 bg-soul-purple hover:bg-soul-purple-dark rounded-xl font-semibold text-white transition-all duration-200 glow-hover disabled:opacity-50"
            >
              {loading ? t('signingIn') : t('loginButton')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const locale = useLocale()
  const t = useTranslations('admin')
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const session = sessionStorage.getItem(ADMIN_SESSION_KEY)
    if (session === 'authenticated') {
      setAuthenticated(true)
    }
  }, [])

  if (!mounted) return null
  if (!authenticated) return <AdminLogin />

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY)
    router.push(`/${locale}`)
  }

  const navItems = [
    { href: `/${locale}/admin`, icon: LayoutDashboard, label: t('dashboard') },
    { href: `/${locale}/admin/products`, icon: Package, label: t('products') },
    { href: `/${locale}/admin/imagenes`, icon: ImageIcon, label: 'Images' },
    { href: `/${locale}/admin/emails`, icon: Mail, label: 'Emails' },
  ]

  return (
    <div className="min-h-screen bg-soul-dark pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8 bg-soul-dark-card rounded-2xl border border-gray-800 p-4">
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
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut size={18} className="mr-2" />
              {t('logout')}
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
