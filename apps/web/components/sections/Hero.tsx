'use client'

import Link from 'next/link'
import { ArrowRight, Zap, Layers, Rocket, Gift } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'

export function Hero() {
  const t = useTranslations('hero')
  const locale = useLocale()

  const stats = [
    { icon: Layers, label: t('statStack') },
    { icon: Zap, value: '12', label: t('statAreas') },
    { icon: Rocket, label: t('statDelivery') },
  ]

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background — full bleed, dramatic presence */}
      <div className="absolute inset-0 -top-20 bg-soul-dark">
        <img
          src="/generated/hero-bg.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-50 ai-bg-img"
          onError={(e: any) => { e.target.style.display = 'none' }}
        />
        {/* Gradient overlays for depth — like TAYCO's dark overlay on photo */}
        <div className="absolute inset-0 bg-gradient-to-t from-soul-dark via-soul-dark/50 to-soul-dark/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-soul-dark/70 via-transparent to-transparent" />
        {/* Single centered purple glow — subtle, atmospheric */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-soul-purple/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20">
        <div className="text-center">
          {/* HERO LOGO — massive, commanding, the centerpiece */}
          <div className="mb-6 sm:mb-8 flex justify-center">
            <img
              src="/logo_black.png"
              alt="Soulcore.dev"
              className="h-32 sm:h-44 md:h-56 lg:h-64 w-auto drop-shadow-[0_0_40px_rgba(139,92,246,0.3)]"
            />
          </div>

          {/* Badge — minimal, understated */}
          <div className="mb-8">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-soul-purple-light text-sm font-medium tracking-wide">
              <span className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse" />
              {t('badge')}
            </span>
          </div>

          {/* Headline — massive, TAYCO-scale impact */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold mb-5 tracking-tight leading-[0.9]">
            <span className="text-white">{t('title1')}</span>
            <br />
            <span className="gradient-text">{t('title2')}</span>
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg md:text-xl text-gray-300/90 max-w-2xl mx-auto mb-12 leading-relaxed">
            {t.rich('subtitle', {
              strong: (chunks) => <strong className="!text-white font-semibold">{chunks}</strong>
            })}
          </p>

          {/* CTAs — bold, wide */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Link
              href="#servicios"
              className="w-full sm:w-auto px-10 py-4 bg-soul-purple hover:bg-soul-purple-dark rounded-xl font-bold text-lg !text-white transition-all duration-200 glow-hover flex items-center justify-center group shadow-lg shadow-soul-purple/25"
            >
              {t('ctaServices')}
              <ArrowRight aria-hidden="true" className="ml-2 group-hover:translate-x-1 transition-transform" size={22} />
            </Link>
            <Link
              href={`/${locale}/store`}
              className="w-full sm:w-auto px-10 py-4 bg-emerald-600/20 border-2 border-emerald-500/30 hover:bg-emerald-600/30 hover:border-emerald-500/50 rounded-xl font-bold text-lg text-emerald-300 transition-all duration-200 flex items-center justify-center group"
            >
              <Gift size={20} className="mr-2" />
              {t('ctaFree')}
            </Link>
          </div>

          {/* Stats — glass strip, minimal */}
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto rounded-2xl p-4 bg-black/30 backdrop-blur-md">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-lg bg-soul-purple/15 flex items-center justify-center mb-2">
                  <stat.icon className="text-soul-purple-light" size={20} aria-hidden="true" />
                </div>
                {stat.value && <span className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</span>}
                <span className="text-xs text-gray-500 font-semibold">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <div className="w-6 h-10 border-2 border-white/15 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  )
}
