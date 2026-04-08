'use client'

import { useTranslations } from 'next-intl'
import type { LucideIcon } from 'lucide-react'
import {
  MessageCircle, Zap, Bot, FileText, Plug, Brain,
  Globe, Smartphone, Database, Cloud, Server, GitBranch,
  Cpu, Radio, BarChart3, Wrench, Settings, Factory,
  Shield, Search, Lock, FileCheck, Eye, GraduationCap,
  Link2, Webhook, Boxes, RefreshCcw, Code, Network,
  Palette, PenTool, Layout, Figma, MousePointer, Sparkles,
  ShoppingCart, CreditCard, Package, TrendingUp, Store, Truck,
  Megaphone, Target, Share2, Mail, PieChart, Users,
  BookOpen, Video, Languages, Lightbulb,
  LineChart, Filter, Layers, Activity,
  Container, Monitor, Gauge, HardDrive,
  FileCode, Workflow, Replace, Puzzle,
  CheckCircle
} from 'lucide-react'

// Icon map per service — 6 unique icons each, matching feature content
const serviceFeatureIcons: Record<string, LucideIcon[]> = {
  ai:             [MessageCircle, Zap, Bot, FileText, Plug, Brain],
  software:       [Globe, Smartphone, Database, Cloud, Server, GitBranch],
  industrial:     [Cpu, Radio, BarChart3, Wrench, Settings, Factory],
  cybersecurity:  [Shield, Search, Lock, FileCheck, Eye, GraduationCap],
  integrations:   [Link2, Webhook, Boxes, RefreshCcw, Code, Network],
  design:         [Palette, PenTool, Layout, Figma, MousePointer, Sparkles],
  ecommerce:      [ShoppingCart, CreditCard, Package, TrendingUp, Store, Truck],
  marketing:      [Megaphone, Target, Share2, Mail, PieChart, Users],
  mentoring:      [GraduationCap, BookOpen, Video, Users, Languages, Lightbulb],
  data:           [LineChart, Database, Filter, Layers, Activity, Brain],
  cloud:          [Cloud, Container, Monitor, Gauge, HardDrive, Shield],
  legacy:         [FileCode, Workflow, Replace, Puzzle, RefreshCcw, Code],
}

interface ServiceFeaturesProps {
  serviceKey: string
  color: string
}

export function ServiceFeatures({ serviceKey, color }: ServiceFeaturesProps) {
  const t = useTranslations('serviceDetails')

  // Get features array from translations
  const featuresRaw = t.raw(`${serviceKey}.features`) as Array<{ title: string; description: string }>
  const icons = serviceFeatureIcons[serviceKey] || []

  return (
    <section className="py-20 bg-soul-dark-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t(`${serviceKey}.hero.title`)}
          </h2>
          <div className={`w-24 h-1 bg-gradient-to-r ${color} mx-auto rounded-full`} />
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuresRaw.map((feature, index) => {
            const Icon = icons[index] || CheckCircle
            return (
              <div
                key={index}
                className="group relative p-6 bg-soul-dark rounded-2xl border border-gray-800 hover:border-soul-purple/50 transition-all duration-300"
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />

                <div className="relative">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4`}>
                    <Icon className="!text-white" size={24} />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-soul-purple-light transition-colors">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
