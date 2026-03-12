'use client'

import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  MoreHorizontal,
  Plus,
} from 'lucide-react'
import {useState} from 'react'

import {FarmerMobileNav} from '@/components/layouts/farmer-mobile-nav'
import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {Card, CardContent} from '@/components/ui/card'
import {cn} from '@/lib/utils'

export default function FarmerAgendaWireframe() {
  const [selectedDate, setSelectedDate] = useState<number>(12) // Simulating March 12th selected

  // Fake days for the week strip
  const weekDays = [
    {day: 'Lun', date: 11, active: false},
    {day: 'Mar', date: 12, active: true},
    {day: 'Mer', date: 13, active: false},
    {day: 'Jeu', date: 14, active: false},
    {day: 'Ven', date: 15, active: false},
    {day: 'Sam', date: 16, active: false},
    {day: 'Dim', date: 17, active: false},
  ]

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="font-heading text-xl font-bold text-stone-900">
            Agenda
          </h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="w-24 text-center text-sm font-medium">
              Mars 2024
            </span>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Week Strip */}
        <div className="scrollbar-hide flex items-center justify-between gap-2 overflow-x-auto pb-2">
          {weekDays.map((d) => (
            <button
              key={d.date}
              onClick={() => setSelectedDate(d.date)}
              className={cn(
                'flex h-16 min-w-[3rem] flex-col items-center justify-center rounded-xl border transition-colors',
                selectedDate === d.date
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
            Mardi 12 Mars
          </h2>
          <Badge
            variant="outline"
            className="border-emerald-200 bg-emerald-50 text-emerald-700"
          >
            3 Interventions
          </Badge>
        </div>

        <div className="space-y-4">
          {/* Slot 1: Completed */}
          <AgendaCard
            time="09:00 - 10:30"
            client="Mme. Dupont"
            type="Entretien"
            address="12 Rue des Lilas"
            status="completed"
          />

          {/* Slot 2: In Progress */}
          <AgendaCard
            time="10:45 - 12:15"
            client="M. Martin"
            type="Plantation"
            address="8 Impasse du Verger"
            status="in-progress"
            isNext
          />

          {/* Break */}
          <div className="flex items-center gap-4 py-2 opacity-60">
            <div className="w-16 text-center text-xs font-medium text-stone-400">
              12:30
            </div>
            <div className="h-px flex-1 border-t border-dashed border-stone-300 bg-stone-200"></div>
            <span className="bg-stone-50 px-2 text-xs font-medium text-stone-400">
              Pause Déjeuner
            </span>
          </div>

          {/* Slot 3: Upcoming */}
          <AgendaCard
            time="14:00 - 16:00"
            client="Famille Leroy"
            type="Tonte & Taille"
            address="45 Avenue de la Gare"
            status="upcoming"
          />
        </div>

        {/* Empty State / Add Button hint */}
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            className="hover:border-primary hover:text-primary w-full border-dashed border-stone-300 text-stone-500"
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un événement
          </Button>
        </div>
      </main>

      <FarmerMobileNav />
    </div>
  )
}

function AgendaCard({
  time,
  client,
  type,
  address,
  status,
  isNext,
}: {
  time: string
  client: string
  type: string
  address: string
  status: 'completed' | 'in-progress' | 'upcoming'
  isNext?: boolean
}) {
  const statusStyles = {
    completed: 'border-l-4 border-l-emerald-500 bg-stone-50 opacity-70',
    'in-progress':
      'border-l-4 border-l-blue-500 bg-white shadow-md ring-1 ring-blue-100',
    upcoming: 'border-l-4 border-l-stone-300 bg-white',
  }

  return (
    <div className="flex gap-3">
      <div className="flex w-14 shrink-0 flex-col items-center pt-1">
        <span className="text-sm font-bold text-stone-900">
          {time.split(' - ')[0]}
        </span>
        <span className="text-xs text-stone-400">{time.split(' - ')[1]}</span>
        {isNext && (
          <div className="mt-2 h-full w-0.5 rounded-full bg-blue-200"></div>
        )}
      </div>

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
    </div>
  )
}
