'use client'


import { useTranslations } from 'next-intl'
import { Lightbulb, ArrowRight, CheckCircle2 } from 'lucide-react'

interface ServiceUseCasesProps {
  serviceKey: string
  color: string
}

interface UseCase {
  problem: string
  solution: string
  result: string
}

export function ServiceUseCases({ serviceKey, color }: ServiceUseCasesProps) {
  const t = useTranslations('serviceDetails')

  // Get use cases array from translations
  const useCasesRaw = t.raw(`${serviceKey}.useCases`) as UseCase[]

  return (
    <section className="py-20 bg-soul-dark relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className={`absolute top-1/4 left-0 w-96 h-96 bg-gradient-to-r ${color} rounded-full blur-3xl`} />
        <div className={`absolute bottom-1/4 right-0 w-96 h-96 bg-gradient-to-r ${color} rounded-full blur-3xl`} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div
          
          
          
          className="text-center mb-16"
        >
          <span className="text-soul-purple font-semibold">{t('useCases.title')}</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-4">
            {t('useCases.subtitle')}
          </h2>
        </div>

        {/* Use Cases */}
        <div className="space-y-12">
          {useCasesRaw.map((useCase, index) => (
            <div
              key={index}
              
              
              
              
              className="relative"
            >
              <div className="bg-soul-dark-card rounded-2xl border border-gray-800 overflow-hidden">
                {/* Use Case Number Badge */}
                <div className={`absolute -top-4 left-8 px-4 py-2 bg-gradient-to-r ${color} rounded-full`}>
                  <span className="text-white font-bold text-sm">#{index + 1}</span>
                </div>

                <div className="p-8 pt-10">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Problem */}
                    <div
                      
                      
                      
                      
                      className="relative"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                          <Lightbulb className="w-6 h-6 text-red-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-red-400 mb-2">
                            {t('useCases.problemLabel')}
                          </h3>
                          <p className="text-gray-300 leading-relaxed">
                            {useCase.problem}
                          </p>
                        </div>
                      </div>

                      {/* Arrow (desktop) */}
                      <div className="hidden lg:flex absolute top-1/2 -right-4 transform -translate-y-1/2">
                        <ArrowRight className="w-8 h-8 text-gray-600" />
                      </div>
                    </div>

                    {/* Solution */}
                    <div
                      
                      
                      
                      
                      className="relative"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                          <span className="!text-white font-bold text-lg">SC</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-soul-purple mb-2">
                            {t('useCases.solutionLabel')}
                          </h3>
                          <p className="text-gray-300 leading-relaxed">
                            {useCase.solution}
                          </p>
                        </div>
                      </div>

                      {/* Arrow (desktop) */}
                      <div className="hidden lg:flex absolute top-1/2 -right-4 transform -translate-y-1/2">
                        <ArrowRight className="w-8 h-8 text-gray-600" />
                      </div>
                    </div>

                    {/* Result */}
                    <div
                      
                      
                      
                      
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                          <CheckCircle2 className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-green-400 mb-2">
                            {t('useCases.resultLabel')}
                          </h3>
                          <p className="text-gray-300 leading-relaxed">
                            {useCase.result}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom gradient line */}
                <div className={`h-1 bg-gradient-to-r ${color}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
