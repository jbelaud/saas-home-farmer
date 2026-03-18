import {CheckCircle2, Clock, Leaf, XCircle} from 'lucide-react'
import {setRequestLocale} from 'next-intl/server'

import {Badge} from '@/components/ui/badge'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {getClientInterventionsService} from '@/services/facades/client-portal-service-facade'

type Params = {locale: string; token: string}

const STATUS_CONFIG = {
  completed: {
    label: 'Terminé',
    icon: CheckCircle2,
    className: 'bg-emerald-100 text-emerald-700',
  },
  in_progress: {
    label: 'En cours',
    icon: Clock,
    className: 'bg-blue-100 text-blue-700',
  },
  scheduled: {
    label: 'Planifié',
    icon: Clock,
    className: 'bg-amber-100 text-amber-700',
  },
  cancelled: {
    label: 'Annulé',
    icon: XCircle,
    className: 'bg-red-100 text-red-700',
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
}: {
  params: Promise<Params>
}) {
  const {locale, token} = await params
  setRequestLocale(locale)

  const {data: interventions, pagination} = await getClientInterventionsService(
    token,
    {
      limit: 50,
      offset: 0,
    }
  )

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(date))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-stone-900">Mes visites</h1>
        <p className="text-sm text-stone-500">
          {pagination.total} visite{pagination.total > 1 ? 's' : ''}
        </p>
      </div>

      {interventions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Leaf className="mx-auto mb-3 h-10 w-10 text-stone-300" />
            <p className="font-medium text-stone-500">
              Aucune visite enregistr&eacute;e
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {interventions.map((intervention) => {
            const statusConfig =
              STATUS_CONFIG[
                intervention.status as keyof typeof STATUS_CONFIG
              ] ?? STATUS_CONFIG.scheduled
            const StatusIcon = statusConfig.icon

            return (
              <Card key={intervention.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-stone-500">
                      {formatDate(intervention.scheduledDate)}
                    </CardTitle>
                    <Badge className={statusConfig.className}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {statusConfig.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {TYPE_LABELS[intervention.type] ?? intervention.type}
                    </Badge>
                    {intervention.durationMinutes && (
                      <span className="text-xs text-stone-400">
                        {intervention.durationMinutes} min
                      </span>
                    )}
                  </div>

                  {/* Checklist */}
                  {intervention.checklistItems.length > 0 && (
                    <div className="space-y-1">
                      {intervention.checklistItems.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-sm text-stone-700"
                        >
                          {intervention.checklistDone[i] ? (
                            <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                          ) : (
                            <div className="h-4 w-4 flex-shrink-0 rounded-full border-2 border-stone-300" />
                          )}
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Notes */}
                  {intervention.proNotes && (
                    <div className="rounded-lg bg-emerald-50 p-3">
                      <p className="text-xs font-medium text-emerald-700 uppercase">
                        Note du jardinier
                      </p>
                      <p className="mt-1 text-sm text-emerald-800">
                        {intervention.proNotes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
