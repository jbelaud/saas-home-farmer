import {GoogleAnalytics} from '@next/third-parties/google'
import {NextIntlClientProvider} from 'next-intl'
import {setRequestLocale} from 'next-intl/server'
import NextTopLoader from 'nextjs-toploader'
import React, {ReactNode} from 'react'

import {AppProviders} from '@/components/context/app-providers'
import {env} from '@/env'
import {inter, outfit} from '@/lib/fonts'
import {cn} from '@/lib/utils'

type Props = {
  children: ReactNode
  locale: string
}

export default async function BaseLayout({children, locale}: Props) {
  // Re-configurer la locale avant getMessages
  setRequestLocale(locale)

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={cn(inter.variable, outfit.variable, 'font-sans antialiased')}
      >
        <NextTopLoader showSpinner={false} color="#047857" height={3} />
        <NextIntlClientProvider>
          <AppProviders>{children}</AppProviders>
        </NextIntlClientProvider>
      </body>
      {env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID && (
        <GoogleAnalytics gaId={env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID} />
      )}
    </html>
  )
}
