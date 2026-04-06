'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Bot, Code, Cog, Shield, Plug, Palette, ShoppingCart, BarChart3, GraduationCap, Database, Cloud, RefreshCcw } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import type { LucideIcon } from 'lucide-react'

const serviceIcons: Record<string, LucideIcon> = {
  ai: Bot,
  software: Code,
  industrial: Cog,
  cybersecurity: Shield,
  integrations: Plug,
  design: Palette,
  ecommerce: ShoppingCart,
  marketing: BarChart3,
  mentoring: GraduationCap,
  data: Database,
  cloud: Cloud,
  legacy: RefreshCcw,
}

interface ServiceHeroProps {
  serviceKey: string
  color: string
}

export function ServiceHero({ serviceKey, color }: ServiceHeroProps) {
  const t = useTranslations('serviceDetails')
  const locale = useLocale()
  const Icon = serviceIcons[serviceKey] || Bot

  const hero = {
    badge: t(`${serviceKey}.hero.badge`),
    title: t(`${serviceKey}.hero.title`),
    subtitle: t(`${serviceKey}.hero.subtitle`),
  }

  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5`} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-soul-purple/20 via-transparent to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            href={`/${locale}#servicios`}
            className="inline-flex items-center text-gray-400 hover:text-soul-purple transition-colors mb-8"
          >
            <ArrowLeft size={18} className="mr-2" />
            {t('backToServices')}
          </Link>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r ${color} text-white mb-6`}>
              {hero.badge}
            </span>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              {hero.title}
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-gray-300 leading-relaxed">
              {hero.subtitle}
            </p>
          </motion.div>

          {/* Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center lg:justify-end"
          >
            <div className={`relative w-64 h-64 md:w-80 md:h-80`}>
              {/* Outer glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${color} rounded-full opacity-20 blur-3xl`} />

              {/* Icon container */}
              <div className={`relative w-full h-full bg-gradient-to-br ${color} rounded-full flex items-center justify-center shadow-2xl`}>
                <Icon className="text-white w-32 h-32 md:w-40 md:h-40" strokeWidth={1.5} />
              </div>

              {/* Floating particles */}
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className={`absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br ${color} rounded-full opacity-60`}
              />
              <motion.div
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className={`absolute -bottom-2 -left-6 w-8 h-8 bg-gradient-to-br ${color} rounded-full opacity-40`}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
