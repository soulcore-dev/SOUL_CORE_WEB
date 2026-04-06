'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { createProduct } from '@/lib/api'

export default function NewProductPage() {
  const t = useTranslations('adminNewProduct')
  const locale = useLocale()
  const router = useRouter()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [slug, setSlug] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const autoSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setSaving(true)
    setError(null)

    try {
      await createProduct({
        name,
        slug: slug || autoSlug,
        description,
      })
      router.push(`/${locale}/admin/products`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="pb-24 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Link
          href={`/${locale}/admin/products`}
          className="inline-flex items-center text-gray-400 hover:text-soul-purple transition-colors mb-8"
        >
          <ArrowLeft size={18} className="mr-2" />
          {t('back')}
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-soul-dark-card rounded-2xl border border-gray-800 p-8"
      >
        <h1 className="text-2xl font-bold text-white mb-8">{t('title')}</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">{t('productName')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-soul-dark-lighter border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-soul-purple text-white"
              placeholder={t('namePlaceholder')}
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Slug</label>
            <input
              type="text"
              value={slug || autoSlug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-4 py-3 bg-soul-dark-lighter border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-soul-purple text-white font-mono text-sm"
              placeholder="auto-generated-from-name"
            />
            <p className="text-gray-500 text-xs mt-1">URL-friendly identifier</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">{t('description')}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-soul-dark-lighter border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-soul-purple text-white resize-none"
              placeholder={t('descriptionPlaceholder')}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="w-full py-4 bg-soul-purple hover:bg-soul-purple-dark rounded-xl font-semibold text-white transition-all duration-200 glow-hover flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                <Save size={20} className="mr-2" />
                {t('createProduct')}
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
