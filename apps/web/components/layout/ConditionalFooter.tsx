'use client'

import { usePathname } from 'next/navigation'
import { Footer } from './Footer'
import { ChatWidget } from '../chat/ChatWidget'

export function ConditionalFooter() {
  const pathname = usePathname()
  const isAdmin = pathname.includes('/admin')
  const isAccount = pathname.includes('/account')

  if (isAdmin || isAccount) return null

  return (
    <>
      <Footer />
      <ChatWidget />
    </>
  )
}
