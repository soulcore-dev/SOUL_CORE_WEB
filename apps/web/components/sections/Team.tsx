'use client'

import { motion } from 'framer-motion'
import { Code, Cpu, Zap, Shield, Users, Rocket, Brain, Globe } from 'lucide-react'
import { useTranslations } from 'next-intl'

const capabilityData = [
  { key: 'development', icon: Code },
  { key: 'aiPowered', icon: Brain },
  { key: 'automation', icon: Cpu },
  { key: 'security', icon: Shield },
  { key: 'speed', icon: Zap },
  { key: 'global', icon: Globe },
]

export function Team() {
  const t = useTranslations('team')

  const networkBenefits = t.raw('network.benefits') as string[]
  const techStack = t.raw('techStack') as string[]

  return (
    <section id="equipo" className="py-24 bg-soul-dark-lighter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-soul-purple font-semibold">{t('label')}</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">
            {t('title')}
          </h2>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Main Team Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-soul-dark-card rounded-2xl p-8 border border-gray-800 mb-8"
        >
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-soul-purple to-violet-600 flex items-center justify-center">
                <Rocket size={48} className="text-white" />
              </div>
            </div>
            <div className="flex-1 text-center lg:text-left">
              <h3 className="text-2xl font-bold text-white mb-2">{t('mainTeam.title')}</h3>
              <p className="text-gray-400 mb-4">{t('mainTeam.description')}</p>
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                {techStack.map((tech: string) => (
                  <span
                    key={tech}
                    className="px-3 py-1 bg-soul-purple/20 text-soul-purple-light rounded-full text-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Capabilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {capabilityData.map((capability, index) => (
            <motion.div
              key={capability.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group bg-soul-dark-card rounded-2xl p-6 border border-gray-800 hover:border-soul-purple/50 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-soul-purple to-violet-600 flex items-center justify-center mb-4">
                <capability.icon size={24} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-soul-purple-light transition-colors">
                {t(`capabilities.${capability.key}.title`)}
              </h3>
              <p className="text-gray-400 text-sm">
                {t(`capabilities.${capability.key}.description`)}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Network Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-soul-dark-card rounded-2xl p-8 border border-gray-800"
        >
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-6 md:mb-0">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mr-4">
                <Users size={32} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{t('network.title')}</h3>
                <p className="text-gray-400">{t('network.subtitle')}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {networkBenefits.map((benefit: string) => (
                <div key={benefit} className="flex items-center">
                  <div className="w-2 h-2 bg-soul-purple rounded-full mr-2" />
                  <span className="text-gray-300 text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
