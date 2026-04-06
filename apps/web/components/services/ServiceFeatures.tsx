'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { CheckCircle } from 'lucide-react'

interface ServiceFeaturesProps {
  serviceKey: string
  color: string
}

export function ServiceFeatures({ serviceKey, color }: ServiceFeaturesProps) {
  const t = useTranslations('serviceDetails')

  // Get features array from translations
  const featuresRaw = t.raw(`${serviceKey}.features`) as Array<{ title: string; description: string }>

  return (
    <section className="py-20 bg-soul-dark-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t(`${serviceKey}.hero.title`)}
          </h2>
          <div className={`w-24 h-1 bg-gradient-to-r ${color} mx-auto rounded-full`} />
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuresRaw.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative p-6 bg-soul-dark rounded-2xl border border-gray-800 hover:border-soul-purple/50 transition-all duration-300"
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />

              <div className="relative">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4`}>
                  <CheckCircle className="text-white" size={24} />
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-soul-purple-light transition-colors">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-400">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
