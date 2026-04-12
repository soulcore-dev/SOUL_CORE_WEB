'use client'

import Link from 'next/link'
import { Gift, ArrowRight, Download, Sparkles, Code } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'

export function FreeResources() {
  const t = useTranslations('freeResources')
  const locale = useLocale()

  return (
    <section className="py-16 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/20 via-soul-dark to-emerald-900/20" />
      <div className="absolute inset-0 bg-gradient-to-b from-soul-dark via-transparent to-soul-dark" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="free-banner bg-soul-dark-card/80 backdrop-blur-sm border border-emerald-500/15 rounded-2xl p-8 sm:p-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Left — text */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                <Gift className="text-emerald-400" size={22} />
                <span className="text-emerald-400 text-sm font-bold uppercase tracking-wider">
                  {t('badge')}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 tracking-tight">
                {t('title')}
              </h2>
              <p className="text-gray-400 text-base mb-6 max-w-lg">
                {t('subtitle')}
              </p>
              <Link
                href={`/${locale}/store`}
                className="inline-flex items-center px-8 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold !text-white transition-all group shadow-lg shadow-emerald-600/20"
              >
                {t('cta')}
                <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Right — feature pills */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 free-pill bg-white/5 rounded-xl px-5 py-3 border border-white/5">
                <Download size={18} className="text-emerald-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm">{t('feature1')}</span>
              </div>
              <div className="flex items-center gap-3 free-pill bg-white/5 rounded-xl px-5 py-3 border border-white/5">
                <Sparkles size={18} className="text-emerald-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm">{t('feature2')}</span>
              </div>
              <div className="flex items-center gap-3 free-pill bg-white/5 rounded-xl px-5 py-3 border border-white/5">
                <Code size={18} className="text-emerald-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm">{t('feature3')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
