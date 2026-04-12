'use client'

import { ExternalLink, Lock, ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

const featuredProjects = [
  {
    id: 6,
    key: 'tayco',
    stack: ['Next.js', 'Tailwind CSS', 'Framer Motion', 'SEO'],
    color: 'from-amber-500 to-yellow-600',
    demoUrl: 'https://tayco.llc',
    image: '/generated/svc-web-development.png',
  },
  {
    id: 5,
    key: 'coparenting',
    stack: ['Next.js 14', 'Supabase', 'Stripe', 'Resend'],
    color: 'from-violet-500 to-fuchsia-600',
    demoUrl: 'https://coparentingcommander.com',
    image: '/generated/svc-custom-software.png',
  },
  {
    id: 9,
    key: 'archaeonbank',
    stack: ['Spring Boot', 'PostgreSQL', 'Docker', 'Prometheus'],
    color: 'from-cyan-500 to-teal-600',
    demoUrl: 'https://o1banca.vercel.app/',
    image: '/generated/svc-cloud-infrastructure.png',
  },
]

const otherProjects = [
  { id: 7, key: 'turnkey', demoUrl: 'https://taycoturnkey.com', color: 'from-orange-400 to-rose-500' },
  { id: 8, key: 'taysupply', demoUrl: 'https://taysupply.com', color: 'from-emerald-500 to-teal-600' },
  { id: 1, key: 'agricultural', demoUrl: null, color: 'from-orange-500 to-amber-600' },
  { id: 2, key: 'pentest', demoUrl: null, color: 'from-red-500 to-rose-600' },
  { id: 4, key: 'sales', demoUrl: null, color: 'from-purple-500 to-violet-600' },
  { id: 8.5, key: 'vulnassess', demoUrl: null, color: 'from-rose-600 to-red-700' },
]

export function Portfolio() {
  const t = useTranslations('portfolio')

  return (
    <section id="portafolio" className="py-24 bg-soul-dark relative overflow-hidden">
      {/* Subtle bg */}
      <div className="absolute inset-0 bg-gradient-to-b from-soul-dark-lighter/50 via-transparent to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header — clear, unmistakable */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-soul-purple/15 border border-soul-purple/25 text-soul-purple-light text-sm font-medium mb-4">
            {t('label')}
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mt-2 tracking-tight">
            {t('title')}
          </h2>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto text-lg">
            {t('subtitle')}
          </p>
        </div>

        {/* Featured Projects — large cards, 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {featuredProjects.map((project) => (
            <a
              key={project.id}
              href={project.demoUrl || '#'}
              target={project.demoUrl ? '_blank' : undefined}
              rel={project.demoUrl ? 'noopener noreferrer' : undefined}
              className="group relative bg-soul-dark-card rounded-2xl border border-gray-800 overflow-hidden hover:border-soul-purple/50 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Project Image — large, visible */}
              <div className="h-48 relative overflow-hidden">
                <img
                  src={project.image}
                  alt={t(`projects.${project.key}.title`)}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e: any) => { e.target.style.display = 'none' }}
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${project.color} opacity-40 mix-blend-multiply`} />
                <div className="absolute inset-0 bg-gradient-to-t from-soul-dark-card via-transparent to-transparent" />
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-soul-purple-light transition-colors">
                  {t(`projects.${project.key}.title`)}
                </h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
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

                {/* CTA */}
                {project.demoUrl && (
                  <div className="flex items-center text-soul-purple-light text-sm font-medium group-hover:text-white transition-colors">
                    <span>{t('viewCase')}</span>
                    <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </div>
            </a>
          ))}
        </div>

        {/* Other Projects — compact row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {otherProjects.map((project) => (
            <div
              key={project.id}
              className="group bg-soul-dark-card rounded-xl border border-gray-800/50 p-4 hover:border-soul-purple/30 transition-all duration-200"
            >
              {/* Color accent bar */}
              <div className={`h-1 w-10 rounded-full bg-gradient-to-r ${project.color} mb-3`} />
              <h4 className="text-sm font-semibold text-white mb-1 leading-tight">
                {t(`projects.${project.key}.title`)}
              </h4>
              <div className="flex items-center mt-2">
                {project.demoUrl ? (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-soul-purple-light hover:text-white text-xs transition-colors"
                  >
                    <ExternalLink size={10} className="mr-1" />
                    <span>Ver</span>
                  </a>
                ) : (
                  <span className="flex items-center text-gray-600 text-xs">
                    <Lock size={10} className="mr-1" />
                    {t('confidential')}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
