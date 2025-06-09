import {GoogleAnalytics} from '@next/third-parties/google'
import {NextIntlClientProvider} from 'next-intl'
import {getTranslations, setRequestLocale} from 'next-intl/server'
import React, {ReactNode} from 'react'

import {AppProviders} from '@/components/context/app-providers'
import {routing} from '@/i18n/routing'

type Props = {
  children: ReactNode
  locale: string
}

export default async function BaseLayout({children, locale}: Props) {
  // Re-configurer la locale avant getMessages
  setRequestLocale(locale)
  const gtag = 'G-NWRT5G95RE'
  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider>
          <AppProviders>{children}</AppProviders>
        </NextIntlClientProvider>
      </body>
      <GoogleAnalytics gaId={gtag} />
    </html>
  )
}

// Déplacer generateMetadata après le composant principal
export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string}>
}) {
  const paramsStore = await params
  const locale = paramsStore.locale

  // Configurer la locale avant getTranslations
  setRequestLocale(locale)
  const t = await getTranslations({locale, namespace: 'LocaleLayout'})

  return {
    title: t('title'),
    description: t('description'),
  }
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}))
}
