'use client'

import {Calendar, Clock, Leaf, User} from 'lucide-react'
import Link from 'next/link'

import {Badge} from '@/components/ui/badge'
import {Card, CardContent} from '@/components/ui/card'

type InterventionItem = {
  id: string
  scheduledDate: Date
  durationMinutes: number | null
  status: string
  type: string
  proNotes: string | null
  gardenClientId: string
  gardenClient?: {
    firstName: string
    lastName: string
    addressCity: string
  } | null
}

const STATUS_CONFIG: Record<
  string,
  {label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'}
> = {
  scheduled: {label: 'Planifiée', variant: 'outline'},
  in_progress: {label: 'En cours', variant: 'default'},
  completed: {label: 'Terminée', variant: 'secondary'},
  cancelled: {label: 'Annulée', variant: 'destructive'},
}

const TYPE_LABELS: Record<string, string> = {
  maintenance: 'Entretien',
  plantation: 'Plantation',
  setup: 'Installation',
  harvest_support: 'Aide récolte',
  consultation: 'Consultation',
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function InterventionList({
  interventions,
}: {
  interventions: InterventionItem[]
}) {
  if (interventions.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      {interventions.map((intervention) => {
        const statusCfg =
          STATUS_CONFIG[intervention.status] ?? STATUS_CONFIG.scheduled
        return (
          <Link key={intervention.id} href={`/tournees/${intervention.id}`}>
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-4 py-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
                  <Leaf className="h-5 w-5 text-emerald-700" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-base font-semibold">
                      {TYPE_LABELS[intervention.type] ?? intervention.type}
                    </p>
                    <Badge variant={statusCfg.variant} className="text-xs">
                      {statusCfg.label}
                    </Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-500">
                    {intervention.gardenClient && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {intervention.gardenClient.firstName}{' '}
                        {intervention.gardenClient.lastName}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(intervention.scheduledDate)}
                    </span>
                    {intervention.durationMinutes && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {intervention.durationMinutes} min
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
