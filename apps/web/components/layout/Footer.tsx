'use client'

import Link from 'next/link'
import { Github, Linkedin, Mail, MessageCircle, Briefcase } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'

const socialLinks = [
  { icon: Github, href: 'https://github.com/Ranx043', label: 'GitHub' },
  { icon: Linkedin, href: 'https://linkedin.com/company/soulcore-dev', label: 'LinkedIn' },
  { icon: Mail, href: 'mailto:founder@soulcore.dev', label: 'Email' },
  { icon: MessageCircle, href: 'https://wa.me/18495813171', label: 'WhatsApp' },
  { icon: Briefcase, href: 'https://www.upwork.com/freelancers/~010d6fc4b093936c79', label: 'Upwork' },
]

export function Footer() {
  const t = useTranslations('footer')
  const tServices = useTranslations('services')
  const locale = useLocale()

  const serviceLinks = [
    { key: 'ai', slug: 'ai' },
    { key: 'software', slug: 'software' },
    { key: 'cybersecurity', slug: 'cybersecurity' },
    { key: 'integrations', slug: 'integrations' },
  ]

  const companyLinks = [
    { key: 'aboutUs', href: '#equipo' },
    { key: 'portfolio', href: '#portafolio' },
    { key: 'contact', href: '#contacto' },
  ]

  const resourceLinks = [
    { label: 'GitHub', href: 'https://github.com/Ranx043' },
    { key: 'fullPortfolio', href: 'https://ranx043.github.io/SOUL_CORE_PORTFOLIO/' },
    { label: 'VMOF Framework', href: '#productos' },
    { label: 'SOUL CORE MCP', href: '#productos' },
  ]

  return (
    <footer className="bg-soul-dark-card border-t border-soul-purple/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href={`/${locale}`} className="flex items-center mb-4">
              <img
                src="/logo_black.png"
                alt="SOUL CORE"
                className="h-16 w-auto"
              />
            </Link>
            <p className="text-gray-400 mb-6 max-w-sm">
              {t('tagline')}
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-soul-dark-lighter hover:bg-soul-purple/20 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon size={20} className="text-gray-400 hover:text-soul-purple" />
                </a>
              ))}
            </div>
          </div>

          {/* Servicios */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('services')}</h3>
            <ul className="space-y-3">
              {serviceLinks.map((link) => (
                <li key={link.key}>
                  <Link
                    href={`/${locale}/servicios/${link.slug}`}
                    className="text-gray-400 hover:text-soul-purple transition-colors text-sm"
                  >
                    {tServices(`items.${link.key}.title`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('company')}</h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-soul-purple transition-colors text-sm"
                  >
                    {t(`links.${link.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Recursos */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('resources')}</h3>
            <ul className="space-y-3">
              {resourceLinks.map((link) => {
                const isExternal = link.href.startsWith('http')
                return (
                  <li key={link.key || link.label}>
                    <Link
                      href={link.href}
                      target={isExternal ? '_blank' : undefined}
                      rel={isExternal ? 'noopener noreferrer' : undefined}
                      className="text-gray-400 hover:text-soul-purple transition-colors text-sm"
                    >
                      {link.key ? t(`links.${link.key}`) : link.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} SOUL CORE DEVELOPERS GROUP. {t('copyright')}
            </p>
            <div className="flex items-center gap-4 mt-2 md:mt-0">
              <Link
                href={`/${locale}/privacy`}
                className="text-gray-500 hover:text-soul-purple transition-colors text-sm"
              >
                {t('links.privacy')}
              </Link>
              <span className="text-gray-700">|</span>
              <Link
                href={`/${locale}/terms`}
                className="text-gray-500 hover:text-soul-purple transition-colors text-sm"
              >
                {t('links.terms')}
              </Link>
              <span className="text-gray-700">|</span>
              <p className="text-gray-500 text-sm">
                🌍 {t('location')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
