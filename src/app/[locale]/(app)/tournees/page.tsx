import {CalendarDays, CheckCircle2, Clock, Plus} from 'lucide-react'
import Link from 'next/link'

import withAuth from '@/components/features/auth/with-auth'
import {InterventionList} from '@/components/features/interventions/intervention-list'
import {Button} from '@/components/ui/button'
import {Card, CardContent} from '@/components/ui/card'
import {getInterventionsByDateRangeWithClientService} from '@/services/facades/intervention-service-facade'

async function Page() {
  const now = new Date()
  const startDate = new Date(now)
  startDate.setDate(startDate.getDate() - 30)
  const endDate = new Date(now)
  endDate.setDate(endDate.getDate() + 60)

  const interventions = await getInterventionsByDateRangeWithClientService(
    startDate,
    endDate
  )

  const todayStr = now.toISOString().slice(0, 10)
  const todayCount = interventions.filter((i) => {
    const d = new Date(i.scheduledDate).toISOString().slice(0, 10)
    return d === todayStr && i.status !== 'cancelled'
  }).length
  const scheduledCount = interventions.filter(
    (i) => i.status === 'scheduled'
  ).length
  const completedCount = interventions.filter(
    (i) => i.status === 'completed'
  ).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Tournées</h1>
          <p className="text-stone-500">
            Planifiez et suivez vos interventions.
          </p>
        </div>
        <Button className="h-12 bg-emerald-600 hover:bg-emerald-700" asChild>
          <Link href="/tournees/new">
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Nouvelle intervention</span>
            <span className="sm:hidden">Nouveau</span>
          </Link>
        </Button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="flex flex-col items-center py-3">
            <CalendarDays className="mb-1 h-5 w-5 text-emerald-600" />
            <span className="text-2xl font-bold text-emerald-700">
              {todayCount}
            </span>
            <span className="text-[11px] font-medium text-emerald-600">
              Aujourd&apos;hui
            </span>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="flex flex-col items-center py-3">
            <Clock className="mb-1 h-5 w-5 text-blue-600" />
            <span className="text-2xl font-bold text-blue-700">
              {scheduledCount}
            </span>
            <span className="text-[11px] font-medium text-blue-600">
              Planifiées
            </span>
          </CardContent>
        </Card>
        <Card className="border-stone-200 bg-stone-50">
          <CardContent className="flex flex-col items-center py-3">
            <CheckCircle2 className="mb-1 h-5 w-5 text-stone-500" />
            <span className="text-2xl font-bold text-stone-700">
              {completedCount}
            </span>
            <span className="text-[11px] font-medium text-stone-500">
              Terminées
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Intervention list */}
      {interventions.length > 0 ? (
        <InterventionList interventions={interventions} />
      ) : (
        <Card className="border-dashed border-stone-300 bg-stone-50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <CalendarDays className="mb-3 h-10 w-10 text-stone-300" />
            <p className="font-semibold text-stone-500">
              Aucune intervention planifiée
            </p>
            <p className="mt-1 text-sm text-stone-400">
              Cliquez sur &quot;Nouvelle intervention&quot; pour planifier votre
              première visite.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default withAuth(Page)
