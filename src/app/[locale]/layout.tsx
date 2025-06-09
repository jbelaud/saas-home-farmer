import {notFound} from 'next/navigation'
import {hasLocale, NextIntlClientProvider} from 'next-intl'
import React from 'react'

import {routing} from '@/i18n/routing'

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{locale: string}>
}) {
  // Ensure that the incoming `locale` is valid
  const {locale} = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  )
}
