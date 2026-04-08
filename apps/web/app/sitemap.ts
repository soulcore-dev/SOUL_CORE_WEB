import type { MetadataRoute } from 'next'

const BASE_URL = 'https://soulcore.dev'
const locales = ['es', 'en', 'pt', 'fr', 'de']
const services = [
  'ai', 'software', 'industrial', 'cybersecurity', 'integrations', 'design',
  'ecommerce', 'marketing', 'mentoring', 'data', 'cloud', 'legacy',
]

function makeAlternates(path: string) {
  const languages: Record<string, string> = {}
  for (const locale of locales) {
    languages[locale] = `${BASE_URL}/${locale}${path}`
  }
  languages['x-default'] = `${BASE_URL}/en${path}`
  return { languages }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString()
  const entries: MetadataRoute.Sitemap = []

  // Homepage — all locales
  for (const locale of locales) {
    entries.push({
      url: `${BASE_URL}/${locale}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
      alternates: makeAlternates(''),
    })
  }

  // Service pages — 12 services x 5 locales
  for (const locale of locales) {
    for (const service of services) {
      entries.push({
        url: `${BASE_URL}/${locale}/servicios/${service}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.8,
        alternates: makeAlternates(`/servicios/${service}`),
      })
    }
  }

  // Store
  for (const locale of locales) {
    entries.push({
      url: `${BASE_URL}/${locale}/store`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
      alternates: makeAlternates('/store'),
    })
  }

  // Static pages
  const staticPages = ['/terms', '/privacy']
  for (const locale of locales) {
    for (const page of staticPages) {
      entries.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: now,
        changeFrequency: 'yearly',
        priority: 0.3,
        alternates: makeAlternates(page),
      })
    }
  }

  return entries
}
