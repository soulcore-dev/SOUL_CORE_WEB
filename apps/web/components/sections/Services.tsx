'use client'


import Link from 'next/link'
import {
  Bot,
  Code,
  Cog,
  Shield,
  Plug,
  Palette,
  ShoppingCart,
  BarChart3,
  GraduationCap,
  ArrowRight,
  Database,
  Cloud,
  RefreshCcw,
  FileText
} from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'

const serviceKeys = [
  { key: 'ai', icon: Bot, color: 'from-purple-500 to-violet-600' },
  { key: 'software', icon: Code, color: 'from-blue-500 to-cyan-600' },
  { key: 'industrial', icon: Cog, color: 'from-orange-500 to-amber-600' },
  { key: 'cybersecurity', icon: Shield, color: 'from-red-500 to-rose-600' },
  { key: 'integrations', icon: Plug, color: 'from-indigo-500 to-purple-600' },
  { key: 'design', icon: Palette, color: 'from-pink-500 to-rose-600' },
  { key: 'ecommerce', icon: ShoppingCart, color: 'from-teal-500 to-cyan-600' },
  { key: 'marketing', icon: BarChart3, color: 'from-red-500 to-orange-600' },
  { key: 'mentoring', icon: GraduationCap, color: 'from-yellow-500 to-amber-600' },
  { key: 'data', icon: Database, color: 'from-cyan-500 to-blue-600' },
  { key: 'cloud', icon: Cloud, color: 'from-sky-500 to-indigo-600' },
  { key: 'legacy', icon: RefreshCcw, color: 'from-violet-500 to-fuchsia-600' },
]

export function Services() {
  const t = useTranslations('services')
  const locale = useLocale()

  return (
    <section id="servicios" className="py-24 bg-soul-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          
          
          
          className="text-center mb-16"
        >
          <span className="text-soul-purple font-semibold">{t('label')}</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">
            {t('title')}
          </h2>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {serviceKeys.map((service, index) => (
            <Link
              key={service.key}
              href={`/${locale}/servicios/${service.key}`}
              className="block"
            >
              <div
                
                
                
                
                className="group relative p-6 bg-soul-dark-card rounded-2xl border border-gray-800 hover:border-soul-purple/50 transition-all duration-300 overflow-hidden cursor-pointer h-full"
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                <div className="relative">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <service.icon className="text-white" size={28} />
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-soul-purple-light transition-colors">
                    {t(`items.${service.key}.title`)}
                  </h3>

                  <p className="text-gray-400 text-sm mb-4">
                    {t(`items.${service.key}.description`)}
                  </p>

                  <div className="flex items-center text-soul-purple group-hover:text-soul-purple-light transition-colors">
                    <span className="text-sm font-medium">{t('viewMore')}</span>
                    <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>

                  {service.key === 'cybersecurity' && (
                    <a
                      href={locale === 'en' ? '/cybersecurity-en.html' : '/cybersecurity.html'}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors text-xs font-medium"
                    >
                      <FileText size={12} />
                      {t('fullPortfolio')}
                    </a>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div
          
          
          
          className="mt-16 text-center"
        >
          <a
            href="#contacto"
            className="inline-flex items-center px-8 py-4 bg-soul-purple hover:bg-soul-purple-dark rounded-xl font-semibold text-white transition-all duration-200 glow-hover"
          >
            {t('cta')}
            <ArrowRight className="ml-2" size={20} />
          </a>
        </div>
      </div>
    </section>
  )
}
