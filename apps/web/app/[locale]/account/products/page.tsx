'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import {
  Package, Brain, Shield, TrendingUp, Boxes, Plug, Code, Cpu, Zap,
  Copy, Check, Loader2, Calendar, Clock
} from 'lucide-react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

const iconMap: Record<string, any> = {
  Package, Brain, Shield, TrendingUp, Boxes, Plug, Code, Cpu, Zap,
}

interface PortalProduct {
  id: number
  product_name: string
  product_icon: string
  license_key: string
  status: string
  issued_at: string
  expires_at: string
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    suspended: 'bg-red-500/10 text-red-400 border-red-500/30',
    expired: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    revoked: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
  }

  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.active}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function maskKey(key: string): string {
  if (key.length <= 15) return key
  return key.substring(0, 15) + '...'
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '-'
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export default function ProductsPage() {
  const t = useTranslations('account')
  const [products, setProducts] = useState<PortalProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<number | null>(null)

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    const token = sessionStorage.getItem('soulcore_customer_token')
    if (!token) return

    try {
      const res = await fetch(`${API_BASE}/api/licenses/portal/products`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setProducts(data.data || data || [])
      }
    } catch {
      // fail silently
    } finally {
      setLoading(false)
    }
  }

  async function copyKey(id: number, key: string) {
    try {
      await navigator.clipboard.writeText(key)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      // fallback
      const textarea = document.createElement('textarea')
      textarea.value = key
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-soul-purple" />
      </div>
    )
  }

  return (
    <div className="pb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-white mb-1">{t('productsTitle')}</h1>
        <p className="text-gray-400">{t('productsSubtitle')}</p>
      </motion.div>

      {products.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-soul-dark-card rounded-2xl border border-gray-800 p-12 text-center"
        >
          <Package size={48} className="text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg text-white font-semibold mb-2">{t('noProducts')}</h3>
          <p className="text-gray-400">{t('noProductsDesc')}</p>
        </motion.div>
      ) : (
        <div className="grid gap-4">
          {products.map((product, i) => {
            const Icon = iconMap[product.product_icon] || Package
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-soul-dark-card rounded-2xl border border-gray-800 p-6 hover:border-soul-purple/30 transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Icon + Name */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-soul-purple/10 flex items-center justify-center shrink-0">
                      <Icon size={24} className="text-soul-purple" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-white font-semibold truncate">{product.product_name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-sm text-gray-400 font-mono">{maskKey(product.license_key)}</code>
                        <button
                          onClick={() => copyKey(product.id, product.license_key)}
                          className="p-1 rounded-md hover:bg-soul-dark-lighter transition-colors"
                          title="Copy License Key"
                        >
                          {copiedId === product.id ? (
                            <Check size={14} className="text-emerald-400" />
                          ) : (
                            <Copy size={14} className="text-gray-500 hover:text-gray-300" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Status + Dates */}
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                    <StatusBadge status={product.status} />
                    <div className="flex items-center gap-1.5 text-sm text-gray-400">
                      <Calendar size={14} />
                      <span>{formatDate(product.issued_at)}</span>
                    </div>
                    {product.expires_at && (
                      <div className="flex items-center gap-1.5 text-sm text-gray-400">
                        <Clock size={14} />
                        <span>Exp: {formatDate(product.expires_at)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
