'use client'


import { useTranslations } from 'next-intl'

interface ServiceProcessProps {
  serviceKey: string
  color: string
}

export function ServiceProcess({ serviceKey, color }: ServiceProcessProps) {
  const t = useTranslations('serviceDetails')

  // Get process steps from translations — hide section if no data
  let processRaw: Array<{ title: string; description: string }> = []
  try {
    processRaw = t.raw(`${serviceKey}.process`) as Array<{ title: string; description: string }>
  } catch { /* translation key missing */ }

  if (!processRaw || processRaw.length === 0) return null

  return (
    <section className="py-20 bg-soul-dark relative overflow-hidden">
      <img
        src="/generated/svc-process-bg.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-10 ai-bg-img"
        onError={(e: any) => { e.target.style.display = 'none' }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div
          
          
          
          className="text-center mb-16"
        >
          <span className="text-soul-purple font-semibold">{t('process.title')}</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-4">
            {t('process.subtitle')}
          </h2>
        </div>

        {/* Process Timeline */}
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-soul-purple via-soul-purple/50 to-transparent transform md:-translate-x-1/2" />

          <div className="space-y-12">
            {processRaw.map((step, index) => (
              <div
                key={index}
                
                
                
                
                className={`relative flex items-center gap-8 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Step number */}
                <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 z-10">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${color} flex items-center justify-center shadow-lg shadow-soul-purple/30`}>
                    <span className="text-2xl font-bold !text-white">{index + 1}</span>
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
