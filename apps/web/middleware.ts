import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './i18n/config'

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Whether to add a locale prefix to the URL
  localePrefix: 'always',

  // Auto-detect user's preferred language from browser
  localeDetection: true
})

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(es|en|pt|fr|de)/:path*']
}
