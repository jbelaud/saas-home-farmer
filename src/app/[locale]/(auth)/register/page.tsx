import {Leaf} from 'lucide-react'
import Link from 'next/link'
import {Metadata} from 'next/types'
import {getTranslations, setRequestLocale} from 'next-intl/server'
import React from 'react'

import {RegisterForm} from '@/components/features/auth/forms/register-form'

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string}>
}): Promise<Metadata> {
  const {locale} = await params
  setRequestLocale(locale)
  const t = await getTranslations({locale, namespace: 'Auth.RegisterPage'})

  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
  }
}

export default async function RegisterPage({
  params,
}: {
  params: Promise<{locale: string}>
}) {
  const {locale} = await params
  setRequestLocale(locale)

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-stone-50 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 self-center font-bold text-stone-900"
        >
          <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
            <Leaf className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl">MyHomeFarmer</span>
        </Link>
        <RegisterForm />
      </div>
    </div>
  )
}
