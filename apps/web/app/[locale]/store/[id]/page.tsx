'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import {
  Package, Brain, Shield, TrendingUp, Boxes, Plug, Code, Cpu, Zap,
  ArrowLeft, ShoppingCart, Check, Loader2, Star, Download, ChevronDown,
  Monitor, Globe, FileCode, Lock, Clock, Sparkles, ExternalLink, Tag, User
} from 'lucide-react'
import { getProduct, getProducts, type Product, formatPrice, formatRating, parseFeatures, parseSpecs, parseTechStack, timeAgo } from '@/lib/api'

const iconMap: Record<string, any> = {
  Package, Brain, Shield, TrendingUp, Boxes, Plug, Code, Cpu, Zap,
}

const gradients = [
  'from-violet-500 to-purple-600',
  'from-emerald-500 to-green-600',
  'from-pink-500 to-rose-600',
  'from-blue-500 to-cyan-600',
  'from-amber-500 to-orange-600',
  'from-teal-500 to-cyan-600',
]

export default function ProductDetailPage() {
  const t = useTranslations('storeDetail')
  const locale = useLocale()
  const params = useParams()
  const productId = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [prod, allProds] = await Promise.all([
          getProduct(productId),
          getProducts(),
        ])
        setProduct(prod)
        if (allProds.data) {
          setRelated(allProds.data.filter(p => String(p.id) !== productId).slice(0, 3))
        }
      } catch { /* */ }
      finally { setLoading(false) }
    }
    load()
  }, [productId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 size={32} className="text-soul-purple animate-spin" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20">
        <p className="text-gray-400 text-lg mb-4">{t('notFound')}</p>
        <Link href={`/${locale}/store`} className="px-6 py-3 bg-soul-purple rounded-xl text-white hover:bg-soul-purple-dark transition-colors">
          {t('backToStore')}
        </Link>
      </div>
    )
  }

  const Icon = iconMap[product.icon] || Package
  const features = parseFeatures(product.features)
  const specs = parseSpecs(product.specs)
  const techStack = parseTechStack(product.tech_stack)

  const faqs = [
    { q: locale === 'es' ? 'Como recibo mi licencia?' : 'How do I receive my license?', a: locale === 'es' ? 'Inmediatamente despues de la compra recibiras un email con tu clave de licencia y el link de descarga.' : 'Immediately after purchase you will receive an email with your license key and download link.' },
    { q: locale === 'es' ? 'Puedo usarlo en multiples maquinas?' : 'Can I use it on multiple machines?', a: locale === 'es' ? 'Cada licencia se vincula a una maquina. Puedes re-vincular hasta 3 veces por ano.' : 'Each license binds to one machine. You can rebind up to 3 times per year.' },
    { q: locale === 'es' ? 'Hay garantia de devolucion?' : 'Is there a money-back guarantee?', a: locale === 'es' ? 'Si, ofrecemos 30 dias de garantia. Si no estas satisfecho, te devolvemos el 100%.' : 'Yes, we offer a 30-day money-back guarantee. Full refund if not satisfied.' },
  ]

  return (
    <>
      <section className="pt-28 pb-12 bg-soul-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Link href={`/${locale}/store`} className="inline-flex items-center text-gray-400 hover:text-soul-purple transition-colors mb-8">
              <ArrowLeft size={18} className="mr-2" />
              {t('backToStore')}
            </Link>
          </motion.div>

          {/* Hero: Text Left + Icon Right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Info */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              {product.category && (
                <span className="text-soul-purple font-semibold text-sm mb-2 inline-block">{product.category}</span>
              )}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">{product.name}</h1>
              {product.tagline && (
                <p className="text-xl text-gray-400 mb-6">{product.tagline}</p>
              )}

              {/* Metrics */}
              <div className="flex items-center gap-4 mb-6 text-sm">
                {product.rating > 0 && (
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <Star size={16} className="fill-amber-400" />
                    <span className="font-semibold">{formatRating(product.rating)}</span>
                    {product.review_count > 0 && (
                      <span className="text-gray-500">({product.review_count} reviews)</span>
                    )}
                  </span>
                )}
                {product.downloads > 0 && (
                  <span className="flex items-center gap-1.5 text-gray-400">
                    <Download size={16} />
                    {product.downloads >= 1000 ? `${(product.downloads / 1000).toFixed(1)}K` : product.downloads} downloads
                  </span>
                )}
                {product.badge && (
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    product.badge === 'Popular' ? 'bg-amber-500/20 text-amber-400' :
                    product.badge === 'New' ? 'bg-green-500/20 text-green-400' :
                    'bg-soul-purple/20 text-soul-purple-light'
                  }`}>{product.badge}</span>
                )}
              </div>

              {/* Tech Stack Tags */}
              {techStack.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {techStack.map((tech) => (
                    <span key={tech} className="px-2.5 py-1 bg-soul-dark-lighter rounded-lg text-xs text-gray-300 border border-gray-700">
                      {tech}
                    </span>
                  ))}
                </div>
              )}

              {/* Author + Version + Updated */}
              <div className="flex items-center gap-4 mb-6 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-soul-purple/30 flex items-center justify-center text-[10px] text-soul-purple-light font-bold">
                    {(product.author || 'S')[0]}
                  </div>
                  {product.author || 'SoulCore Dev'}
                </span>
                {product.version && (
                  <span className="flex items-center gap-1 font-mono text-xs">
                    <Tag size={12} />
                    v{product.version}
                  </span>
                )}
                {product.updated_at && (
                  <span className="flex items-center gap-1 text-xs">
                    <Clock size={12} />
                    Updated {timeAgo(product.updated_at)}
                  </span>
                )}
                {product.demo_url && (
                  <a
                    href={product.demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-soul-purple hover:text-soul-purple-light transition-colors"
                  >
                    <ExternalLink size={12} />
                    Live Demo
                  </a>
                )}
              </div>

              {/* Quick Features */}
              {features.length > 0 && (
                <ul className="space-y-2 mb-8">
                  {features.slice(0, 4).map((f, i) => (
                    <li key={i} className="flex items-start text-gray-300">
                      <Check size={18} className="text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              )}

              {/* Price + CTA */}
              <div className="flex items-center gap-4 mb-4">
                <span className="text-4xl font-bold text-white">
                  {formatPrice(product.price_cents, product.price_type)}
                </span>
                {product.price_type !== 'one_time' && product.price_cents > 0 && (
                  <span className="text-gray-500 text-sm">
                    {product.price_type === 'monthly' ? 'per month' : 'per year'}
                  </span>
                )}
              </div>

              <button className="w-full sm:w-auto px-8 py-4 bg-soul-purple hover:bg-soul-purple-dark rounded-xl font-semibold text-white transition-all duration-200 glow-hover flex items-center justify-center text-lg">
                <ShoppingCart size={22} className="mr-2" />
                {product.price_cents === 0 ? (locale === 'es' ? 'Descargar Gratis' : 'Download Free') : t('buyNow')}
              </button>

              {/* Trust */}
              <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Lock size={12} /> {t('secure')}</span>
                <span className="flex items-center gap-1"><Zap size={12} /> {t('instant')}</span>
                <span className="flex items-center gap-1"><Clock size={12} /> 30-day guarantee</span>
              </div>
            </motion.div>

            {/* Right: Product Visual */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="aspect-square max-w-md mx-auto bg-gradient-to-br from-soul-purple/30 to-violet-600/10 rounded-3xl flex items-center justify-center border border-soul-purple/20">
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-soul-purple to-violet-600 flex items-center justify-center shadow-2xl shadow-soul-purple/30">
                  <Icon size={64} className="text-white" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Description */}
      {product.description && (
        <section className="py-16 bg-soul-dark-lighter">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-2xl font-bold text-white mb-6">
                {locale === 'es' ? 'Descripcion' : 'Description'}
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-line">{product.description}</p>
            </motion.div>
          </div>
        </section>
      )}

      {/* Features Grid */}
      {features.length > 0 && (
        <section className="py-16 bg-soul-dark">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-2xl font-bold text-white mb-8 text-center">
                {locale === 'es' ? 'Caracteristicas' : 'Features'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {features.map((f, i) => (
                  <div key={i} className="bg-soul-dark-card rounded-xl p-5 border border-gray-800 flex items-start">
                    <div className="w-8 h-8 rounded-lg bg-soul-purple/20 flex items-center justify-center mr-3 flex-shrink-0">
                      <Sparkles size={16} className="text-soul-purple" />
                    </div>
                    <span className="text-gray-300 text-sm">{f}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Tech Specs */}
      {Object.keys(specs).length > 0 && (
        <section className="py-16 bg-soul-dark-lighter">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-2xl font-bold text-white mb-6">
                {locale === 'es' ? 'Especificaciones Tecnicas' : 'Technical Specs'}
              </h2>
              <div className="bg-soul-dark-card rounded-xl border border-gray-800 overflow-hidden">
                {Object.entries(specs).map(([key, value], i) => (
                  <div key={key} className={`flex items-center justify-between px-5 py-3.5 ${i > 0 ? 'border-t border-gray-800' : ''}`}>
                    <span className="text-gray-400 text-sm">{key}</span>
                    <span className="text-white text-sm font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="py-16 bg-soul-dark">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-2xl font-bold text-white mb-8 text-center">
              {locale === 'es' ? 'Preguntas Frecuentes' : 'FAQ'}
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-soul-dark-card rounded-xl border border-gray-800 overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left"
                  >
                    <span className="text-white font-medium">{faq.q}</span>
                    <ChevronDown size={18} className={`text-gray-500 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-4 text-gray-400 text-sm">{faq.a}</div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="py-16 bg-soul-dark-lighter">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">
              {locale === 'es' ? 'Productos Relacionados' : 'Related Products'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((p, i) => {
                const RIcon = iconMap[p.icon] || Package
                const grad = gradients[i % gradients.length]
                return (
                  <Link key={p.id} href={`/${locale}/store/${p.id}`}>
                    <div className="bg-soul-dark-card rounded-xl border border-gray-800 overflow-hidden hover:border-soul-purple/50 transition-all group">
                      <div className={`h-24 bg-gradient-to-br ${grad} flex items-center justify-center`}>
                        <RIcon size={28} className="text-white/80" />
                      </div>
                      <div className="p-4">
                        <h3 className="text-white font-semibold group-hover:text-soul-purple-light transition-colors">{p.name}</h3>
                        <p className="text-gray-500 text-sm mt-1">{p.tagline}</p>
                        <span className="text-white font-bold text-lg mt-2 block">{formatPrice(p.price_cents, p.price_type)}</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Mobile Sticky Buy Button */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-soul-dark-card/95 backdrop-blur-sm border-t border-gray-800 p-4 z-40">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div>
            <p className="text-white font-bold text-lg">{formatPrice(product.price_cents, product.price_type)}</p>
            <p className="text-gray-500 text-xs">{product.name}</p>
          </div>
          <button className="px-6 py-3 bg-soul-purple hover:bg-soul-purple-dark rounded-xl font-semibold text-white transition-all glow-hover flex items-center">
            <ShoppingCart size={18} className="mr-2" />
            {product.price_cents === 0 ? 'Get' : t('buyNow')}
          </button>
        </div>
      </div>
    </>
  )
}
