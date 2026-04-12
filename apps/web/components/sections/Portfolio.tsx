'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronLeft, ChevronRight, Lock } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { projects } from '@/lib/projects'

export function Portfolio() {
  const t = useTranslations('portfolio')
  const locale = useLocale()
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const amount = scrollRef.current.offsetWidth * 0.8
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    })
  }

  return (
    <section id="portafolio" className="py-24 bg-soul-dark relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-soul-dark-lighter/50 via-transparent to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
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

        {/* Carousel controls */}
        <div className="flex items-center justify-end gap-2 mb-6">
          <button
            onClick={() => scroll('left')}
            className="carousel-arrow w-10 h-10 rounded-full bg-soul-dark-card border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-soul-purple/50 transition-all"
            aria-label="Anterior"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll('right')}
            className="carousel-arrow w-10 h-10 rounded-full bg-soul-dark-card border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-soul-purple/50 transition-all"
            aria-label="Siguiente"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Carousel */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-4 px-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {projects.map((project) => (
            <Link
              key={project.slug}
              href={`/${locale}/portafolio/${project.slug}`}
              className="group flex-none w-[320px] sm:w-[380px] snap-start bg-soul-dark-card rounded-2xl border border-gray-800 overflow-hidden hover:border-soul-purple/50 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Image */}
              <div className="h-44 relative overflow-hidden">
                <img
                  src={project.image}
                  alt={t(`projects.${project.key}.title`)}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e: any) => { e.target.style.display = 'none' }}
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
              <div className="p-5">
                <h3 className="text-base font-bold text-white mb-2 group-hover:text-soul-purple-light transition-colors">
                  {t(`projects.${project.key}.title`)}
                </h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {t(`projects.${project.key}.description`)}
                </p>

                {/* Stack */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.stack.slice(0, 4).map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 bg-white/5 text-gray-400 rounded-md text-xs border border-white/5"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <div className="flex items-center justify-between">
                  {project.demoUrl ? (
                    <span className="flex items-center text-soul-purple-light text-sm font-medium group-hover:text-white transition-colors">
                      {t('viewCase')}
                      <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                    </span>
                  ) : (
                    <span className="flex items-center text-gray-600 text-xs">
                      <Lock size={10} className="mr-1" />
                      {t('confidential')}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA to full portfolio page */}
        <div className="text-center mt-10">
          <Link
            href={`/${locale}/portafolio`}
            className="inline-flex items-center px-8 py-3 bg-soul-purple/10 border border-soul-purple/30 hover:bg-soul-purple/20 rounded-xl text-soul-purple-light font-semibold transition-all group"
          >
            Ver todos los proyectos
            <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}
