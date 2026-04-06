'use client'

import { useState } from 'react'
import { MotionDiv } from '@/lib/motion'
import { Send, Mail, MessageCircle, MapPin, Clock, CheckCircle, AlertCircle, Briefcase } from 'lucide-react'
import { useTranslations } from 'next-intl'

const serviceKeys = [
  'ai', 'software', 'cybersecurity', 'integrations', 'industrial', 'design',
  'ecommerce', 'marketing', 'mentoring', 'data', 'cloud', 'legacy'
]

const budgetKeys = ['under1k', '1kTo5k', '5kTo15k', '15kTo50k', 'over50k', 'tbd']

export function Contact() {
  const t = useTranslations('contact')
  const tServices = useTranslations('services')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: '',
    budget: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(false)

    try {
      const response = await fetch('https://formspree.io/f/xqezzbgk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        setIsSubmitted(true)
      } else {
        setSubmitError(true)
      }
    } catch (error) {
      setSubmitError(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contacto" className="py-24 bg-soul-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <MotionDiv
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
        </MotionDiv>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <MotionDiv
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {isSubmitted ? (
              <div className="bg-soul-dark-card rounded-2xl p-8 border border-green-500/30 text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{t('success.title')}</h3>
                <p className="text-gray-400">{t('success.message')}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-soul-dark-card rounded-2xl p-8 border border-gray-800">
                <div className="space-y-6">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                      {t('form.name')}
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-soul-dark-lighter border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-soul-purple focus:border-soul-purple transition-colors text-white"
                      placeholder={t('form.namePlaceholder')}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      {t('form.email')}
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-soul-dark-lighter border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-soul-purple focus:border-soul-purple transition-colors text-white"
                      placeholder={t('form.emailPlaceholder')}
                    />
                  </div>

                  {/* Service */}
                  <div>
                    <label htmlFor="service" className="block text-sm font-medium text-gray-300 mb-2">
                      {t('form.service')}
                    </label>
                    <select
                      id="service"
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-soul-dark-lighter border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-soul-purple focus:border-soul-purple transition-colors text-white"
                    >
                      <option value="">{t('form.servicePlaceholder')}</option>
                      {serviceKeys.map((key) => (
                        <option key={key} value={tServices(`items.${key}.title`)}>
                          {tServices(`items.${key}.title`)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Budget */}
                  <div>
                    <label htmlFor="budget" className="block text-sm font-medium text-gray-300 mb-2">
                      {t('form.budget')}
                    </label>
                    <select
                      id="budget"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-soul-dark-lighter border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-soul-purple focus:border-soul-purple transition-colors text-white"
                    >
                      <option value="">{t('form.budgetPlaceholder')}</option>
                      {budgetKeys.map((key) => (
                        <option key={key} value={t(`budgets.${key}`)}>
                          {t(`budgets.${key}`)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                      {t('form.message')}
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="w-full px-4 py-3 bg-soul-dark-lighter border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-soul-purple focus:border-soul-purple transition-colors text-white resize-none"
                      placeholder={t('form.messagePlaceholder')}
                    />
                  </div>

                  {/* Error Message */}
                  {submitError && (
                    <div className="flex items-center p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                      <AlertCircle size={20} className="text-red-500 mr-3 flex-shrink-0" />
                      <p className="text-red-400 text-sm">
                        {t('form.error')}
                      </p>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-soul-purple hover:bg-soul-purple-dark rounded-xl font-semibold text-white transition-all duration-200 glow-hover flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      t('form.submitting')
                    ) : (
                      <>
                        {t('form.submit')}
                        <Send size={18} className="ml-2" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </MotionDiv>

          {/* Contact Info */}
          <MotionDiv
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* Quick Contact */}
            <div className="bg-soul-dark-card rounded-2xl p-6 border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-6">{t('direct.title')}</h3>
              <div className="space-y-4">
                <a
                  href="mailto:founder@soulcore.dev"
                  className="flex items-center p-4 bg-soul-dark-lighter rounded-xl hover:bg-soul-purple/20 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-xl bg-soul-purple/20 flex items-center justify-center mr-4">
                    <Mail className="text-soul-purple" size={24} />
                  </div>
                  <div>
                    <p className="text-white font-medium group-hover:text-soul-purple-light">{t('direct.email')}</p>
                    <p className="text-gray-400 text-sm">founder@soulcore.dev</p>
                  </div>
                </a>

                <a
                  href="https://wa.me/18495813171"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-4 bg-soul-dark-lighter rounded-xl hover:bg-green-500/20 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mr-4">
                    <MessageCircle className="text-green-500" size={24} />
                  </div>
                  <div>
                    <p className="text-white font-medium group-hover:text-green-400">{t('direct.whatsapp')}</p>
                    <p className="text-gray-400 text-sm">+1 (849) 581-3171</p>
                  </div>
                </a>

                <a
                  href="https://www.upwork.com/freelancers/~010d6fc4b093936c79"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-4 bg-soul-dark-lighter rounded-xl hover:bg-emerald-500/20 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mr-4">
                    <Briefcase className="text-emerald-500" size={24} />
                  </div>
                  <div>
                    <p className="text-white font-medium group-hover:text-emerald-400">{t('direct.upwork')}</p>
                    <p className="text-gray-400 text-sm">{t('direct.upworkSubtitle')}</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-soul-dark-card rounded-2xl p-6 border border-gray-800">
                <MapPin className="text-soul-purple mb-3" size={24} />
                <h4 className="text-white font-medium mb-1">{t('location.title')}</h4>
                <p className="text-gray-400 text-sm">{t('location.country')}</p>
                <p className="text-gray-500 text-xs mt-1">{t('location.global')}</p>
              </div>

              <div className="bg-soul-dark-card rounded-2xl p-6 border border-gray-800">
                <Clock className="text-soul-purple mb-3" size={24} />
                <h4 className="text-white font-medium mb-1">{t('availability.title')}</h4>
                <p className="text-gray-400 text-sm">{t('availability.hours')}</p>
                <p className="text-gray-500 text-xs mt-1">{t('availability.response')}</p>
              </div>
            </div>

            {/* Special Offer */}
            <div className="bg-gradient-to-br from-soul-purple/20 to-violet-600/20 rounded-2xl p-6 border border-soul-purple/30">
              <h3 className="text-xl font-bold text-white mb-2">{t('offer.title')}</h3>
              <p className="text-gray-300 mb-4">{t('offer.subtitle')}</p>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-300">
                  <CheckCircle size={16} className="text-green-400 mr-2" />
                  {t('offer.discount')}
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle size={16} className="text-green-400 mr-2" />
                  {t('offer.consulting')}
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle size={16} className="text-green-400 mr-2" />
                  {t('offer.support')}
                </li>
              </ul>
            </div>
          </MotionDiv>
        </div>
      </div>
    </section>
  )
}
