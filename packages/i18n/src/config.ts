export const locales = ['es', 'en', 'pt', 'fr', 'de'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'es'

// Mapping of browser language codes to supported locales
export const languageMapping: Record<string, Locale> = {
  'es': 'es',
  'es-ES': 'es',
  'es-MX': 'es',
  'es-AR': 'es',
  'es-CO': 'es',
  'es-CL': 'es',
  'es-PE': 'es',
  'en': 'en',
  'en-US': 'en',
  'en-GB': 'en',
  'en-AU': 'en',
  'en-CA': 'en',
  'pt': 'pt',
  'pt-BR': 'pt',
  'pt-PT': 'pt',
  'fr': 'fr',
  'fr-FR': 'fr',
  'fr-CA': 'fr',
  'fr-BE': 'fr',
  'fr-CH': 'fr',
  'de': 'de',
  'de-DE': 'de',
  'de-AT': 'de',
  'de-CH': 'de',
}
