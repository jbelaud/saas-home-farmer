import {GoogleAnalytics} from '@next/third-parties/google'
import {NextIntlClientProvider} from 'next-intl'
import {setRequestLocale} from 'next-intl/server'
import React, {ReactNode} from 'react'

import {AppProviders} from '@/components/context/app-providers'

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
