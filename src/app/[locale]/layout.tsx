import {notFound} from 'next/navigation'
import {hasLocale} from 'next-intl'
import {setRequestLocale} from 'next-intl/server'
import React from 'react'

import {routing} from '@/i18n/routing'

import BaseLayout from './base-layout'

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{locale: string}>
}) {
  const paramsStore = await params
  const locale = paramsStore.locale

  // Ensure that the incoming `locale` is valid
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  // Configurer la locale AVANT toute utilisation de next-intl
  setRequestLocale(locale)

  return <BaseLayout locale={locale}>{children}</BaseLayout>
}
