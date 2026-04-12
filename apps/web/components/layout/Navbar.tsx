'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

import { usePathname, useRouter } from 'next/navigation'

import { Menu, X, Moon, Sun, Globe, ShoppingBag, Settings, User } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { isAdminAuthenticated } from '@/lib/admin-auth'

export function Navbar() {
  const t = useTranslations('nav')
  const tLang = useTranslations('language')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isDark, setIsDark] = useState(true)
  const [showLangMenu, setShowLangMenu] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  // Check admin status
  useEffect(() => {
    setIsAdmin(isAdminAuthenticated())
  }, [])

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'light') {
      setIsDark(false)
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)

    if (newIsDark) {
      document.documentElement.classList.remove('light')
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
      localStorage.setItem('theme', 'light')
    }
  }

  const switchLocale = (newLocale: string) => {
    const currentPath = pathname.replace(`/${locale}`, '')
    router.push(`/${newLocale}${currentPath || ''}`)
    setShowLangMenu(false)
  }

  const isOnLanding = pathname === `/${locale}` || pathname === `/${locale}/`

  const prefix = isOnLanding ? '' : `/${locale}`
  const landingLinks = [
    { href: `${prefix}#servicios`, labelKey: 'services' },
    { href: `${prefix}#portafolio`, labelKey: 'portfolio' },
    { href: `${prefix}#equipo`, labelKey: 'team' },
    { href: `${prefix}#contacto`, labelKey: 'contact' },
  ]

  const navLinks = landingLinks

  return (
    <nav
      aria-label="Main navigation"

      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center">
            <img
              src={isDark ? '/logo_black.png' : '/logo_clear.png'}
              alt="SOUL CORE"
              className="h-14 md:h-16 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-300 hover:text-soul-purple transition-colors duration-200"
              >
                {t(link.labelKey)}
              </Link>
            ))}

            {/* Store Link */}
            <Link
              href={`/${locale}/store`}
              className="flex items-center text-gray-300 hover:text-soul-purple transition-colors duration-200"
            >
              <ShoppingBag size={18} className="mr-1" />
              {t('store')}
            </Link>

            {/* Account Link */}
            <Link
              href={`/${locale}/account`}
              className="flex items-center text-gray-300 hover:text-soul-purple transition-colors duration-200"
            >
              <User size={18} className="mr-1" />
              {t('account')}
            </Link>

            {/* Admin Link — only visible to authenticated admins */}
            {isAdmin && (
              <Link
                href={`/${locale}/admin`}
                className="flex items-center text-gray-300 hover:text-soul-purple transition-colors duration-200"
              >
                <Settings size={18} className="mr-1" />
                {t('admin')}
              </Link>
            )}

            {/* CTA Button */}
            <Link
              href={isOnLanding ? '#contacto' : `/${locale}/#contacto`}
              className="px-6 py-2 bg-soul-purple hover:bg-soul-purple-dark rounded-lg font-medium !text-white transition-all duration-200 glow-hover"
            >
              {t('quote')}
            </Link>

            {/* Language & Theme — after CTA per Randhy feedback */}
            <div className="flex items-center space-x-1 border-l border-gray-700 pl-3 ml-1">
              <div className="relative">
                <button
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="flex items-center space-x-1 p-2 rounded-lg hover:bg-soul-dark-card transition-colors"
                  aria-expanded={showLangMenu}
                  aria-haspopup="true"
                  aria-label="Select language"
                >
                  <Globe size={16} />
                  <span className="text-xs uppercase">{locale}</span>
                </button>
                {showLangMenu && (
                  <div className="absolute top-full right-0 mt-2 bg-soul-dark-card border border-gray-700 rounded-lg overflow-hidden shadow-xl">
                    <button onClick={() => switchLocale('es')} className={`w-full px-4 py-2 text-left text-sm hover:bg-soul-purple/20 transition-colors ${locale === 'es' ? 'text-soul-purple' : 'text-gray-300'}`}>{tLang('es')}</button>
                    <button onClick={() => switchLocale('en')} className={`w-full px-4 py-2 text-left text-sm hover:bg-soul-purple/20 transition-colors ${locale === 'en' ? 'text-soul-purple' : 'text-gray-300'}`}>{tLang('en')}</button>
                    <button onClick={() => switchLocale('pt')} className={`w-full px-4 py-2 text-left text-sm hover:bg-soul-purple/20 transition-colors ${locale === 'pt' ? 'text-soul-purple' : 'text-gray-300'}`}>{tLang('pt')}</button>
                    <button onClick={() => switchLocale('fr')} className={`w-full px-4 py-2 text-left text-sm hover:bg-soul-purple/20 transition-colors ${locale === 'fr' ? 'text-soul-purple' : 'text-gray-300'}`}>{tLang('fr')}</button>
                    <button onClick={() => switchLocale('de')} className={`w-full px-4 py-2 text-left text-sm hover:bg-soul-purple/20 transition-colors ${locale === 'de' ? 'text-soul-purple' : 'text-gray-300'}`}>{tLang('de')}</button>
                  </div>
                )}
              </div>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-soul-dark-card transition-colors"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Language Selector */}
            <button
              onClick={() => {
                const localeOrder = ['es', 'en', 'pt', 'fr', 'de']
                const currentIndex = localeOrder.indexOf(locale)
                const nextIndex = (currentIndex + 1) % localeOrder.length
                switchLocale(localeOrder[nextIndex])
              }}
              className="p-2 rounded-lg bg-soul-dark-card text-xs font-bold uppercase"
              aria-label="Switch language"
            >
              {locale}
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-soul-dark-card"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg bg-soul-dark-card"
              aria-expanded={isOpen}
              aria-label={isOpen ? t('closeMenu') : t('openMenu')}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div
            
            
            
            className="md:hidden mt-4 pb-4"
          >
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-gray-300 hover:text-soul-purple transition-colors py-2"
                >
                  {t(link.labelKey)}
                </Link>
              ))}
              <Link
                href={`/${locale}/store`}
                onClick={() => setIsOpen(false)}
                className="flex items-center text-gray-300 hover:text-soul-purple transition-colors py-2"
              >
                <ShoppingBag size={18} className="mr-2" />
                {t('store')}
              </Link>
              <Link
                href={`/${locale}/account`}
                onClick={() => setIsOpen(false)}
                className="flex items-center text-gray-300 hover:text-soul-purple transition-colors py-2"
              >
                <User size={18} className="mr-2" />
                {t('account')}
              </Link>
              {isAdmin && (
                <Link
                  href={`/${locale}/admin`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center text-gray-300 hover:text-soul-purple transition-colors py-2"
                >
                  <Settings size={18} className="mr-2" />
                  {t('admin')}
                </Link>
              )}
              <Link
                href={isOnLanding ? '#contacto' : `/${locale}/#contacto`}
                onClick={() => setIsOpen(false)}
                className="px-6 py-3 bg-soul-purple rounded-lg font-medium text-center"
              >
                {t('quoteProject')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
