'use client'


import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import {
  Package, Brain, Shield, TrendingUp, Boxes, Plug, Code, Cpu, Zap,
  ArrowRight, Star, Download, ExternalLink, Clock
} from 'lucide-react'
import { type Product, formatPrice, formatRating, parseTechStack, timeAgo } from '@/lib/api'

const iconMap: Record<string, any> = {
  Package, Brain, Shield, TrendingUp, Boxes, Plug, Code, Cpu, Zap,
}

const defaultGradients = [
  'from-violet-500 to-purple-600',
  'from-emerald-500 to-green-600',
  'from-pink-500 to-rose-600',
  'from-blue-500 to-cyan-600',
  'from-amber-500 to-orange-600',
  'from-teal-500 to-cyan-600',
]

interface ProductCardProps {
  product: Product
  index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const locale = useLocale()
  const t = useTranslations('store')
  const Icon = iconMap[product.icon] || Package
  const gradient = product.color || defaultGradients[index % defaultGradients.length]
  const techStack = parseTechStack(product.tech_stack)

  return (
    <Link href={`/${locale}/store/${product.id}`}>
      <div
        
        
        
        
        className="group relative bg-soul-dark-card rounded-2xl border border-gray-800 overflow-hidden hover:border-soul-purple/50 hover:scale-[1.02] transition-all duration-300 cursor-pointer h-full flex flex-col"
      >
        {/* Gradient Header */}
        <div className={`h-36 bg-gradient-to-br ${gradient} relative`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Icon size={32} className="text-white" />
            </div>
          </div>

          {/* Badge */}
          {product.badge && (
            <div className="absolute top-3 right-3">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                product.badge === 'Popular' ? 'bg-amber-500/90 text-black' :
                product.badge === 'New' ? 'bg-green-500/90 text-white' :
                product.badge === 'Sale' ? 'bg-red-500/90 text-white' :
                'bg-soul-purple/90 text-white'
              }`}>
                {product.badge}
              </span>
            </div>
          )}

          {/* Category */}
          {product.category && (
            <div className="absolute top-3 left-3">
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-black/40 text-white/90">
                {product.category}
              </span>
            </div>
          )}

          {/* Version */}
          {product.version && (
            <div className="absolute bottom-3 right-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-black/40 text-white/70">
                v{product.version}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <h3 className="text-lg font-bold text-white mb-1 group-hover:text-soul-purple-light transition-colors">
            {product.name}
          </h3>

          {product.tagline && (
            <p className="text-gray-400 text-sm mb-3 line-clamp-2">{product.tagline}</p>
          )}

          {/* Tech Stack Tags */}
          {techStack.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {techStack.slice(0, 4).map((tech) => (
                <span key={tech} className="px-2 py-0.5 bg-soul-dark-lighter rounded text-[11px] text-gray-400 border border-gray-800">
                  {tech}
                </span>
              ))}
              {techStack.length > 4 && (
                <span className="px-2 py-0.5 text-[11px] text-gray-600">+{techStack.length - 4}</span>
              )}
            </div>
          )}

          {/* Metrics Row */}
          <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
            {product.rating > 0 && (
              <span className="flex items-center gap-1">
                <Star size={12} className="text-amber-400 fill-amber-400" />
                {formatRating(product.rating)}
                {product.review_count > 0 && (
                  <span className="text-gray-600">({product.review_count})</span>
                )}
              </span>
            )}
            {product.downloads > 0 && (
              <span className="flex items-center gap-1">
                <Download size={12} />
                {product.downloads >= 1000
                  ? `${(product.downloads / 1000).toFixed(1)}K`
                  : product.downloads}
              </span>
            )}
            {product.updated_at && (
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {timeAgo(product.updated_at)}
              </span>
            )}
          </div>

          {/* Author */}
          <div className="flex items-center gap-2 mb-4 mt-auto">
            <div className="w-5 h-5 rounded-full bg-soul-purple/30 flex items-center justify-center text-[10px] text-soul-purple-light font-bold">
              {(product.author || 'S')[0]}
            </div>
            <span className="text-xs text-gray-500">{product.author || 'SoulCore Dev'}</span>
          </div>

          {/* Price + CTA */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-800">
            <span className="text-xl font-bold text-white">
              {formatPrice(product.price_cents, product.price_type)}
            </span>
            <div className="flex items-center gap-2">
              {product.demo_url && (
                <span className="text-gray-500 text-xs flex items-center">
                  <ExternalLink size={11} className="mr-0.5" />
                  {t('demo')}
                </span>
              )}
              <span className="flex items-center text-soul-purple group-hover:text-soul-purple-light text-sm font-medium transition-colors">
                {t('view')}
                <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
