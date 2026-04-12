import { Scale, Building, Package, Landmark, Shield, Cog, Cpu } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface Project {
  slug: string
  key: string
  icon: LucideIcon
  stack: string[]
  color: string
  demoUrl: string | null
  image: string
  featured: boolean
}

export const projects: Project[] = [
  {
    slug: 'tayco',
    key: 'tayco',
    icon: Building,
    stack: ['Next.js', 'Tailwind CSS', 'Framer Motion', 'Schema.org', 'SEO'],
    color: 'from-amber-500 to-yellow-600',
    demoUrl: 'https://tayco.llc',
    image: '/generated/project-tayco.png',
    featured: true,
  },
  {
    slug: 'coparenting-commander',
    key: 'coparenting',
    icon: Scale,
    stack: ['Next.js 14', 'Supabase', 'Stripe', 'Vercel', 'Resend'],
    color: 'from-violet-500 to-fuchsia-600',
    demoUrl: 'https://coparentingcommander.com',
    image: '/generated/project-coparenting-commander.png',
    featured: true,
  },
  {
    slug: 'archaeon-bank',
    key: 'archaeonbank',
    icon: Landmark,
    stack: ['Spring Boot 3.4', 'PostgreSQL 17', 'Docker', 'Prometheus', 'Flyway'],
    color: 'from-cyan-500 to-teal-600',
    demoUrl: 'https://o1banca.vercel.app/',
    image: '/generated/svc-cloud-infrastructure.png',
    featured: true,
  },
  {
    slug: 'tayco-turnkey',
    key: 'turnkey',
    icon: Building,
    stack: ['Next.js', 'Tailwind CSS', 'SEO', 'Responsive'],
    color: 'from-orange-400 to-rose-500',
    demoUrl: 'https://taycoturnkey.com',
    image: '/generated/project-tayco-turnkey.png',
    featured: false,
  },
  {
    slug: 'taysupply',
    key: 'taysupply',
    icon: Package,
    stack: ['Next.js', 'Tailwind CSS', 'i18n', 'Dark Mode'],
    color: 'from-emerald-500 to-teal-600',
    demoUrl: 'https://taysupply.com',
    image: '/generated/project-taysupply.png',
    featured: false,
  },
  {
    slug: 'automatizacion-agricola',
    key: 'agricultural',
    icon: Cog,
    stack: ['IoT', 'SCADA', 'Python', 'Dashboard'],
    color: 'from-orange-500 to-amber-600',
    demoUrl: null,
    image: '/generated/svc-industrial.png',
    featured: false,
  },
  {
    slug: 'auditoria-seguridad',
    key: 'pentest',
    icon: Shield,
    stack: ['Burp Suite', 'OWASP', 'Nmap', 'Python'],
    color: 'from-red-500 to-rose-600',
    demoUrl: null,
    image: '/generated/svc-cybersecurity.png',
    featured: false,
  },
  {
    slug: 'agente-ia-ventas',
    key: 'sales',
    icon: Cpu,
    stack: ['n8n', 'OpenAI', 'WhatsApp API', 'Supabase'],
    color: 'from-purple-500 to-violet-600',
    demoUrl: null,
    image: '/generated/svc-ai.png',
    featured: false,
  },
  {
    slug: 'evaluacion-seguridad',
    key: 'vulnassess',
    icon: Shield,
    stack: ['Burp Suite', 'Nuclei', 'Python', 'OWASP'],
    color: 'from-rose-600 to-red-700',
    demoUrl: null,
    image: '/generated/svc-cybersecurity.png',
    featured: false,
  },
]

export const allProjectSlugs = projects.map(p => p.slug)
export const featuredProjects = projects.filter(p => p.featured)
export function getProjectBySlug(slug: string) {
  return projects.find(p => p.slug === slug)
}
