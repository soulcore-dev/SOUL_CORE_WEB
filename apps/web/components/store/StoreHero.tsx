'use client'


import { ShoppingBag } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function StoreHero() {
  const t = useTranslations('store')

  return (
    <section className="relative pt-32 pb-16 overflow-hidden">
      <div className="absolute inset-0 bg-soul-dark">
        <img
          src="/generated/store-hero-bg.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-25"
          onError={(e: any) => { e.target.style.display = 'none' }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-soul-purple/10 via-transparent to-transparent" />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-soul-purple/20 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          
          
          className="text-center"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-soul-purple/20 border border-soul-purple/30 text-soul-purple-light text-sm font-medium mb-6">
            <ShoppingBag size={16} className="mr-2" />
            {t('badge')}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            <span className="text-white">{t('heroTitle1')}</span>
            <br />
            <span className="gradient-text">{t('heroTitle2')}</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            {t('heroSubtitle')}
          </p>
        </div>
      </div>
    </section>
  )
}
