'use client'

import { useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  KeyRound, LogOut, Package, LayoutDashboard, Monitor, Mail, Loader2
} from 'lucide-react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

interface CustomerInfo {
  token: string
  email: string
  name: string
}

function CustomerLogin({ onLogin }: { onLogin: (info: CustomerInfo) => void }) {
  const t = useTranslations('account')
  const [email, setEmail] = useState('')
  const [licenseKey, setLicenseKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE}/api/licenses/auth/customer/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, license_key: licenseKey }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `Error ${res.status}`)
      }

      const data = await res.json()
      sessionStorage.setItem('soulcore_customer_token', data.token)
      sessionStorage.setItem('soulcore_customer_email', data.email)
      onLogin({ token: data.token, email: data.email, name: data.name })
    } catch (err: any) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-soul-dark pt-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md mx-4"
      >
        <div className="bg-soul-dark-card rounded-2xl border border-gray-800 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-soul-purple/20 flex items-center justify-center mx-auto mb-4">
              <KeyRound size={32} className="text-soul-purple" />
            </div>
            <h2 className="text-2xl font-bold text-white">{t('portalTitle')}</h2>
            <p className="text-gray-400 mt-2">{t('portalSubtitle')}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">{t('email')}</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError('') }}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-soul-dark-lighter border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-soul-purple transition-colors text-white placeholder-gray-500"
                  required
                  autoFocus
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">{t('licenseKey')}</label>
              <div className="relative">
                <KeyRound size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={licenseKey}
                  onChange={(e) => { setLicenseKey(e.target.value); setError('') }}
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  className="w-full pl-10 pr-4 py-3 bg-soul-dark-lighter border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-soul-purple transition-colors text-white font-mono placeholder-gray-500"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-soul-purple hover:bg-soul-purple-dark rounded-xl font-semibold text-white transition-all duration-200 glow-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {t('signingIn')}
                </>
              ) : (
                t('signIn')
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

export default function AccountLayout({ children }: { children: ReactNode }) {
  const t = useTranslations('account')
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [customerName, setCustomerName] = useState('')

  useEffect(() => {
    setMounted(true)
    verifySession()
  }, [])

  async function verifySession() {
    const token = sessionStorage.getItem('soulcore_customer_token')
    if (!token) {
      setAuthenticated(false)
      return
    }

    try {
      const res = await fetch(`${API_BASE}/api/licenses/auth/customer/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        setCustomerName(data.name || data.email || '')
        setAuthenticated(true)
      } else {
        sessionStorage.removeItem('soulcore_customer_token')
        sessionStorage.removeItem('soulcore_customer_email')
        setAuthenticated(false)
      }
    } catch {
      setAuthenticated(false)
    }
  }

  function handleLogin(info: CustomerInfo) {
    setCustomerName(info.name || info.email)
    setAuthenticated(true)
  }

  function handleLogout() {
    sessionStorage.removeItem('soulcore_customer_token')
    sessionStorage.removeItem('soulcore_customer_email')
    setAuthenticated(false)
    router.push(`/${locale}`)
  }

  if (!mounted) return null
  if (!authenticated) return <CustomerLogin onLogin={handleLogin} />

  const navItems = [
    { href: `/${locale}/account`, icon: LayoutDashboard, label: t('dashboard') },
    { href: `/${locale}/account/products`, icon: Package, label: t('myProducts') },
    { href: `/${locale}/account/devices`, icon: Monitor, label: t('myDevices') },
  ]

  const isActive = (href: string) => {
    if (href === `/${locale}/account`) {
      return pathname === `/${locale}/account` || pathname === `/${locale}/account/`
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-soul-dark pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Account Header Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 bg-soul-dark-card rounded-2xl border border-gray-800 p-4 gap-4"
        >
          <div className="flex items-center gap-1 flex-wrap">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-2 rounded-xl transition-all ${
                  isActive(item.href)
                    ? 'text-white bg-soul-purple/20 border border-soul-purple/30'
                    : 'text-gray-400 hover:text-white hover:bg-soul-dark-lighter'
                }`}
              >
                <item.icon size={18} className="mr-2" />
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4">
            {customerName && (
              <span className="text-sm text-gray-400">
                {customerName}
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
