import {
  CalendarDays,
  CheckCircle2,
  Leaf,
  Plus,
  Scale,
  Sprout,
} from 'lucide-react'
import Link from 'next/link'
import {setRequestLocale} from 'next-intl/server'

import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {getClientPortalDashboardService} from '@/services/facades/client-portal-service-facade'

type Params = {locale: string; token: string}

export default async function ClientPortalDashboard({
  params,
}: {
  params: Promise<Params>
}) {
  const {locale, token} = await params
  setRequestLocale(locale)

  const {client, harvestStats, lastIntervention, recentHarvests} =
    await getClientPortalDashboardService(token)

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(date))

  const formatShortDate = (date: Date) =>
    new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
    }).format(new Date(date))

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900">
          Bonjour, {client.firstName} !
        </h1>
        <p className="text-sm text-stone-500">
          Bienvenue sur votre espace potager
        </p>
      </div>

      {/* KPI: Valeur Produite */}
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700">
                Valeur produite
              </p>
              <p className="text-3xl font-bold text-emerald-800">
                {harvestStats.totalValueEur.toFixed(2)} &euro;
              </p>
              <p className="mt-1 text-xs text-emerald-600">
                {harvestStats.totalWeightKg.toFixed(1)} kg
                r&eacute;colt&eacute;s &middot; {harvestStats.count}{' '}
                r&eacute;coltes
              </p>
            </div>
            <div className="rounded-full bg-emerald-200 p-3">
              <Sprout className="h-8 w-8 text-emerald-700" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          asChild
          size="lg"
          className="h-14 bg-emerald-700 hover:bg-emerald-800"
        >
          <Link href={`/${locale}/client-portal/${token}/harvests/new`}>
            <Plus className="mr-2 h-5 w-5" />
            Ajouter r&eacute;colte
          </Link>
        </Button>
        <Button
          asChild
          size="lg"
          variant="outline"
          className="h-14 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
        >
          <Link href={`/${locale}/client-portal/${token}/visits`}>
            <CalendarDays className="mr-2 h-5 w-5" />
            Mes visites
          </Link>
        </Button>
      </div>

      {/* Dernier passage */}
      {lastIntervention && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Dernier passage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-stone-500">
                {formatDate(lastIntervention.scheduledDate)}
              </span>
              <Badge variant="secondary" className="capitalize">
                {lastIntervention.type === 'maintenance'
                  ? 'Entretien'
                  : lastIntervention.type === 'plantation'
                    ? 'Plantation'
                    : lastIntervention.type === 'setup'
                      ? 'Installation'
                      : lastIntervention.type === 'consultation'
                        ? 'Conseil'
                        : 'Aide r\u00e9colte'}
              </Badge>
            </div>

            {/* Checklist */}
            {lastIntervention.checklistItems.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-stone-500 uppercase">
                  T&acirc;ches effectu&eacute;es
                </p>
                <div className="space-y-1">
                  {lastIntervention.checklistItems.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-sm text-stone-700"
                    >
                      {lastIntervention.checklistDone[i] ? (
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                      ) : (
                        <div className="h-4 w-4 flex-shrink-0 rounded-full border-2 border-stone-300" />
                      )}
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes du pro */}
            {lastIntervention.proNotes && (
              <div className="rounded-lg bg-emerald-50 p-3">
                <p className="text-xs font-medium text-emerald-700 uppercase">
                  Conseil du pro
                </p>
                <p className="mt-1 text-sm text-emerald-800">
                  {lastIntervention.proNotes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Récoltes récentes */}
      {recentHarvests.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Leaf className="h-5 w-5 text-amber-500" />
                R&eacute;coltes r&eacute;centes
              </CardTitle>
              <Link
                href={`/${locale}/client-portal/${token}/harvests`}
                className="text-sm text-emerald-600 hover:text-emerald-700"
              >
                Tout voir
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentHarvests.map((harvest) => (
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
                        {formatShortDate(harvest.harvestDate)} &middot;{' '}
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
