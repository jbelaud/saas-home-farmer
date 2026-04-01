'use client'

import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Filter,
  MapPin,
  User,
} from 'lucide-react'
import Link from 'next/link'
import {useLocale} from 'next-intl'
import {useMemo, useState} from 'react'

import {Badge} from '@/components/ui/badge'

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
    addressStreet: string
    addressCity: string
    addressZip: string
  } | null
}

type StatusKey = 'all' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'

const STATUS_CONFIG: Record<
  string,
  {label: string; color: string; bg: string; dot: string}
> = {
  scheduled: {
    label: 'Planifiée',
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200',
    dot: 'bg-blue-500',
  },
  in_progress: {
    label: 'En cours',
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
    dot: 'bg-amber-500',
  },
  completed: {
    label: 'Terminée',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  cancelled: {
    label: 'Annulée',
    color: 'text-stone-500',
    bg: 'bg-stone-50 border-stone-200',
    dot: 'bg-stone-400',
  },
}

const TYPE_LABELS: Record<string, string> = {
  maintenance: 'Entretien',
  plantation: 'Plantation',
  setup: 'Installation',
  harvest_support: 'Aide récolte',
  consultation: 'Consultation',
}

const TYPE_ICONS: Record<string, string> = {
  maintenance: '🌿',
  plantation: '🌱',
  setup: '🏗️',
  harvest_support: '🧺',
  consultation: '💬',
}

const FILTER_OPTIONS: {key: StatusKey; label: string}[] = [
  {key: 'all', label: 'Toutes'},
  {key: 'scheduled', label: 'Planifiées'},
  {key: 'in_progress', label: 'En cours'},
  {key: 'completed', label: 'Terminées'},
  {key: 'cancelled', label: 'Annulées'},
]

function getDayKey(date: Date): string {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getDayLabel(dayKey: string): string {
  const today = new Date()
  const todayKey = getDayKey(today)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowKey = getDayKey(tomorrow)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayKey = getDayKey(yesterday)

  if (dayKey === todayKey) return "Aujourd'hui"
  if (dayKey === tomorrowKey) return 'Demain'
  if (dayKey === yesterdayKey) return 'Hier'

  const d = new Date(`${dayKey}T00:00:00`)
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(d)
}

function isDayPast(dayKey: string): boolean {
  const todayKey = getDayKey(new Date())
  return dayKey < todayKey
}

function isDayToday(dayKey: string): boolean {
  return dayKey === getDayKey(new Date())
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function InterventionList({
  interventions,
}: {
  interventions: InterventionItem[]
}) {
  const locale = useLocale()
  const [statusFilter, setStatusFilter] = useState<StatusKey>('all')

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return interventions
    return interventions.filter((i) => i.status === statusFilter)
  }, [interventions, statusFilter])

  const grouped = useMemo(() => {
    const map = new Map<string, InterventionItem[]>()
    for (const item of filtered) {
      const key = getDayKey(item.scheduledDate)
      if (!map.has(key)) map.set(key, [])
      map.get(key)?.push(item)
    }
    // Sort days: today first, then future asc, then past desc
    const entries = Array.from(map.entries())
    entries.sort(([a], [b]) => {
      const todayKey = getDayKey(new Date())
      const aIsPast = a < todayKey
      const bIsPast = b < todayKey
      if (aIsPast !== bIsPast) return aIsPast ? 1 : -1
      return a.localeCompare(b)
    })
    return entries
  }, [filtered])

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {all: interventions.length}
    for (const item of interventions) {
      counts[item.status] = (counts[item.status] || 0) + 1
    }
    return counts
  }, [interventions])

  if (interventions.length === 0) {
    return null
  }

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Filter className="h-4 w-4 shrink-0 text-stone-400" />
        {FILTER_OPTIONS.map((opt) => {
          const count = statusCounts[opt.key] || 0
          if (opt.key !== 'all' && count === 0) return null
          const isActive = statusFilter === opt.key
          return (
            <button
              key={opt.key}
              onClick={() => setStatusFilter(opt.key)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                  : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
              }`}
            >
              {opt.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-100 text-stone-500'
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Grouped by day */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-sm text-stone-400">
          Aucune intervention pour ce filtre.
        </div>
      ) : (
        grouped.map(([dayKey, items]) => {
          const isToday = isDayToday(dayKey)
          const isPast = isDayPast(dayKey)
          return (
            <div key={dayKey} className="space-y-2">
              {/* Day header */}
              <div className="flex items-center gap-2 px-1">
                <div
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-bold ${
                    isToday
                      ? 'bg-emerald-600 text-white'
                      : isPast
                        ? 'bg-stone-100 text-stone-400'
                        : 'bg-stone-100 text-stone-700'
                  }`}
                >
                  <Calendar className="h-3.5 w-3.5" />
                  {getDayLabel(dayKey)}
                </div>
                <span className="text-xs text-stone-400">
                  {items.length} intervention{items.length > 1 ? 's' : ''}
                </span>
              </div>

              {/* Intervention cards */}
              <div className="space-y-2">
                {items.map((intervention) => {
                  const statusCfg =
                    STATUS_CONFIG[intervention.status] ??
                    STATUS_CONFIG.scheduled
                  const client = intervention.gardenClient
                  const isCompleted = intervention.status === 'completed'

                  return (
                    <Link
                      key={intervention.id}
                      href={`/${locale}/tournees/${intervention.id}`}
                    >
                      <div
                        className={`group flex items-stretch gap-0 overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:shadow-md ${
                          isCompleted ? 'opacity-70' : ''
                        }`}
                      >
                        {/* Left time strip */}
                        <div
                          className={`flex w-20 shrink-0 flex-col items-center justify-center border-r py-3 ${
                            isCompleted
                              ? 'bg-emerald-50'
                              : isToday
                                ? 'bg-emerald-50'
                                : 'bg-stone-50'
                          }`}
                        >
                          <span
                            className={`text-lg font-bold ${
                              isCompleted
                                ? 'text-emerald-600'
                                : isToday
                                  ? 'text-emerald-700'
                                  : 'text-stone-700'
                            }`}
                          >
                            {formatTime(intervention.scheduledDate)}
                          </span>
                          {intervention.durationMinutes ? (
                            <span className="flex items-center gap-0.5 text-[11px] text-stone-400">
                              <Clock className="h-3 w-3" />
                              {intervention.durationMinutes}min
                            </span>
                          ) : null}
                        </div>

                        {/* Main content */}
                        <div className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3">
                          {/* Client avatar */}
                          {client ? (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                              {getInitials(client.firstName, client.lastName)}
                            </div>
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-100">
                              <User className="h-4 w-4 text-stone-400" />
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            {/* Client name + type */}
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-bold text-stone-900">
                                {client
                                  ? `${client.firstName} ${client.lastName}`
                                  : 'Client inconnu'}
                              </p>
                              <span className="shrink-0 text-xs">
                                {TYPE_ICONS[intervention.type] ?? '📋'}{' '}
                              </span>
                              <span className="hidden truncate text-xs text-stone-500 sm:inline">
                                {TYPE_LABELS[intervention.type] ??
                                  intervention.type}
                              </span>
                            </div>

                            {/* Address */}
                            {client && (
                              <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-stone-400">
                                <MapPin className="h-3 w-3 shrink-0" />
                                {client.addressCity}
                              </p>
                            )}
                          </div>

                          {/* Status + chevron */}
                          <div className="flex shrink-0 items-center gap-2">
                            {isCompleted ? (
                              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            ) : (
                              <Badge
                                variant="outline"
                                className={`text-[10px] ${statusCfg.color} ${statusCfg.bg}`}
                              >
                                <span
                                  className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${statusCfg.dot}`}
                                />
                                {statusCfg.label}
                              </Badge>
                            )}
                            <ChevronRight className="h-4 w-4 text-stone-300 transition-transform group-hover:translate-x-0.5" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
