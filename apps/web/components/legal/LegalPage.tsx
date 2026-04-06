'use client'

import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

type LegalPageProps = {
  type: 'privacy' | 'terms'
}

export function LegalPage({ type }: LegalPageProps) {
  const t = useTranslations(type)
  const locale = useLocale()

  const sections: string[] = type === 'privacy'
    ? ['collection', 'usage', 'cookies', 'thirdParty', 'ai', 'security', 'rights', 'international', 'children', 'changes']
    : ['acceptance', 'services', 'ip', 'userObligations', 'payments', 'liability', 'warranties', 'termination', 'governing', 'changes']

  return (
    <div className="min-h-screen bg-soul-dark pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center text-soul-purple hover:text-soul-purple-light transition-colors mb-8"
        >
          <ArrowLeft size={16} className="mr-2" />
          {t('backHome')}
        </Link>

        <h1 className="text-4xl font-bold text-white mb-2">
          {t('title')}
        </h1>
        <p className="text-gray-400 mb-12">
          {t('lastUpdated')}
        </p>

        <div className="space-y-10">
          {sections.map((section, index) => (
            <section key={section} className="prose prose-invert max-w-none">
              <h2 className="text-xl font-semibold text-white flex items-center gap-3 mb-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-soul-purple/20 text-soul-purple text-sm font-bold">
                  {index + 1}
                </span>
                {t(`sections.${section}.title`)}
              </h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                {t(`sections.${section}.content`)}
              </p>
            </section>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-gray-800">
          <p className="text-gray-400 text-sm">
            {t('contact')}
          </p>
          <a
            href="mailto:founder@soulcore.dev"
            className="text-soul-purple hover:text-soul-purple-light transition-colors text-sm"
          >
            founder@soulcore.dev
          </a>
        </div>
      </div>
    </div>
  )
}
