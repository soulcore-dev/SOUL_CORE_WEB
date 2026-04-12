import { setRequestLocale } from 'next-intl/server'
import { Hero } from '@/components/sections/Hero'
import { Services } from '@/components/sections/Services'
import { WhyUs } from '@/components/sections/WhyUs'
import { Portfolio } from '@/components/sections/Portfolio'
import { FreeResources } from '@/components/sections/FreeResources'
import { Team } from '@/components/sections/Team'
import { Contact } from '@/components/sections/Contact'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function Home({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <>
      <Hero />
      <WhyUs />
      <Services />
      <FreeResources />
      <Portfolio />
      <Team />
      <Contact />
    </>
  )
}
