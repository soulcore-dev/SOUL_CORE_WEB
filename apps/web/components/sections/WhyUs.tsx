'use client'


import { Clock, Zap, FileText, Cpu, Users, Shield } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function WhyUs() {
  const t = useTranslations('whyUs')

  const features = [
    { icon: Clock, titleKey: 'availability' },
    { icon: Zap, titleKey: 'speed' },
    { icon: FileText, titleKey: 'documentation' },
    { icon: Cpu, titleKey: 'frameworks' },
    { icon: Users, titleKey: 'provider' },
    { icon: Shield, titleKey: 'security' },
  ]

  return (
    <section className="py-24 bg-soul-dark-lighter relative overflow-hidden">
      {/* AI background */}
      <img
        src="/generated/whyus-bg.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-15 ai-bg-img"
        onError={(e: any) => { e.target.style.display = 'none' }}
      />
      {/* Background blur effects */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-soul-purple/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-soul-purple-light/15 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.titleKey}
              
              
              
              
              className="group p-6 bg-soul-dark-card rounded-2xl border border-gray-800 hover:border-soul-purple/50 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-soul-purple/20 flex items-center justify-center mb-4 group-hover:bg-soul-purple/30 transition-colors">
                <feature.icon aria-hidden="true" className="text-soul-purple" size={28} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {t(`features.${feature.titleKey}.title`)}
              </h3>
              <p className="text-gray-400">
                {t(`features.${feature.titleKey}.description`)}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div
          
          
          
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-soul-dark-card border border-soul-purple/30">
            <span className="text-gray-300 mr-2">{t('cta')}</span>
            <a href="#contacto" className="text-soul-purple hover:text-soul-purple-light font-semibold">
              {t('ctaLink')}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
