import {Leaf, Plus, Scale, Sprout, TrendingUp} from 'lucide-react'
import Link from 'next/link'
import {setRequestLocale} from 'next-intl/server'
import {Suspense} from 'react'

import {DateFilter} from '@/components/features/client-portal/date-filter'
import {Button} from '@/components/ui/button'
import {Card, CardContent} from '@/components/ui/card'
import {getClientHarvestsService} from '@/services/facades/client-portal-service-facade'

type Params = {locale: string; token: string}

export default async function ClientHarvestsPage({
  params,
  searchParams,
}: {
  params: Promise<Params>
  searchParams: Promise<{year?: string; month?: string}>
}) {
  const {locale, token} = await params
  setRequestLocale(locale)
  const filters = await searchParams

  const {data: allHarvests, pagination} = await getClientHarvestsService(
    token,
    {
      limit: 200,
      offset: 0,
    }
  )

  // Extraire les années disponibles
  const availableYears = [
    ...new Set(allHarvests.map((h) => new Date(h.harvestDate).getFullYear())),
  ].sort((a, b) => b - a)

  // Filtrer par année et mois
  const filterYear = filters.year ? Number(filters.year) : null
  const filterMonth = filters.month ? Number(filters.month) : null

  const harvests = allHarvests.filter((h) => {
    const d = new Date(h.harvestDate)
    if (filterYear && d.getFullYear() !== filterYear) return false
    if (filterMonth && d.getMonth() + 1 !== filterMonth) return false
    return true
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
    }).format(new Date(date))

  const formatYear = (date: Date) => String(new Date(date).getFullYear())

  // Grouper par année
  const harvestsByYear = harvests.reduce<Record<string, typeof harvests>>(
    (acc, harvest) => {
      const year = formatYear(harvest.harvestDate)
      if (!acc[year]) acc[year] = []
      acc[year].push(harvest)
      return acc
    },
    {}
  )

  return (
    <div className="space-y-6 px-4 py-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-emerald-800 p-5 text-white shadow-md">
        <div className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 opacity-10">
          <Sprout className="h-32 w-32" />
        </div>
        <div className="relative z-10">
          <h1 className="font-heading text-xl font-bold">Mes récoltes</h1>
          <p className="mt-1 text-sm text-emerald-100">
            {pagination.total} récolte{pagination.total > 1 ? 's' : ''}{' '}
            enregistrée{pagination.total > 1 ? 's' : ''}
          </p>
          <div className="mt-3 flex gap-4">
            <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-sm backdrop-blur-sm">
              <TrendingUp className="h-4 w-4 text-emerald-300" />
              <span className="font-medium">{totalValue.toFixed(0)}€</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-sm backdrop-blur-sm">
              <Scale className="h-4 w-4 text-amber-300" />
              <span className="font-medium">{totalWeight.toFixed(1)} kg</span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Ajouter */}
      <Button
        asChild
        size="lg"
        className="h-14 w-full bg-emerald-600 text-base font-bold shadow-md shadow-emerald-200 hover:bg-emerald-700"
      >
        <Link href={`/${locale}/client-portal/${token}/harvests/new`}>
          <Plus className="mr-2 h-5 w-5" />
          Ajouter une récolte
        </Link>
      </Button>

      {/* Filtres */}
      {availableYears.length > 0 && (
        <Suspense>
          <DateFilter availableYears={availableYears} />
        </Suspense>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-none bg-emerald-50 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium tracking-wide text-emerald-600 uppercase">
              Valeur{filterYear ? ` ${filterYear}` : ' totale'}
            </p>
            <p className="font-heading text-2xl font-bold text-emerald-800">
              {totalValue.toFixed(0)}€
            </p>
          </CardContent>
        </Card>
        <Card className="border-none bg-amber-50 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium tracking-wide text-amber-600 uppercase">
              Poids{filterYear ? ` ${filterYear}` : ' total'}
            </p>
            <p className="font-heading text-2xl font-bold text-amber-800">
              {totalWeight.toFixed(1)} kg
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Liste */}
      {harvests.length === 0 ? (
        <Card className="border-none shadow-sm">
          <CardContent className="py-16 text-center">
            <Leaf className="mx-auto mb-4 h-12 w-12 text-stone-300" />
            <p className="font-heading text-lg font-bold text-stone-500">
              {filterYear || filterMonth
                ? 'Aucune récolte pour cette période'
                : 'Aucune récolte enregistrée'}
            </p>
            <p className="mt-1 text-sm text-stone-400">
              {filterYear || filterMonth
                ? 'Essayez un autre filtre.'
                : 'Ajoutez votre première récolte pour suivre la valeur de votre potager.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(harvestsByYear).map(([year, yearHarvests]) => (
            <div key={year}>
              <h2 className="font-heading mb-4 text-sm font-bold tracking-wide text-stone-400 uppercase">
                {year}
              </h2>
              <div className="space-y-3">
                {yearHarvests.map((harvest) => (
                  <div
                    key={harvest.id}
                    className="flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                        <Scale className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-bold text-stone-900">
                          {harvest.cropName}
                        </p>
                        <p className="text-xs text-stone-500">
                          {formatDate(harvest.harvestDate)} · {harvest.weightKg}{' '}
                          kg
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-700">
                        +{Number(harvest.calculatedValueEur).toFixed(2)}€
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
