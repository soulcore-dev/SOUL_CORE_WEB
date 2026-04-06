'use client'


import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  delay?: number
  hover?: boolean
}

export function GlassCard({ children, className = '', delay = 0, hover = true }: GlassCardProps) {
  return (
    <div
      
      
      
      
      className={`bg-soul-dark-card rounded-2xl border border-gray-800 ${
        hover ? 'hover:border-soul-purple/50 transition-all duration-300' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}
