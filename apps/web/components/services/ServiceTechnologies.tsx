'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

interface ServiceTechnologiesProps {
  serviceKey: string
  color: string
}

export function ServiceTechnologies({ serviceKey, color }: ServiceTechnologiesProps) {
  const t = useTranslations('serviceDetails')

  // Get technologies array from translations
  const technologiesRaw = t.raw(`${serviceKey}.technologies`) as string[]

  return (
    <section className="py-20 bg-soul-dark-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-soul-purple font-semibold">{t('technologies.title')}</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-4">
            {t('technologies.subtitle')}
          </h2>
        </motion.div>

        {/* Technologies Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-4"
        >
          {technologiesRaw.map((tech, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group relative"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${color} rounded-xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300`} />
              <div className="relative px-6 py-3 bg-soul-dark rounded-xl border border-gray-700 group-hover:border-soul-purple/50 transition-all duration-300">
                <span className="text-gray-300 group-hover:text-white font-medium transition-colors">
                  {tech}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
