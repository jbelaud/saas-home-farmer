'use client'

import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  MoreHorizontal,
  Plus,
} from 'lucide-react'
import Link from 'next/link'
import {useLocale} from 'next-intl'
import {useCallback, useEffect, useState} from 'react'

import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {Card, CardContent} from '@/components/ui/card'
import {cn} from '@/lib/utils'

// ============================================================
// Types
// ============================================================

type AgendaIntervention = {
  id: string
  scheduledDate: string
  durationMinutes: number | null
  status: string
  type: string
  gardenClient: {
    firstName: string
    lastName: string
    addressStreet: string | null
    addressCity: string | null
  } | null
}

// ============================================================
// Helpers
// ============================================================

const DAY_LABELS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
const MONTH_NAMES = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
]

function getWeekDays(referenceDate: Date) {
  const day = referenceDate.getDay()
  const monday = new Date(referenceDate)
  monday.setDate(referenceDate.getDate() - ((day + 6) % 7))

  return Array.from({length: 7}, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return {
      day: DAY_LABELS[d.getDay()],
      date: d.getDate(),
      fullDate: new Date(d),
    }
  })
}

function formatLongDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date)
}

function formatTime(isoString: string): string {
  const d = new Date(isoString)
  return d.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})
}

function formatEndTime(
  isoString: string,
  durationMinutes: number | null
): string {
  if (!durationMinutes) return ''
  const d = new Date(isoString)
  d.setMinutes(d.getMinutes() + durationMinutes)
  return d.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})
}

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

function getInterventionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    maintenance: 'Entretien',
    plantation: 'Plantation',
    setup: 'Installation',
    harvest_support: 'Aide récolte',
    consultation: 'Consultation',
  }
  return labels[type] ?? type
}

// ============================================================
// AgendaCard Component
// ============================================================

function AgendaCard({
  time,
  endTime,
  client,
  type,
  address,
  status,
  isNext,
  href,
}: {
  time: string
  endTime: string
  client: string
  type: string
  address: string
  status: 'completed' | 'in_progress' | 'scheduled'
  isNext?: boolean
  href: string
}) {
  const statusStyles = {
    completed: 'border-l-4 border-l-emerald-500 bg-stone-50 opacity-70',
    in_progress:
      'border-l-4 border-l-blue-500 bg-white shadow-md ring-1 ring-blue-100',
    scheduled: 'border-l-4 border-l-stone-300 bg-white',
  }

  return (
    <div className="flex gap-3">
      <div className="flex w-14 shrink-0 flex-col items-center pt-1">
        <span className="text-sm font-bold text-stone-900">{time}</span>
        <span className="text-xs text-stone-400">{endTime}</span>
        {isNext && (
          <div className="mt-2 h-full w-0.5 rounded-full bg-blue-200" />
        )}
      </div>

      <Link href={href} className="flex-1">
        <Card
          className={cn(
            'flex-1 overflow-hidden border-0 shadow-sm',
            statusStyles[status]
          )}
        >
          <CardContent className="p-3">
            <div className="mb-1 flex items-start justify-between">
              <Badge
                variant="secondary"
                className="h-5 border bg-white px-1.5 text-[10px] font-normal"
              >
                {type}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="-mt-1 -mr-1 h-6 w-6 text-stone-400"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
            <h3 className="mb-1 leading-tight font-bold text-stone-900">
              {client}
            </h3>
            <div className="flex items-start gap-1.5 text-xs text-stone-500">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span className="line-clamp-1">{address}</span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  )
}

// ============================================================
// Page Component
// ============================================================

export default function AgendaPage() {
  const locale = useLocale()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [interventions, setInterventions] = useState<AgendaIntervention[]>([])
  const [loading, setLoading] = useState(true)

  const weekDays = getWeekDays(selectedDate)
  const currentMonth = `${MONTH_NAMES[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`

  const navigateWeek = (direction: number) => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + direction * 7)
    setSelectedDate(newDate)
  }

  const fetchInterventions = useCallback(async () => {
    setLoading(true)
    try {
      const startOfDay = new Date(selectedDate)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(selectedDate)
      endOfDay.setHours(23, 59, 59, 999)

      const res = await fetch(
        `/api/interventions/by-date-range?start=${startOfDay.toISOString()}&end=${endOfDay.toISOString()}`
      )
      if (res.ok) {
        const data = await res.json()
        setInterventions(data)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [selectedDate])

  useEffect(() => {
    fetchInterventions()
  }, [fetchInterventions])

  const dayInterventionCount = interventions.length

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="font-heading text-xl font-bold text-stone-900">
            Agenda
          </h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => navigateWeek(-1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="w-32 text-center text-sm font-medium">
              {currentMonth}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => navigateWeek(1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Week Strip */}
        <div className="scrollbar-hide flex items-center justify-between gap-2 overflow-x-auto pb-2">
          {weekDays.map((d) => (
            <button
              key={d.date}
              onClick={() => setSelectedDate(d.fullDate)}
              className={cn(
                'flex h-16 min-w-[3rem] flex-col items-center justify-center rounded-xl border transition-colors',
                isSameDay(selectedDate, d.fullDate)
                  ? 'bg-primary border-primary text-white shadow-md'
                  : 'hover:border-primary/50 border-stone-100 bg-white text-stone-500'
              )}
            >
              <span className="text-[10px] font-medium uppercase">{d.day}</span>
              <span className="text-lg font-bold">{d.date}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Timeline Content */}
      <main className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium tracking-wider text-stone-500 uppercase">
            {formatLongDate(selectedDate)}
          </h2>
          <Badge
            variant="outline"
            className="border-emerald-200 bg-emerald-50 text-emerald-700"
          >
            {dayInterventionCount} Intervention
            {dayInterventionCount !== 1 ? 's' : ''}
          </Badge>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-sm text-stone-400">Chargement...</div>
          </div>
        ) : interventions.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <p className="text-stone-500">Aucune intervention ce jour</p>
            <Button asChild>
              <Link href={`/${locale}/tournees/new`}>
                <Plus className="mr-2 h-4 w-4" />
                Planifier une intervention
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {interventions.map((intervention, index) => {
              const client = intervention.gardenClient
              const clientName = client
                ? `${client.firstName} ${client.lastName}`
                : 'Client inconnu'
              const address = client
                ? `${client.addressStreet ?? ''}, ${client.addressCity ?? ''}`
                : ''
              const isNext =
                intervention.status === 'in_progress' ||
                (intervention.status === 'scheduled' &&
                  index > 0 &&
                  interventions[index - 1]?.status !== 'scheduled')

              return (
                <AgendaCard
                  key={intervention.id}
                  time={formatTime(intervention.scheduledDate)}
                  endTime={formatEndTime(
                    intervention.scheduledDate,
                    intervention.durationMinutes
                  )}
                  client={clientName}
                  type={getInterventionTypeLabel(intervention.type)}
                  address={address}
                  status={
                    intervention.status as
                      | 'completed'
                      | 'in_progress'
                      | 'scheduled'
                  }
                  isNext={isNext}
                  href={`/${locale}/tournees/${intervention.id}`}
                />
              )
            })}
          </div>
        )}

        {/* Add event button */}
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            className="hover:border-primary hover:text-primary w-full border-dashed border-stone-300 text-stone-500"
            asChild
          >
            <Link href={`/${locale}/tournees/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un événement
            </Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
