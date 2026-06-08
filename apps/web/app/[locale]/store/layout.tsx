import { getMessages } from 'next-intl/server'
import type { Metadata } from 'next'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const messages = await getMessages()
  const t = (key: string): string => {
    const keys = key.split('.')
    let value: unknown = messages
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k]
      } else {
        return key
      }
    }
    return typeof value === 'string' ? value : key
  }

  return {
    title: `${t('store.badge')} | SOUL CORE`,
    description: t('store.heroSubtitle'),
    openGraph: {
      title: `${t('store.badge')} | SOUL CORE`,
      description: t('store.heroSubtitle'),
      url: `https://soulcore.dev/${locale}/store`,
      siteName: 'SOUL CORE',
      type: 'website',
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'SOUL CORE Store' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${t('store.badge')} | SOUL CORE`,
      description: t('store.heroSubtitle'),
      images: ['/og-image.png'],
    },
    alternates: {
      canonical: `https://soulcore.dev/${locale}/store`,
      languages: {
        'x-default': '/en/store',
        'es': '/es/store',
        'en': '/en/store',
        'pt': '/pt/store',
        'fr': '/fr/store',
        'de': '/de/store',
      },
    },
  }
}

export default function StoreLayout({ children }: Props) {
  return <>{children}</>
}
