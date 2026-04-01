import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Leaf,
  Sprout,
  XCircle,
} from 'lucide-react'
import {setRequestLocale} from 'next-intl/server'
import {Suspense} from 'react'

import {DateFilter} from '@/components/features/client-portal/date-filter'
import {Badge} from '@/components/ui/badge'
import {Card, CardContent} from '@/components/ui/card'
import {getClientInterventionsService} from '@/services/facades/client-portal-service-facade'

type Params = {locale: string; token: string}

const STATUS_CONFIG = {
  completed: {
    label: 'Terminé',
    icon: CheckCircle2,
    badgeClass: 'bg-emerald-100 text-emerald-700',
    borderClass: 'border-l-emerald-500',
  },
  in_progress: {
    label: 'En cours',
    icon: Clock,
    badgeClass: 'bg-blue-100 text-blue-700',
    borderClass: 'border-l-blue-500',
  },
  scheduled: {
    label: 'Planifié',
    icon: Clock,
    badgeClass: 'bg-amber-100 text-amber-700',
    borderClass: 'border-l-amber-500',
  },
  cancelled: {
    label: 'Annulé',
    icon: XCircle,
    badgeClass: 'bg-red-100 text-red-700',
    borderClass: 'border-l-red-400',
  },
} as const

const TYPE_LABELS: Record<string, string> = {
  maintenance: 'Entretien',
  plantation: 'Plantation',
  setup: 'Installation',
  harvest_support: 'Aide récolte',
  consultation: 'Conseil',
}

export default async function ClientVisitsPage({
  params,
  searchParams,
}: {
  params: Promise<Params>
  searchParams: Promise<{year?: string; month?: string}>
}) {
  const {locale, token} = await params
  setRequestLocale(locale)
  const filters = await searchParams

  const {data: allInterventions, pagination} =
    await getClientInterventionsService(token, {
      limit: 200,
      offset: 0,
    })

  // Extraire les années disponibles
  const availableYears = [
    ...new Set(
      allInterventions.map((i) => new Date(i.scheduledDate).getFullYear())
    ),
  ].sort((a, b) => b - a)

  // Filtrer par année et mois
  const filterYear = filters.year ? Number(filters.year) : null
  const filterMonth = filters.month ? Number(filters.month) : null

  const interventions = allInterventions.filter((i) => {
    const d = new Date(i.scheduledDate)
    if (filterYear && d.getFullYear() !== filterYear) return false
    if (filterMonth && d.getMonth() + 1 !== filterMonth) return false
    return true
  })

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(new Date(date))

  // Grouper par année
  const interventionsByYear = interventions.reduce<
    Record<string, typeof interventions>
  >((acc, intervention) => {
    const year = String(new Date(intervention.scheduledDate).getFullYear())
    if (!acc[year]) acc[year] = []
    acc[year].push(intervention)
    return acc
  }, {})

  const completedCount = allInterventions.filter(
    (i) => i.status === 'completed'
  ).length
  const scheduledCount = allInterventions.filter(
    (i) => i.status === 'scheduled'
  ).length

  return (
    <div className="space-y-6 px-4 py-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-emerald-800 p-5 text-white shadow-md">
        <div className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 opacity-10">
          <Sprout className="h-32 w-32" />
        </div>
        <div className="relative z-10">
          <h1 className="font-heading text-xl font-bold">
            Historique des visites
          </h1>
          <p className="mt-1 text-sm text-emerald-100">
            {pagination.total} visite{pagination.total > 1 ? 's' : ''} au total
          </p>
          <div className="mt-3 flex gap-4">
            <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-sm backdrop-blur-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              <span className="font-medium">
                {completedCount} terminée{completedCount > 1 ? 's' : ''}
              </span>
            </div>
            {scheduledCount > 0 && (
              <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-sm backdrop-blur-sm">
                <CalendarDays className="h-4 w-4 text-amber-300" />
                <span className="font-medium">
                  {scheduledCount} prévue{scheduledCount > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filtres */}
      {availableYears.length > 0 && (
        <Suspense>
          <DateFilter availableYears={availableYears} />
        </Suspense>
      )}

      {interventions.length === 0 ? (
        <Card className="border-none shadow-sm">
          <CardContent className="py-16 text-center">
            <Leaf className="mx-auto mb-4 h-12 w-12 text-stone-300" />
            <p className="font-heading text-lg font-bold text-stone-500">
              {filterYear || filterMonth
                ? 'Aucune visite pour cette période'
                : 'Aucune visite enregistrée'}
            </p>
            <p className="mt-1 text-sm text-stone-400">
              {filterYear || filterMonth
                ? 'Essayez un autre filtre.'
                : 'Votre Home Farmer ajoutera ses visites ici.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(interventionsByYear).map(
            ([year, yearInterventions]) => (
              <div key={year}>
                <h2 className="font-heading mb-4 text-sm font-bold tracking-wide text-stone-400 uppercase">
                  {year}
                </h2>
                <div className="space-y-4">
                  {yearInterventions.map((intervention) => {
                    const statusConfig =
                      STATUS_CONFIG[
                        intervention.status as keyof typeof STATUS_CONFIG
                      ] ?? STATUS_CONFIG.scheduled
                    const StatusIcon = statusConfig.icon
                    const hasDetails =
                      intervention.checklistItems.length > 0 ||
                      intervention.proNotes

                    return (
                      <Card
                        key={intervention.id}
                        className={`border-l-4 border-none shadow-sm ${statusConfig.borderClass}`}
                      >
                        <CardContent className="space-y-4 p-4">
                          {/* En-tête : date + badge statut */}
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-heading text-base font-bold text-stone-900 capitalize">
                                {formatDate(intervention.scheduledDate)}
                              </p>
                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                <span className="rounded-md bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600">
                                  {TYPE_LABELS[intervention.type] ??
                                    intervention.type}
                                </span>
                                {intervention.durationMinutes && (
                                  <span className="flex items-center gap-1 text-xs text-stone-400">
                                    <Clock className="h-3 w-3" />
                                    {intervention.durationMinutes} min
                                  </span>
                                )}
                              </div>
                            </div>
                            <Badge
                              className={`shrink-0 ${statusConfig.badgeClass}`}
                            >
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {statusConfig.label}
                            </Badge>
                          </div>

                          {/* Checklist */}
                          {intervention.checklistItems.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-xs font-bold tracking-wide text-stone-500 uppercase">
                                Tâches réalisées
                              </p>
                              <div className="grid gap-1.5 sm:grid-cols-2">
                                {intervention.checklistItems.map((item, i) => (
                                  <div
                                    key={i}
                                    className="flex items-center gap-2 text-sm text-stone-700"
                                  >
                                    {intervention.checklistDone[i] ? (
                                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                                    ) : (
                                      <div className="h-4 w-4 shrink-0 rounded-full border-2 border-stone-300" />
                                    )}
                                    <span>{item}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Notes du Home Farmer */}
                          {intervention.proNotes && (
                            <div className="rounded-lg border border-amber-100 bg-amber-50 p-3">
                              <p className="text-xs font-bold tracking-wide text-amber-700/70 uppercase">
                                Conseil de votre Home Farmer
                              </p>
                              <p className="mt-1 text-sm leading-relaxed text-amber-800">
                                &ldquo;{intervention.proNotes}&rdquo;
                              </p>
                            </div>
                          )}

                          {/* Si aucun détail */}
                          {!hasDetails &&
                            intervention.status === 'scheduled' && (
                              <p className="text-sm text-stone-400 italic">
                                Visite planifiée — les détails seront ajoutés
                                après le passage de votre Home Farmer.
                              </p>
                            )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}
