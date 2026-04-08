'use client'

import { useState, useEffect } from 'react'
import { ChevronUp } from 'lucide-react'

export function ScrollToTop() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 600)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!show) return null

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-8 right-8 z-50 p-3 bg-soul-purple hover:bg-soul-purple-dark rounded-full shadow-lg transition-all duration-300 hover:scale-110 glow-hover"
      aria-label="Scroll to top"
    >
      <ChevronUp className="text-white" size={24} />
    </button>
  )
}
