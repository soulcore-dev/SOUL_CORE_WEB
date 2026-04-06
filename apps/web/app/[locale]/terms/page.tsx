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
  const terms = (messages as Record<string, any>).terms

  return {
    title: `${terms?.title || 'Terms of Service'} | SOUL CORE`,
    description: terms?.metaDescription || 'Terms of Service for soulcore.dev',
    alternates: {
      languages: {
        'es': '/es/terms',
        'en': '/en/terms',
        'pt': '/pt/terms',
        'fr': '/fr/terms',
        'de': '/de/terms',
      },
    },
  }
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params

  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  setRequestLocale(locale)

  return <LegalPage type="terms" />
}
