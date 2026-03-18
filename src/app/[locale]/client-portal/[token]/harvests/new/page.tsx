import {ArrowLeft} from 'lucide-react'
import Link from 'next/link'
import {setRequestLocale} from 'next-intl/server'

import {AddHarvestForm} from '@/components/features/client-portal/add-harvest-form'

type Params = {locale: string; token: string}

export default async function AddHarvestPage({
  params,
}: {
  params: Promise<Params>
}) {
  const {locale, token} = await params
  setRequestLocale(locale)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/${locale}/client-portal/${token}/harvests`}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-stone-900">
            Ajouter une r&eacute;colte
          </h1>
          <p className="text-sm text-stone-500">
            S&eacute;lectionnez le l&eacute;gume et le poids
          </p>
        </div>
      </div>

      <AddHarvestForm token={token} locale={locale} />
    </div>
  )
}
