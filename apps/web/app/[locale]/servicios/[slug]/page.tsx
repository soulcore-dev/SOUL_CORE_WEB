import { setRequestLocale } from 'next-intl/server'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { locales, type Locale } from '@/i18n/config'
import { ServiceHero } from '@/components/services/ServiceHero'
import { ServiceFeatures } from '@/components/services/ServiceFeatures'
import { ServiceProcess } from '@/components/services/ServiceProcess'
import { ServiceTechnologies } from '@/components/services/ServiceTechnologies'
import { ServiceUseCases } from '@/components/services/ServiceUseCases'
import { ServiceCTA } from '@/components/services/ServiceCTA'

// Valid service slugs
const validServices = [
  'ai', 'software', 'industrial', 'cybersecurity', 'integrations', 'design',
  'ecommerce', 'marketing', 'mentoring', 'data', 'cloud', 'legacy'
] as const

type ServiceSlug = typeof validServices[number]

// Service colors for gradient styling
export const serviceColors: Record<ServiceSlug, string> = {
  ai: 'from-purple-500 to-violet-600',
  software: 'from-blue-500 to-cyan-600',
  industrial: 'from-orange-500 to-amber-600',
  cybersecurity: 'from-red-500 to-rose-600',
  integrations: 'from-indigo-500 to-purple-600',
  design: 'from-pink-500 to-rose-600',
  ecommerce: 'from-teal-500 to-cyan-600',
  marketing: 'from-red-500 to-orange-600',
  mentoring: 'from-yellow-500 to-amber-600',
  data: 'from-cyan-500 to-blue-600',
  cloud: 'from-sky-500 to-indigo-600',
  legacy: 'from-violet-500 to-fuchsia-600',
}

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

export function generateStaticParams() {
  const params: { locale: string; slug: string }[] = []

  for (const locale of locales) {
    for (const slug of validServices) {
      params.push({ locale, slug })
    }
  }

  return params
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params

  if (!validServices.includes(slug as ServiceSlug)) {
    return { title: 'Not Found' }
  }

  const messages = await getMessages()
  const serviceDetails = (messages as Record<string, unknown>).serviceDetails as Record<string, unknown>
  const service = serviceDetails[slug] as Record<string, unknown>
  const hero = service?.hero as Record<string, string>

  const title = hero?.title || slug
  const description = hero?.subtitle || ''

  const hreflangAlternates: Record<string, string> = { 'x-default': `/en/servicios/${slug}` }
  for (const loc of locales) {
    hreflangAlternates[loc] = `/${loc}/servicios/${slug}`
  }

  return {
    title: `${title} | SOUL CORE`,
    description: description.slice(0, 160),
    openGraph: {
      title: `${title} | SOUL CORE`,
      description: description.slice(0, 160),
      url: `https://soulcore.dev/${locale}/servicios/${slug}`,
      siteName: 'SOUL CORE',
      type: 'website',
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: `${title} - SOUL CORE` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | SOUL CORE`,
      description: description.slice(0, 160),
      images: ['/og-image.png'],
    },
    alternates: {
      canonical: `https://soulcore.dev/${locale}/servicios/${slug}`,
      languages: hreflangAlternates,
    },
  }
}

export default async function ServicePage({ params }: Props) {
  const { locale, slug } = await params

  // Validate locale
  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  // Validate service slug
  if (!validServices.includes(slug as ServiceSlug)) {
    notFound()
  }

  setRequestLocale(locale)

  const color = serviceColors[slug as ServiceSlug]

  return (
    <div className="min-h-screen bg-soul-dark">
      <ServiceHero serviceKey={slug} color={color} />
      <ServiceFeatures serviceKey={slug} color={color} />
      <ServiceProcess serviceKey={slug} color={color} />
      <ServiceTechnologies serviceKey={slug} color={color} />
      <ServiceUseCases serviceKey={slug} color={color} />
      <ServiceCTA serviceKey={slug} color={color} />
    </div>
  )
}
