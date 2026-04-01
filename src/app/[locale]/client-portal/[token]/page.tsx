import {
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Leaf,
  MapPin,
  Phone,
  Plus,
  Scale,
  Sprout,
  TrendingUp,
  User,
} from 'lucide-react'
import Link from 'next/link'
import {setRequestLocale} from 'next-intl/server'

import {Button} from '@/components/ui/button'
import {Card, CardContent} from '@/components/ui/card'
import {getClientPortalDashboardService} from '@/services/facades/client-portal-service-facade'

type Params = {locale: string; token: string}

const TYPE_LABELS: Record<string, string> = {
  maintenance: 'Entretien',
  plantation: 'Plantation',
  setup: 'Installation',
  harvest_support: 'Aide récolte',
  consultation: 'Conseil',
}

export default async function ClientPortalDashboard({
  params,
}: {
  params: Promise<Params>
}) {
  const {locale, token} = await params
  setRequestLocale(locale)

  const {
    client,
    harvestStats,
    lastIntervention,
    recentHarvests,
    farmerContact,
  } = await getClientPortalDashboardService(token)

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(new Date(date))

  const formatShortDate = (date: Date) =>
    new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
    }).format(new Date(date))

  const currentYear = new Date().getFullYear()

  return (
    <div>
      {/* Header Mobile — Emerald avec ROI hero */}
      <header className="relative overflow-hidden rounded-b-3xl bg-emerald-800 p-6 text-white shadow-md">
        <div className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 transform opacity-10">
          <Sprout className="h-48 w-48" />
        </div>

        <div className="relative z-10">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="font-heading text-2xl font-bold">
                Bonjour, {client.firstName} 👋
              </h1>
              <p className="text-sm text-emerald-100">
                Votre potager se porte à merveille !
              </p>
            </div>
          </div>

          {/* ROI Card (Hero) */}
          <div className="rounded-2xl bg-white p-4 text-stone-900 shadow-lg">
            <div className="mb-2 flex items-start justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                <TrendingUp className="h-4 w-4" />
                Valeur Produite ({currentYear})
              </div>
            </div>
            <div className="mb-1 flex items-end gap-2">
              <span className="font-heading text-4xl font-bold">
                {harvestStats.totalValueEur.toFixed(0)}€
              </span>
              <span className="mb-1.5 text-sm text-stone-500">
                de production valorisée
              </span>
            </div>
            <p className="text-xs leading-tight text-stone-400">
              {harvestStats.totalWeightKg.toFixed(1)} kg récoltés ·{' '}
              {harvestStats.count} récoltes · Prix du marché Bio
            </p>
          </div>
        </div>
      </header>

      <main className="space-y-6 px-4 py-6">
        {/* Actions Rapides */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            asChild
            className="flex h-auto flex-col gap-2 bg-emerald-600 py-4 shadow-md shadow-emerald-200 hover:bg-emerald-700"
            size="lg"
          >
            <Link href={`/${locale}/client-portal/${token}/harvests/new`}>
              <Plus className="h-6 w-6" />
              <span>Ajouter une récolte</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="flex h-auto flex-col gap-2 border-emerald-200 bg-emerald-50 py-4 text-emerald-800 hover:bg-emerald-100"
          >
            <Link href={`/${locale}/client-portal/${token}/visits`}>
              <Calendar className="h-6 w-6" />
              <span>Mes visites</span>
            </Link>
          </Button>
        </div>

        {/* Prochain passage */}
        {client.nextVisitDate && (
          <Card className="border-none bg-emerald-50 shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                <CalendarCheck className="h-6 w-6 text-emerald-700" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium tracking-wide text-emerald-600 uppercase">
                  Prochain passage
                </p>
                <p className="font-heading text-lg font-bold text-emerald-900">
                  {new Intl.DateTimeFormat('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  }).format(new Date(client.nextVisitDate))}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dernière Visite — enrichie */}
        {lastIntervention && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold text-stone-800">
                Dernier passage
              </h2>
              <Link
                href={`/${locale}/client-portal/${token}/visits`}
                className="text-xs font-medium text-emerald-700 hover:underline"
              >
                Tout voir
              </Link>
            </div>
            <Card className="overflow-hidden border-none shadow-sm">
              {/* Photo placeholder */}
              <div className="relative h-48 bg-stone-200">
                <div className="absolute inset-0 flex items-center justify-center bg-stone-300">
                  <Leaf className="h-12 w-12 text-stone-400 opacity-50" />
                  <span className="ml-2 font-medium text-stone-500">
                    Photo à venir
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 rounded bg-black/60 px-2 py-1 text-xs text-white backdrop-blur-md">
                  Après intervention
                </div>
              </div>
              <CardContent className="space-y-4 p-4">
                {/* Date + Type + Durée */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-stone-700">
                    {formatDate(lastIntervention.scheduledDate)}
                  </span>
                  <span className="rounded-md bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600">
                    {TYPE_LABELS[lastIntervention.type] ??
                      lastIntervention.type}
                  </span>
                  {lastIntervention.durationMinutes && (
                    <span className="flex items-center gap-1 text-xs text-stone-400">
                      <Clock className="h-3 w-3" />
                      {lastIntervention.durationMinutes} min
                    </span>
                  )}
                </div>

                {/* Checklist */}
                {lastIntervention.checklistItems.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold tracking-wide text-stone-500 uppercase">
                      Tâches réalisées
                    </p>
                    {lastIntervention.checklistItems.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-sm text-stone-700"
                      >
                        {lastIntervention.checklistDone[i] ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                        ) : (
                          <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                        )}
                        {item}
                      </div>
                    ))}
                  </div>
                )}

                {/* Conseil du pro */}
                {lastIntervention.proNotes && (
                  <div className="rounded-lg border border-amber-100 bg-amber-50 p-3 text-sm text-amber-800">
                    <span className="mb-1 block text-xs font-bold tracking-wide uppercase opacity-70">
                      Conseil de votre Home Farmer
                    </span>
                    &ldquo;{lastIntervention.proNotes}&rdquo;
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        )}

        {/* Récoltes récentes */}
        {recentHarvests.length > 0 && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold text-stone-800">
                Récoltes récentes
              </h2>
              <Link
                href={`/${locale}/client-portal/${token}/harvests`}
                className="text-xs font-medium text-emerald-700 hover:underline"
              >
                Voir l&apos;historique
              </Link>
            </div>
            <div className="space-y-3">
              {recentHarvests.map((harvest) => (
                <div
                  key={harvest.id}
                  className="flex items-center justify-between rounded-xl border bg-white p-4"
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
                        {formatShortDate(harvest.harvestDate)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-stone-900">
                      {harvest.weightKg} kg
                    </p>
                    <p className="text-xs font-medium text-emerald-600">
                      +{Number(harvest.calculatedValueEur).toFixed(2)}€
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Carte contact du Home Farmer */}
        {farmerContact && (
          <section>
            <h2 className="font-heading mb-3 text-lg font-bold text-stone-800">
              Votre Home Farmer
            </h2>
            <Card className="border-none bg-stone-50 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                    <User className="h-7 w-7 text-emerald-700" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-heading truncate text-lg font-bold text-stone-900">
                      {farmerContact.name}
                    </p>
                    {farmerContact.city && (
                      <p className="flex items-center gap-1 text-xs text-stone-400">
                        <MapPin className="h-3 w-3" />
                        {farmerContact.city}
                      </p>
                    )}
                    {farmerContact.phone && (
                      <p className="mt-1 flex items-center gap-1 text-sm font-medium text-stone-600">
                        <Phone className="h-3.5 w-3.5" />
                        {farmerContact.phone}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}
      </main>
    </div>
  )
}
