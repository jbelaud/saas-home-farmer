import {Leaf, Plus, Scale} from 'lucide-react'
import Link from 'next/link'
import {setRequestLocale} from 'next-intl/server'

import {Button} from '@/components/ui/button'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {getClientHarvestsService} from '@/services/facades/client-portal-service-facade'

type Params = {locale: string; token: string}

export default async function ClientHarvestsPage({
  params,
}: {
  params: Promise<Params>
}) {
  const {locale, token} = await params
  setRequestLocale(locale)

  const {data: harvests, pagination} = await getClientHarvestsService(token, {
    limit: 50,
    offset: 0,
  })

  const totalValue = harvests.reduce(
    (sum, h) => sum + Number(h.calculatedValueEur),
    0
  )
  const totalWeight = harvests.reduce((sum, h) => sum + h.weightKg, 0)

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(date))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-stone-900">
            Mes r&eacute;coltes
          </h1>
          <p className="text-sm text-stone-500">
            {pagination.total} r&eacute;colte{pagination.total > 1 ? 's' : ''}{' '}
            enregistr&eacute;e{pagination.total > 1 ? 's' : ''}
          </p>
        </div>
        <Button
          asChild
          size="lg"
          className="h-12 bg-emerald-700 hover:bg-emerald-800"
        >
          <Link href={`/${locale}/client-portal/${token}/harvests/new`}>
            <Plus className="mr-2 h-5 w-5" />
            Ajouter
          </Link>
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs font-medium text-emerald-600">
              Valeur totale
            </p>
            <p className="text-xl font-bold text-emerald-800">
              {totalValue.toFixed(2)} &euro;
            </p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs font-medium text-amber-600">Poids total</p>
            <p className="text-xl font-bold text-amber-800">
              {totalWeight.toFixed(1)} kg
            </p>
          </CardContent>
        </Card>
      </div>

      {/* List */}
      {harvests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Leaf className="mx-auto mb-3 h-10 w-10 text-stone-300" />
            <p className="font-medium text-stone-500">
              Aucune r&eacute;colte enregistr&eacute;e
            </p>
            <p className="mt-1 text-sm text-stone-400">
              Ajoutez votre premi&egrave;re r&eacute;colte pour suivre la valeur
              de votre potager
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Historique</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {harvests.map((harvest) => (
                <div
                  key={harvest.id}
                  className="flex items-center justify-between rounded-lg border border-stone-100 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
                      <Scale className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-stone-900">
                        {harvest.cropName}
                      </p>
                      <p className="text-xs text-stone-500">
                        {formatDate(harvest.harvestDate)} &middot;{' '}
                        {harvest.weightKg} kg
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-emerald-700">
                    {Number(harvest.calculatedValueEur).toFixed(2)} &euro;
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
