'use client'

import Link from 'next/link'
import { ArrowRight, Zap, Layers, Rocket } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function Hero() {
  const t = useTranslations('hero')

  const stats = [
    { icon: Layers, label: t('statStack') },
    { icon: Zap, value: '12', label: t('statAreas') },
    { icon: Rocket, label: t('statDelivery') },
  ]

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background */}
      <div className="absolute inset-0 bg-soul-dark">
        <div className="absolute inset-0 bg-gradient-to-br from-soul-purple/20 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-soul-purple/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-soul-purple-light/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* Badge */}
          <div className="animate-fade-in">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-soul-purple/20 border border-soul-purple/30 text-soul-purple-light text-sm font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse" />
              {t('badge')}
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <span className="text-white">{t('title1')}</span>
            <br />
            <span className="gradient-text">{t('title2')}</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {t.rich('subtitle', {
              strong: (chunks) => <strong className="text-white">{chunks}</strong>
            })}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Link
              href="#servicios"
              className="px-8 py-4 bg-soul-purple hover:bg-soul-purple-dark rounded-xl font-semibold text-white transition-all duration-200 glow-hover flex items-center group"
            >
              {t('ctaServices')}
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
            </Link>
            <Link
              href="#contacto"
              className="px-8 py-4 border border-soul-purple/50 hover:border-soul-purple rounded-xl font-semibold text-white transition-all duration-200"
            >
              {t('ctaQuote')}
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-xl mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-soul-purple/20 flex items-center justify-center mb-3">
                  <stat.icon className="text-soul-purple" size={24} />
                </div>
                {stat.value && <span className="text-3xl font-bold text-white">{stat.value}</span>}
                <span className={`text-sm ${stat.value ? 'text-gray-500' : 'text-white font-semibold'}`}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-fade-in" style={{ animationDelay: '1s' }}>
        <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-1.5 bg-soul-purple rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  )
}
