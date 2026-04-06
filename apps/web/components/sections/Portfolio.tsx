'use client'

import { useState } from 'react'

import { ExternalLink, Github, Cpu, Shield, Cog, Lock, Scale, Building, Package, Landmark } from 'lucide-react'
import { useTranslations } from 'next-intl'

const projectData = [
  {
    id: 1,
    key: 'agricultural',
    categoryKey: 'industrial',
    icon: Cog,
    stack: ['IoT', 'SCADA', 'Python', 'Dashboard'],
    metrics: ['300+ sensors', '40% cost reduction', '24/7 monitoring'],
    color: 'from-orange-500 to-amber-600',
    demoUrl: null, // Proyecto confidencial de cliente
    githubUrl: null,
  },
  {
    id: 2,
    key: 'pentest',
    categoryKey: 'cybersecurity',
    icon: Shield,
    stack: ['Burp Suite', 'OWASP', 'Nmap', 'Python'],
    metrics: ['50+ audits', 'OWASP Top 10', 'Zero breaches'],
    color: 'from-red-500 to-rose-600',
    demoUrl: null,
    githubUrl: null,
  },
  {
    id: 4,
    key: 'sales',
    categoryKey: 'ai',
    icon: Cpu,
    stack: ['n8n', 'OpenAI', 'WhatsApp API', 'Supabase'],
    metrics: ['80% automation', '24/7 active', '3x more leads'],
    color: 'from-purple-500 to-violet-600',
    demoUrl: null, // Sistema interno
    githubUrl: null,
  },
  {
    id: 5,
    key: 'coparenting',
    categoryKey: 'software',
    icon: Scale,
    stack: ['Next.js 14', 'Supabase', 'Stripe', 'Vercel', 'Resend'],
    metrics: ['projects.coparenting.m1', 'projects.coparenting.m2', 'projects.coparenting.m3'],
    color: 'from-violet-500 to-fuchsia-600',
    demoUrl: 'https://coparentingcommander.com',
    githubUrl: null,
  },
  {
    id: 6,
    key: 'tayco',
    categoryKey: 'design',
    icon: Building,
    stack: ['Next.js', 'Tailwind CSS', 'Framer Motion', 'Schema.org'],
    metrics: ['projects.tayco.m1', 'projects.tayco.m2', 'projects.tayco.m3'],
    color: 'from-amber-500 to-yellow-600',
    demoUrl: 'https://tayco.llc',
    githubUrl: null,
  },
  {
    id: 7,
    key: 'turnkey',
    categoryKey: 'design',
    icon: Building,
    stack: ['Next.js', 'Tailwind CSS', 'SEO', 'Responsive'],
    metrics: ['projects.turnkey.m1', 'projects.turnkey.m2', 'projects.turnkey.m3'],
    color: 'from-orange-400 to-rose-500',
    demoUrl: 'https://taycoturnkey.com',
    githubUrl: null,
  },
  {
    id: 8,
    key: 'taysupply',
    categoryKey: 'ecommerce',
    icon: Package,
    stack: ['Next.js', 'Tailwind CSS', 'i18n', 'Dark Mode'],
    metrics: ['projects.taysupply.m1', 'projects.taysupply.m2', 'projects.taysupply.m3'],
    color: 'from-emerald-500 to-teal-600',
    demoUrl: 'https://taysupply.com',
    githubUrl: null,
  },
  {
    id: 9,
    key: 'vulnassess',
    categoryKey: 'cybersecurity',
    icon: Shield,
    stack: ['Burp Suite', 'Nuclei', 'Python', 'OWASP'],
    metrics: ['projects.vulnassess.m1', 'projects.vulnassess.m2', 'projects.vulnassess.m3'],
    color: 'from-rose-600 to-red-700',
    demoUrl: null,
    githubUrl: null,
  },
  {
    id: 10,
    key: 'archaeonbank',
    categoryKey: 'software',
    icon: Landmark,
    stack: ['Spring Boot 3.4', 'PostgreSQL 17', 'Docker', 'Prometheus', 'Flyway'],
    metrics: ['projects.archaeonbank.m1', 'projects.archaeonbank.m2', 'projects.archaeonbank.m3'],
    color: 'from-cyan-500 to-teal-600',
    demoUrl: 'https://o1banca.vercel.app/',
    githubUrl: null,
  },
]

export function Portfolio() {
  const t = useTranslations('portfolio')
  const [activeCategory, setActiveCategory] = useState('all')

  const categoryKeys = ['all', 'ai', 'cybersecurity', 'software', 'industrial', 'design', 'ecommerce']

  const filteredProjects = projectData.filter(
    (project) => activeCategory === 'all' || project.categoryKey === activeCategory
  )

  return (
    <section id="portafolio" className="py-24 bg-soul-dark-lighter relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header with illustration */}
        <div className="text-center mb-12">
          <img
            src="/generated/portfolio-header.png"
            alt=""
            className="w-64 h-32 object-contain mx-auto mb-4 opacity-80"
            onError={(e: any) => { e.target.style.display = 'none' }}
          />
          <span className="text-soul-purple font-semibold">{t('label')}</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">
            {t('title')}
          </h2>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Category Filter */}
        <div
          
          
          
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categoryKeys.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2 rounded-full font-medium transition-all duration-200 ${
                activeCategory === category
                  ? 'bg-soul-purple text-white'
                  : 'bg-soul-dark-card text-gray-400 hover:text-white border border-gray-700'
              }`}
            >
              {t(`categories.${category}`)}
            </button>
          ))}
        </div>

        {/* Projects Grid — 4 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group bg-soul-dark-card rounded-xl border border-gray-800 overflow-hidden hover:border-soul-purple/50 transition-all duration-300"
            >
              {/* Project Header */}
              <div className={`h-28 bg-gradient-to-br ${project.color} relative`}>
                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <project.icon size={36} className="text-white/80" />
                </div>
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-0.5 bg-black/50 rounded-full text-white text-[10px] font-medium">
                    {t(`categories.${project.categoryKey}`)}
                  </span>
                </div>
              </div>

              {/* Project Content */}
              <div className="p-4">
                <h3 className="text-sm font-bold text-white mb-1 group-hover:text-soul-purple-light transition-colors leading-tight">
                  {t(`projects.${project.key}.title`)}
                </h3>
                <p className="text-gray-400 text-xs mb-3 line-clamp-2">
                  {t(`projects.${project.key}.description`)}
                </p>

                {/* Metrics */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {project.metrics.slice(0, 2).map((metric) => (
                    <span
                      key={metric}
                      className="px-2 py-0.5 bg-soul-purple/20 text-soul-purple-light rounded-full text-[10px]"
                    >
                      {metric.includes('.') ? t(metric) : metric}
                    </span>
                  ))}
                </div>

                {/* Stack */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {project.stack.slice(0, 3).map((tech) => (
                    <span
                      key={tech}
                      className="px-1.5 py-0.5 bg-soul-dark-lighter text-gray-400 rounded text-[10px]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Links */}
                <div className="flex space-x-2 pt-2 border-t border-gray-800">
                  {project.demoUrl ? (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-soul-purple hover:text-soul-purple-light transition-colors"
                    >
                      <ExternalLink size={12} className="mr-1" />
                      <span className="text-xs">{t('viewCase')}</span>
                    </a>
                  ) : !project.githubUrl && (
                    <span className="flex items-center text-gray-500 text-xs">
                      <Lock size={10} className="mr-1" />
                      {t('confidential')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
