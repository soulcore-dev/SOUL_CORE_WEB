'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import {
  Package, Monitor, ShieldCheck, ArrowRight, Loader2, User
} from 'lucide-react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

interface PortalProduct {
  id: number
  product_name: string
  license_key: string
  status: string
  issued_at: string
  expires_at: string
}

interface PortalDevice {
  id: number
  product_name: string
  machine_hash: string
  bound_at: string
  status: string
}

export default function AccountDashboard() {
  const locale = useLocale()
  const [products, setProducts] = useState<PortalProduct[]>([])
  const [devices, setDevices] = useState<PortalDevice[]>([])
  const [loading, setLoading] = useState(true)
  const [customerEmail, setCustomerEmail] = useState('')

  useEffect(() => {
    setCustomerEmail(sessionStorage.getItem('soulcore_customer_email') || '')
    loadData()
  }, [])

  async function loadData() {
    const token = sessionStorage.getItem('soulcore_customer_token')
    if (!token) return

    try {
      const [prodRes, devRes] = await Promise.all([
        fetch(`${API_BASE}/api/licenses/portal/products`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/api/licenses/portal/devices`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (prodRes.ok) {
        const data = await prodRes.json()
        setProducts(data.data || data || [])
      }
      if (devRes.ok) {
        const data = await devRes.json()
        setDevices(data.data || data || [])
      }
    } catch {
      // silently fail — stats will show 0
    } finally {
      setLoading(false)
    }
  }

  const activeCount = products.filter(p => p.status === 'active').length

  const stats = [
    {
      label: 'Total Products',
      value: products.length,
      icon: Package,
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
    },
    {
      label: 'Active Licenses',
      value: activeCount,
      icon: ShieldCheck,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Bound Devices',
      value: devices.length,
      icon: Monitor,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
  ]

  const quickLinks = [
    {
      title: 'My Products',
      description: 'View your licenses, copy keys, and check status',
      href: `/${locale}/account/products`,
      icon: Package,
    },
    {
      title: 'My Devices',
      description: 'Manage bound devices and rebind counts',
      href: `/${locale}/account/devices`,
      icon: Monitor,
    },
  ]

  return (
    <div className="pb-12">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-soul-purple/20 flex items-center justify-center">
            <User size={20} className="text-soul-purple" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            {customerEmail && (
              <p className="text-gray-400 text-sm">{customerEmail}</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-soul-purple" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-soul-dark-card rounded-2xl border border-gray-800 p-6"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <stat.icon size={24} className={stat.color} />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                    <p className="text-sm text-gray-400">{stat.label}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickLinks.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <Link
                  href={link.href}
                  className="group flex items-center justify-between bg-soul-dark-card rounded-2xl border border-gray-800 p-6 hover:border-soul-purple/50 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-soul-purple/10 flex items-center justify-center group-hover:bg-soul-purple/20 transition-colors">
                      <link.icon size={24} className="text-soul-purple" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{link.title}</h3>
                      <p className="text-sm text-gray-400">{link.description}</p>
                    </div>
                  </div>
                  <ArrowRight size={20} className="text-gray-600 group-hover:text-soul-purple transition-colors" />
                </Link>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
