import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { Inter } from 'next/font/google'
import { notFound } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { ConditionalFooter } from '@/components/layout/ConditionalFooter'
import { locales, type Locale } from '@/i18n/config'
import type { Metadata } from 'next'
import '../globals.css'

const inter = Inter({ subsets: ['latin'] })

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const messages = await getMessages()
  const t = (key: string) => {
    const keys = key.split('.')
    let value: any = messages
    for (const k of keys) {
      value = value?.[k]
    }
    return value || key
  }

  return {
    metadataBase: new URL('https://soulcore.dev'),
    title: t('metadata.title'),
    description: t('metadata.description'),
    keywords: locale === 'es'
      ? ['desarrollo software', 'IA', 'automatización', 'ciberseguridad', 'APIs', 'SOUL CORE']
      : ['software development', 'AI', 'automation', 'cybersecurity', 'APIs', 'SOUL CORE'],
    authors: [{ name: 'SOUL CORE DEVELOPERS GROUP' }],
    icons: {
      icon: '/favicon.png',
      apple: '/favicon.png',
    },
    openGraph: {
      title: t('metadata.title'),
      description: t('metadata.ogDescription'),
      url: 'https://soulcore.dev',
      siteName: 'SOUL CORE',
      type: 'website',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'SOUL CORE - Software Development',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('metadata.title'),
      description: t('metadata.ogDescription'),
      images: ['/og-image.png'],
    },
    alternates: {
      languages: {
        'es': '/es',
        'en': '/en',
        'pt': '/pt',
        'fr': '/fr',
        'de': '/de',
      },
    },
  }
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  // Enable static rendering
  setRequestLocale(locale)

  // Providing all messages to the client side
  const messages = await getMessages()

  return (
    <html lang={locale} className="dark">
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <ConditionalFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
