'use client'

import { useState, useEffect } from 'react'

import { Search, Filter, Loader2, Package, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { StoreHero } from '@/components/store/StoreHero'
import { ProductCard } from '@/components/store/ProductCard'
import { getProducts, type Product } from '@/lib/api'

export default function StorePage() {
  const t = useTranslations('store')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await getProducts()
        setProducts(res.data || [])
      } catch {
        // getProducts already returns empty array on error
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [])

  const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))]

  const filtered = products.filter(p => {
    const matchesSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = category === 'all' || p.category === category
    return matchesSearch && matchesCategory
  })

  return (
    <>
      <StoreHero />

      <section className="py-6 md:py-12 bg-soul-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters Bar — only show when there are products */}
          {products.length > 0 && (
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-6 md:mb-12">
              <div className="relative flex-1">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-soul-dark-card border border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-soul-purple focus:border-soul-purple transition-colors text-white placeholder-gray-500"
                />
              </div>
              {categories.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat || 'all'}
                      onClick={() => setCategory(cat || 'all')}
                      className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                        category === cat
                          ? 'bg-soul-purple text-white'
                          : 'bg-soul-dark-card text-gray-400 hover:text-white border border-gray-800'
                      }`}
                    >
                      <Filter size={16} className="inline mr-1" />
                      {cat === 'all' ? t('allCategories') : cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Products Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={32} className="text-soul-purple animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              {/* 3-layer empty state */}
              <div className="relative w-48 h-48 mx-auto mb-6">
                <div className="absolute inset-0 z-[1] flex items-center justify-center">
                  <div className="w-20 h-20 rounded-2xl bg-soul-purple/20 flex items-center justify-center">
                    <Package size={40} className="text-soul-purple" />
                  </div>
                </div>
                <img
                  src="/generated/empty-store.png"
                  alt=""
                  className="absolute inset-0 w-full h-full object-contain z-[2]"
                  onError={(e: any) => { e.target.style.display = 'none' }}
                />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">{t('noProducts')}</h3>
              <div className="inline-flex items-center px-6 py-3 rounded-full bg-soul-dark-card border border-dashed border-soul-purple/30 mt-4">
                <Sparkles size={18} className="text-soul-purple mr-2" />
                <span className="text-gray-400">{t('comingSoon')}</span>
              </div>
            </div>
          ) : (
            <div className={`grid gap-4 md:gap-8 ${filtered.length === 1 ? 'grid-cols-1 max-w-md mx-auto' : filtered.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
              {filtered.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
