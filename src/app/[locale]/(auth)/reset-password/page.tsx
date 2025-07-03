import {getTranslations, setRequestLocale} from 'next-intl/server'
import {Suspense} from 'react'

import ResetPasswordPage from './reset'

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string}>
}) {
  const {locale} = await params
  setRequestLocale(locale)
  const t = await getTranslations({locale, namespace: 'Auth.ResetPasswordPage'})

  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{locale: string}>
}) {
  const {locale} = await params
  setRequestLocale(locale)

  return (
    <Suspense>
      <ResetPasswordPage />
    </Suspense>
  )
}
