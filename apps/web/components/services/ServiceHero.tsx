'use client'

import Link from 'next/link'

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

      {/* AI illustration as section background — right-aligned, faded */}
      <img
        src={`/generated/svc-${serviceKey}.png`}
        alt=""
        className="absolute top-0 right-0 w-2/3 h-full object-contain object-right opacity-20 z-[1]"
        onError={(e: any) => { e.target.style.display = 'none' }}
      />
      {/* Gradient overlay to fade image into background */}
      <div className="absolute inset-0 bg-gradient-to-r from-soul-dark via-soul-dark/80 to-transparent z-[2]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <div>
          <Link
            href={`/${locale}#servicios`}
            className="inline-flex items-center text-gray-400 hover:text-soul-purple transition-colors mb-8"
          >
            <ArrowLeft size={18} className="mr-2" />
            {t('backToServices')}
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
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
          </div>

          {/* Icon — gradient circle with Lucide icon */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-48 h-48 md:w-64 md:h-64">
              <div className={`absolute inset-0 bg-gradient-to-br ${color} rounded-full opacity-20 blur-3xl`} />
              <div className={`relative w-full h-full bg-gradient-to-br ${color} rounded-full flex items-center justify-center shadow-2xl`}>
                <Icon className="text-white w-24 h-24 md:w-32 md:h-32" strokeWidth={1.5} />
              </div>
              {/* Floating particles */}
              <div className={`absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br ${color} rounded-full opacity-60 animate-pulse`} />
              <div className={`absolute -bottom-2 -left-4 w-6 h-6 bg-gradient-to-br ${color} rounded-full opacity-40 animate-pulse delay-1000`} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
