'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { Package, Plus, Trash2, Loader2 } from 'lucide-react'
import { getProducts, deleteProduct, type Product } from '@/lib/api'

export default function AdminProductsPage() {
  const t = useTranslations('adminProducts')
  const locale = useLocale()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    try {
      const res = await getProducts()
      setProducts(res.data || [])
    } catch {
      // Handle error
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(t('confirmDelete'))) return
    setDeleting(id)
    try {
      await deleteProduct(id)
      setProducts((prev) => prev.filter((p) => String(p.id) !== id))
    } catch {
      // Handle error
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
          <p className="text-gray-400 mt-1">{t('subtitle')}</p>
        </div>
        <Link
          href={`/${locale}/admin/products/new`}
          className="flex items-center px-6 py-3 bg-soul-purple hover:bg-soul-purple-dark rounded-xl font-medium text-white transition-all duration-200 glow-hover"
        >
          <Plus size={20} className="mr-2" />
          {t('newProduct')}
        </Link>
      </div>

      {/* Products List */}
      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 size={32} className="animate-spin text-soul-purple" />
        </div>
      ) : products.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-soul-dark-card rounded-2xl border border-gray-800 p-12 text-center"
        >
          <Package size={48} className="text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">{t('emptyTitle')}</h3>
          <p className="text-gray-400 mb-6">{t('emptySubtitle')}</p>
          <Link
            href={`/${locale}/admin/products/new`}
            className="inline-flex items-center px-6 py-3 bg-soul-purple rounded-xl text-white hover:bg-soul-purple-dark transition-colors"
          >
            <Plus size={18} className="mr-2" />
            {t('createFirst')}
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-soul-dark-card rounded-2xl border border-gray-800 p-6 flex items-center justify-between hover:border-gray-700 transition-colors"
            >
              <div className="flex items-center">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-soul-purple to-violet-600 flex items-center justify-center mr-4">
                  <Package size={28} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-gray-500 text-xs font-mono">{product.slug}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/${locale}/admin/products/${product.id}`}
                  className="px-4 py-2 border border-gray-700 rounded-xl text-gray-300 hover:text-white hover:border-soul-purple transition-colors text-sm"
                >
                  {t('edit')}
                </Link>
                <button
                  onClick={() => handleDelete(String(product.id))}
                  disabled={deleting === String(product.id)}
                  className="p-2 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                >
                  {deleting === String(product.id) ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Trash2 size={18} />
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
