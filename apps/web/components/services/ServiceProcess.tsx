'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

interface ServiceProcessProps {
  serviceKey: string
  color: string
}

export function ServiceProcess({ serviceKey, color }: ServiceProcessProps) {
  const t = useTranslations('serviceDetails')

  // Get process steps from translations
  const processRaw = t.raw(`${serviceKey}.process`) as Array<{ title: string; description: string }>

  return (
    <section className="py-20 bg-soul-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-soul-purple font-semibold">{t('process.title')}</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-4">
            {t('process.subtitle')}
          </h2>
        </motion.div>

        {/* Process Timeline */}
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-soul-purple via-soul-purple/50 to-transparent transform md:-translate-x-1/2" />

          <div className="space-y-12">
            {processRaw.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className={`relative flex items-center gap-8 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Step number */}
                <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 z-10">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${color} flex items-center justify-center shadow-lg shadow-soul-purple/30`}>
                    <span className="text-2xl font-bold text-white">{index + 1}</span>
                  </div>
                </div>

                {/* Content */}
                <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:pr-20 md:text-right' : 'md:pl-20 md:text-left'} pl-24 md:pl-0`}>
                  <div className="bg-soul-dark-card p-6 rounded-2xl border border-gray-800 hover:border-soul-purple/30 transition-colors">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-400">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Empty space for layout */}
                <div className="hidden md:block w-1/2" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
