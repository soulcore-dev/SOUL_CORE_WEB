'use client'

import { motion } from 'framer-motion'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import { MessageCircle, ArrowRight, Sparkles, FileText } from 'lucide-react'

interface ServiceCTAProps {
  serviceKey: string
  color: string
}

export function ServiceCTA({ serviceKey, color }: ServiceCTAProps) {
  const t = useTranslations('serviceDetails')
  const locale = useLocale()

  const ctaTitle = t(`${serviceKey}.ctaSection.title`)
  const ctaDescription = t(`${serviceKey}.ctaSection.description`)

  return (
    <section className="py-20 bg-soul-dark-card relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className={`absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-r ${color} rounded-full blur-[120px] opacity-20 animate-pulse`} />
        <div className={`absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-r ${color} rounded-full blur-[120px] opacity-20 animate-pulse`} style={{ animationDelay: '1s' }} />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          {/* Sparkle icon */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${color} mb-8`}
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-5xl font-bold text-white mb-6"
          >
            {ctaTitle}
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto"
          >
            {ctaDescription}
          </motion.p>

          {/* Cybersecurity detailed portfolio link */}
          {serviceKey === 'cybersecurity' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.45 }}
              className="mb-8"
            >
              <a
                href={locale === 'en' ? '/cybersecurity-en.html' : '/cybersecurity.html'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-6 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-300"
              >
                <FileText className="w-5 h-5" />
                <span className="font-medium">
                  {locale === 'en' ? 'View Full Cybersecurity Services Portfolio' : 'Ver Portafolio Completo de Servicios de Ciberseguridad'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          )}

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            {/* Primary CTA - Contact */}
            <Link
              href={`/${locale}#contacto`}
              className={`group inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r ${color} rounded-xl font-semibold text-white text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-soul-purple/30`}
            >
              {t('cta.startProject')}
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>

            {/* Secondary CTA - WhatsApp */}
            <a
              href="https://wa.me/18495813171"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-soul-dark border border-gray-700 hover:border-green-500 rounded-xl font-semibold text-white text-lg transition-all duration-300 hover:bg-green-500/10"
            >
              <MessageCircle className="w-5 h-5 text-green-400" />
              {t('cta.whatsapp')}
            </a>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7 }}
            className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-gray-400"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full" />
              {t('cta.badge1')}
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full" />
              {t('cta.badge2')}
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full" />
              {t('cta.badge3')}
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
