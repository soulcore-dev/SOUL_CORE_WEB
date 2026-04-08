'use client'


import { Boxes, Plug, Brain, ArrowRight, Sparkles, ShoppingBag } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import Link from 'next/link'

const productData = [
  {
    key: 'vmof',
    icon: Boxes,
    color: 'from-violet-500 to-purple-600',
    statusKey: 'available',
  },
  {
    key: 'mcp',
    icon: Plug,
    color: 'from-emerald-500 to-green-600',
    statusKey: 'available',
  },
  {
    key: 'soulcore',
    icon: Brain,
    color: 'from-pink-500 to-rose-600',
    statusKey: 'enterprise',
  },
]

export function Products() {
  const t = useTranslations('products')
  const locale = useLocale()

  return (
    <section id="productos" className="py-24 bg-soul-dark relative overflow-hidden">
      <img
        src="/generated/products-header.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-15 ai-bg-img"
        onError={(e: any) => { e.target.style.display = 'none' }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-soul-purple font-semibold">{t('label')}</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">
            {t('title')}
          </h2>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {productData.map((product, index) => {
            const features = t.raw(`items.${product.key}.features`) as string[]
            return (
              <div
                key={product.key}
                
                
                
                
                className="group relative bg-soul-dark-card rounded-2xl border border-gray-800 overflow-hidden hover:border-soul-purple/50 transition-all duration-300"
              >
                {/* Gradient Header */}
                <div className={`h-32 bg-gradient-to-br ${product.color} relative`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <product.icon aria-hidden="true" size={48} className="!text-white" />
                  </div>
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      product.statusKey === 'available'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-purple-500/20 text-purple-400'
                    }`}>
                      {t(product.statusKey)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-2xl font-bold text-white">{t(`items.${product.key}.name`)}</h3>
                    <Sparkles size={20} className="text-soul-purple" />
                  </div>
                  <p className="text-soul-purple-light text-sm mb-4">{t(`items.${product.key}.fullName`)}</p>
                  <p className="text-gray-400 mb-6">{t(`items.${product.key}.description`)}</p>

                  {/* Features */}
                  <ul className="space-y-2 mb-6">
                    {features.map((feature: string) => (
                      <li key={feature} className="flex items-center text-gray-300 text-sm">
                        <div className="w-1.5 h-1.5 bg-soul-purple rounded-full mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <a href="#contacto" className="w-full py-3 border border-soul-purple/50 rounded-xl text-soul-purple hover:bg-soul-purple hover:!text-white transition-all duration-200 flex items-center justify-center group">
                    <span>{t('moreInfo')}</span>
                    <ArrowRight aria-hidden="true" size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            )
          })}
        </div>

        {/* Store CTA */}
        <div className="mt-10 text-center">
          <Link
            href={`/${locale}/store`}
            className="inline-flex items-center px-8 py-4 bg-soul-purple hover:bg-soul-purple-dark rounded-xl font-semibold !text-white transition-all duration-200 glow-hover group"
          >
            <ShoppingBag size={20} className="mr-2" aria-hidden="true" />
            {locale === 'es' ? 'Explorar Tienda' : locale === 'pt' ? 'Explorar Loja' : locale === 'fr' ? 'Explorer la Boutique' : locale === 'de' ? 'Shop erkunden' : 'Explore Store'}
            <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </Link>
        </div>

        {/* Coming Soon */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-soul-dark-card border border-dashed border-soul-purple/30">
            <Sparkles size={18} className="text-soul-purple mr-2" aria-hidden="true" />
            <span className="text-gray-400">
              <strong className="text-white">{t('comingSoon')}</strong> {t('vmofSaas')}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
