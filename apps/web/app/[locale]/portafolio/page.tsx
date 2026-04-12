import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import type { Metadata } from 'next'
import { locales, type Locale } from '@/i18n/config'
import { projects } from '@/lib/projects'
import { ArrowRight, Lock, ArrowLeft, ExternalLink } from 'lucide-react'
import { SafeImage } from '@/components/ui/SafeImage'

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'portfolio' })
  return {
    title: `${t('title')} | Soulcore.dev`,
    description: t('subtitle'),
  }
}

export default async function PortfolioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'portfolio' })

  return (
    <main className="min-h-screen bg-soul-dark pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href={`/${locale}`}
          className="inline-flex items-center text-gray-400 hover:text-white text-sm mb-8 transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" />
          {locale === 'es' ? 'Volver al inicio' : 'Back to home'}
        </Link>

        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-soul-purple/15 border border-soul-purple/25 text-soul-purple-light text-sm font-medium mb-4">
            {t('label')}
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mt-2 tracking-tight">
            {t('title')}
          </h1>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto text-lg">
            {t('subtitle')}
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project.slug}
              href={`/${locale}/portafolio/${project.slug}`}
              className="group bg-soul-dark-card rounded-2xl border border-gray-800 overflow-hidden hover:border-soul-purple/50 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Image */}
              <div className="h-48 relative overflow-hidden">
                <SafeImage
                  src={project.image}
                  alt={t(`projects.${project.key}.title`)}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${project.color} opacity-30 mix-blend-multiply`} />
                <div className="absolute inset-0 bg-gradient-to-t from-soul-dark-card via-transparent to-transparent" />
                {project.featured && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 bg-soul-purple/80 text-white text-[10px] font-bold rounded-full uppercase tracking-wide">
                    Destacado
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h2 className="text-lg font-bold text-white mb-2 group-hover:text-soul-purple-light transition-colors">
                  {t(`projects.${project.key}.title`)}
                </h2>
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                  {t(`projects.${project.key}.description`)}
                </p>

                {/* Stack */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.stack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 bg-white/5 text-gray-400 rounded-md text-xs border border-white/5"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                  <span className="flex items-center text-soul-purple-light text-sm font-medium group-hover:text-white transition-colors">
                    Ver detalles
                    <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </span>
                  {project.demoUrl ? (
                    <ExternalLink size={14} className="text-gray-600" />
                  ) : (
                    <span className="flex items-center text-gray-600 text-[11px]">
                      <Lock size={10} className="mr-1" />
                      {t('confidential')}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
