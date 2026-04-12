import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { locales } from '@/i18n/config'
import { projects, allProjectSlugs, getProjectBySlug } from '@/lib/projects'
import { ArrowLeft, ExternalLink, Lock, ArrowRight } from 'lucide-react'
import { SafeImage } from '@/components/ui/SafeImage'

export async function generateStaticParams() {
  const params: { locale: string; slug: string }[] = []
  for (const locale of locales) {
    for (const slug of allProjectSlugs) {
      params.push({ locale, slug })
    }
  }
  return params
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params
  const project = getProjectBySlug(slug)
  if (!project) return { title: 'Not Found' }
  const t = await getTranslations({ locale, namespace: 'portfolio' })
  return {
    title: `${t(`projects.${project.key}.title`)} | Soulcore.dev`,
    description: t(`projects.${project.key}.description`),
  }
}

export default async function ProjectPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const project = getProjectBySlug(slug)
  if (!project) notFound()

  const t = await getTranslations({ locale, namespace: 'portfolio' })

  // Get metrics if they exist
  const metrics: string[] = []
  for (const mKey of ['m1', 'm2', 'm3']) {
    try {
      const val = t(`projects.${project.key}.${mKey}`)
      if (val && !val.includes(mKey)) metrics.push(val)
    } catch { /* metric doesn't exist for this project */ }
  }

  // Get next/prev projects for navigation
  const currentIndex = projects.findIndex(p => p.slug === slug)
  const prevProject = currentIndex > 0 ? projects[currentIndex - 1] : null
  const nextProject = currentIndex < projects.length - 1 ? projects[currentIndex + 1] : null

  return (
    <main className="min-h-screen bg-soul-dark">
      {/* Hero */}
      <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <SafeImage
          src={project.image}
          alt={t(`projects.${project.key}.title`)}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${project.color} opacity-40 mix-blend-multiply`} />
        <div className="absolute inset-0 bg-gradient-to-t from-soul-dark via-soul-dark/60 to-soul-dark/30" />

        <div className="absolute inset-0 flex items-end">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
            {/* Back */}
            <Link
              href={`/${locale}/portafolio`}
              className="inline-flex items-center text-gray-300 hover:text-white text-sm mb-6 transition-colors"
            >
              <ArrowLeft size={16} className="mr-1" />
              {locale === 'es' ? 'Todos los proyectos' : 'All projects'}
            </Link>

            <div className="flex items-center gap-4 mb-4">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${project.color} flex items-center justify-center shadow-lg`}>
                <project.icon size={28} className="text-white" />
              </div>
              {project.featured && (
                <span className="px-3 py-1 bg-soul-purple/80 text-white text-xs font-bold rounded-full uppercase tracking-wide">
                  Destacado
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              {t(`projects.${project.key}.title`)}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-white mb-4">
              {locale === 'es' ? 'Sobre el proyecto' : 'About the project'}
            </h2>
            <p className="text-gray-300 text-base leading-relaxed mb-8">
              {t(`projects.${project.key}.description`)}
            </p>

            {/* Metrics */}
            {metrics.length > 0 && (
              <>
                <h2 className="text-xl font-bold text-white mb-4">
                  {locale === 'es' ? 'Resultados clave' : 'Key results'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  {metrics.map((metric, i) => (
                    <div
                      key={i}
                      className="bg-soul-dark-card rounded-xl border border-gray-800 p-5 text-center"
                    >
                      <div className="text-xl font-bold text-soul-purple-light">{metric}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Demo link */}
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-soul-purple hover:bg-soul-purple-dark rounded-xl font-semibold !text-white transition-all glow-hover"
              >
                <ExternalLink size={18} className="mr-2" />
                {locale === 'es' ? 'Ver sitio en vivo' : 'View live site'}
              </a>
            )}
            {!project.demoUrl && (
              <div className="inline-flex items-center px-6 py-3 bg-soul-dark-card border border-gray-700 rounded-xl text-gray-500">
                <Lock size={16} className="mr-2" />
                {t('confidential')}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-soul-dark-card rounded-2xl border border-gray-800 p-6 sticky top-24">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                Stack
              </h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {project.stack.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 bg-white/5 text-gray-300 rounded-lg text-sm border border-white/5"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {project.demoUrl && (
                <>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
                    URL
                  </h3>
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-soul-purple-light hover:text-white text-sm transition-colors break-all"
                  >
                    {project.demoUrl.replace('https://', '')}
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Navigation between projects */}
        <div className="mt-16 pt-8 border-t border-gray-800 grid grid-cols-2 gap-4">
          {prevProject ? (
            <Link
              href={`/${locale}/portafolio/${prevProject.slug}`}
              className="group flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
              <div>
                <div className="text-xs text-gray-600">
                  {locale === 'es' ? 'Anterior' : 'Previous'}
                </div>
                <div className="text-sm font-medium">
                  {t(`projects.${prevProject.key}.title`)}
                </div>
              </div>
            </Link>
          ) : <div />}
          {nextProject ? (
            <Link
              href={`/${locale}/portafolio/${nextProject.slug}`}
              className="group flex items-center justify-end text-right text-gray-400 hover:text-white transition-colors"
            >
              <div>
                <div className="text-xs text-gray-600">
                  {locale === 'es' ? 'Siguiente' : 'Next'}
                </div>
                <div className="text-sm font-medium">
                  {t(`projects.${nextProject.key}.title`)}
                </div>
              </div>
              <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : <div />}
        </div>
      </div>
    </main>
  )
}
