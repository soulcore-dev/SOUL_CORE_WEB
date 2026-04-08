'use client'

import { useState, useEffect } from 'react'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { Package, Users, CreditCard, TrendingUp, Plus, ArrowRight, Loader2 } from 'lucide-react'
import { getProducts, getMemberships, type WhopProduct } from '@/lib/api'

export default function AdminDashboard() {
  const t = useTranslations('admin')
  const locale = useLocale()
  const [products, setProducts] = useState<WhopProduct[]>([])
  const [membershipCount, setMembershipCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [prodsRes, membsRes] = await Promise.all([
          getProducts(),
          getMemberships(),
        ])
        setProducts(prodsRes.data || [])
        setMembershipCount(membsRes.data?.length || 0)
      } catch {
        // Silently fail — dashboard still loads
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const stats = [
    { icon: Package, label: t('totalProducts'), value: products.length, color: 'from-violet-500 to-purple-600' },
    { icon: Users, label: t('activeMembers'), value: membershipCount, color: 'from-emerald-500 to-green-600' },
    { icon: CreditCard, label: t('revenue'), value: '—', color: 'from-pink-500 to-rose-600' },
    { icon: TrendingUp, label: t('growth'), value: '—', color: 'from-blue-500 to-cyan-600' },
  ]

  return (
    <div className="pb-24">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="bg-soul-dark-card rounded-2xl border border-gray-800 p-6"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
              <stat.icon size={24} className="text-white" />
            </div>
            <p className="text-gray-400 text-sm">{stat.label}</p>
            <p className="text-3xl font-bold text-white mt-1">
              {loading ? <Loader2 size={24} className="animate-spin text-gray-500" /> : stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-soul-dark-card rounded-2xl border border-gray-800 p-6 mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">{t('quickActions')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href={`/${locale}/admin/products/new`}
            className="flex items-center p-4 bg-soul-dark-lighter rounded-xl hover:bg-soul-purple/20 transition-colors group"
          >
            <div className="w-12 h-12 rounded-xl bg-soul-purple/20 flex items-center justify-center mr-4">
              <Plus className="text-soul-purple" size={24} />
            </div>
            <div>
              <p className="text-white font-medium group-hover:text-soul-purple-light">{t('newProduct')}</p>
              <p className="text-gray-400 text-sm">{t('newProductDesc')}</p>
            </div>
          </Link>
          <Link
            href={`/${locale}/admin/products`}
            className="flex items-center p-4 bg-soul-dark-lighter rounded-xl hover:bg-soul-purple/20 transition-colors group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mr-4">
              <Package className="text-emerald-500" size={24} />
            </div>
            <div>
              <p className="text-white font-medium group-hover:text-soul-purple-light">{t('manageProducts')}</p>
              <p className="text-gray-400 text-sm">{t('manageProductsDesc')}</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Products */}
      <div className="bg-soul-dark-card rounded-2xl border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">{t('recentProducts')}</h2>
          <Link
            href={`/${locale}/admin/products`}
            className="text-soul-purple hover:text-soul-purple-light text-sm flex items-center"
          >
            {t('viewAll')} <ArrowRight size={14} className="ml-1" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 size={24} className="animate-spin text-gray-500" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">{t('noProductsYet')}</p>
            <Link
              href={`/${locale}/admin/products/new`}
              className="inline-flex items-center mt-4 px-6 py-3 bg-soul-purple rounded-xl text-white hover:bg-soul-purple-dark transition-colors"
            >
              <Plus size={18} className="mr-2" />
              {t('createFirst')}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {products.slice(0, 5).map((product) => (
              <Link
                key={product.id}
                href={`/${locale}/admin/products/${product.id}`}
                className="flex items-center justify-between p-4 bg-soul-dark-lighter rounded-xl hover:bg-soul-purple/10 transition-colors group"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-lg bg-soul-purple/20 flex items-center justify-center mr-3">
                    <Package size={20} className="text-soul-purple" />
                  </div>
                  <div>
                    <p className="text-white font-medium group-hover:text-soul-purple-light">{product.name}</p>
                    <p className="text-gray-500 text-sm font-mono">{product.slug}</p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-gray-600 group-hover:text-soul-purple" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
