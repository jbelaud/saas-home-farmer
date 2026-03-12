import {Metadata} from 'next/types'
import {getTranslations, setRequestLocale} from 'next-intl/server'

import {CtaSection} from '@/components/features/landing/cta-section'
import {FaqSection} from '@/components/features/landing/faq-section'
import {FeaturesSection} from '@/components/features/landing/features-section'
import {HeroSection} from '@/components/features/landing/hero-section'
import {LandingFooter} from '@/components/features/landing/landing-footer'
import {LandingHeader} from '@/components/features/landing/landing-header'
import {PricingSection} from '@/components/features/landing/pricing-section'
import {SerenitySection} from '@/components/features/landing/serenity-section'
import {routing} from '@/i18n/routing'

export const dynamic = 'force-static'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string}>
}): Promise<Metadata> {
  const {locale} = await params
  setRequestLocale(locale)
  const t = await getTranslations({locale, namespace: 'HomePage'})

  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
  }
}

export default async function Home({
  params,
}: {
  params: Promise<{locale: string}>
}) {
  const {locale} = await params
  setRequestLocale(locale)

  return (
    <div className="flex min-h-screen flex-col font-sans">
      <LandingHeader />
      <main className="flex-1 pt-16">
        <HeroSection />
        <FeaturesSection />
        <SerenitySection />
        <PricingSection />
        <FaqSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  )
}
