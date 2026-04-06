'use client'


import { useEffect, useState, type ComponentProps } from 'react'

/**
 * Drop-in replacement for motion.div that is SSR-safe.
 *
 * Problem: Framer Motion sets  via inline styles
 * during SSR. If JS fails to hydrate (e.g. standalone build), sections
 * stay invisible forever.
 *
 * Solution: Render as a plain div during SSR (visible by default).
 * After hydration, switch to motion.div so animations work normally.
 */
export function MotionDiv(props: ComponentProps<typeof motion.div>) {
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => { setHydrated(true) }, [])

  if (!hydrated) {
    // During SSR and before hydration: render plain div, no opacity:0
    const { initial, animate, whileInView, viewport, transition, layout, ...rest } = props as any
    return <div {...rest} />
  }

  return <div {...props} />
}
