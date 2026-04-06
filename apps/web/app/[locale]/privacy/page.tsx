import { setRequestLocale } from 'next-intl/server'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales, type Locale } from '@/i18n/config'
import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal/LegalPage'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const messages = await getMessages()
  const privacy = (messages as Record<string, any>).privacy

  return {
    title: `${privacy?.title || 'Privacy Policy'} | SOUL CORE`,
    description: privacy?.metaDescription || 'Privacy Policy for soulcore.dev',
    alternates: {
      languages: {
        'es': '/es/privacy',
        'en': '/en/privacy',
        'pt': '/pt/privacy',
        'fr': '/fr/privacy',
        'de': '/de/privacy',
      },
    },
  }
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params

  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  setRequestLocale(locale)

  return <LegalPage type="privacy" />
}
