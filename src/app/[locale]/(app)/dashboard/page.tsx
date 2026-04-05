import {
  AlertTriangle,
  CalendarPlus,
  ChevronRight,
  Clock,
  CloudSun,
  Euro,
  MapPin,
  Users,
  Wallet,
} from 'lucide-react'
import Link from 'next/link'
import {redirect} from 'next/navigation'

import withAuth, {WithAuthProps} from '@/components/features/auth/with-auth'
import {PlanBanner} from '@/components/features/subscription/plan-banner'
import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {Card, CardContent} from '@/components/ui/card'
import {
  getActiveOrganizationId,
  getAuthUser,
} from '@/services/authentication/auth-service'
import {getFarmerProfileByOrganizationIdService} from '@/services/facades/farmer-service-facade'
import {
  getEstimatedRevenueYtdService,
  getMrrService,
} from '@/services/facades/finance-service-facade'
import {
  getActiveClientsCountService,
  getClientsNeedingVisitService,
  getClientsWithoutNextVisitService,
} from '@/services/facades/garden-client-service-facade'
import {
  getScheduledInterventionsService,
  getTodayInterventionsWithClientService,
} from '@/services/facades/intervention-service-facade'

// ============================================================
// Helpers
// ============================================================

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

function formatDate(): string {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())
}

function formatRelativeDate(date: Date): string {
  const now = new Date()
  const target = new Date(date)
  const diffMs = target.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < -1) return `En retard de ${Math.abs(diffDays)}j`
  if (diffDays === -1) return 'Hier'
  if (diffDays === 0) return "Aujourd'hui"
  if (diffDays === 1) return 'Demain'
  if (diffDays <= 7) return `Dans ${diffDays}j`
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
  }).format(target)
}

function isOverdue(date: Date): boolean {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return new Date(date) < now
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
// Page
// ============================================================

async function Page({
  params,
}: WithAuthProps & {params?: Promise<{locale?: string}>}) {
  const resolvedParams = await params
  const locale = resolvedParams?.locale ?? 'fr'

  const user = await getAuthUser()

  // getActiveOrganizationId résout la bonne org (celle avec un profil farmer)
  const organizationId = await getActiveOrganizationId()

  if (!organizationId) {
    redirect('/onboarding')
  }

  const farmerProfile =
    await getFarmerProfileByOrganizationIdService(organizationId)

  if (!farmerProfile) {
    redirect('/onboarding')
  }

  const [
    clientsCount,
    todayInterventions,
    scheduledInterventions,
    clientsNeedingVisit,
    clientsWithoutVisit,
    mrr,
    estimatedCa,
  ] = await Promise.all([
    getActiveClientsCountService(),
    getTodayInterventionsWithClientService(),
    getScheduledInterventionsService(),
    getClientsNeedingVisitService(7),
    getClientsWithoutNextVisitService(),
    getMrrService(),
    getEstimatedRevenueYtdService(
      new Date(new Date().getFullYear(), 0, 1),
      new Date()
    ),
  ])

  const firstName = user?.name?.split(' ')[0] ?? 'Farmer'
  const completedToday = todayInterventions.filter(
    (i) => i.status === 'completed'
  ).length
  const totalToday = todayInterventions.length
  const overdueClients = clientsNeedingVisit.filter(
    (c) => c.nextVisitDate && isOverdue(c.nextVisitDate)
  )
  const upcomingClients = clientsNeedingVisit.filter(
    (c) => c.nextVisitDate && !isOverdue(c.nextVisitDate)
  )
  const toPlanCount =
    overdueClients.length + upcomingClients.length + clientsWithoutVisit.length

  return (
    <div>
      {/* Header Mobile — vert avec KPI tournée */}
      <header className="bg-primary text-primary-foreground rounded-b-3xl p-6 shadow-md md:hidden">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold">
              Bonjour, {firstName} 👋
            </h1>
            <p className="text-sm opacity-90">{formatDate()}</p>
          </div>
          <div className="flex flex-col items-center rounded-xl bg-white/10 p-2 backdrop-blur-sm">
            <CloudSun className="mb-1 h-6 w-6" />
            <span className="text-xs font-bold">—</span>
          </div>
        </div>

        {/* KPI Tournée */}
        <div className="mt-2 flex gap-4">
          <div className="w-full rounded-lg bg-white/10 px-3 py-2">
            <span className="block text-xs opacity-80">Tournée du jour</span>
            <div className="flex items-end justify-between">
              <span className="text-lg font-bold">
                {completedToday}/{totalToday}
              </span>
              <span className="mb-1 text-xs opacity-80">terminé</span>
            </div>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-black/20">
              <div
                className="h-full bg-white"
                style={{
                  width:
                    totalToday > 0
                      ? `${(completedToday / totalToday) * 100}%`
                      : '0%',
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <div className="hidden pt-6 md:block">
        <h1 className="font-heading text-2xl font-bold text-stone-900">
          Bonjour, {firstName} 👋
        </h1>
        <p className="text-stone-500">
          {farmerProfile.companyName} · {formatDate()}
        </p>
      </div>

      <main className="space-y-6 py-6">
        {/* KPI Cards */}
        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Card className="border-none bg-white shadow-sm">
            <CardContent className="p-3">
              <div className="mb-1 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-blue-600" />
                <p className="text-muted-foreground text-[10px] font-bold uppercase">
                  Clients
                </p>
              </div>
              <p className="text-xl font-bold text-stone-900">{clientsCount}</p>
            </CardContent>
          </Card>
          <Card className="border-none bg-white shadow-sm">
            <CardContent className="p-3">
              <div className="mb-1 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-emerald-600" />
                <p className="text-muted-foreground text-[10px] font-bold uppercase">
                  Planifiées
                </p>
              </div>
              <p className="text-xl font-bold text-stone-900">
                {scheduledInterventions.length}
              </p>
            </CardContent>
          </Card>
          <Card
            className={`border-none shadow-sm ${toPlanCount > 0 ? 'bg-amber-50' : 'bg-white'}`}
          >
            <CardContent className="p-3">
              <div className="mb-1 flex items-center gap-1.5">
                <CalendarPlus
                  className={`h-3.5 w-3.5 ${toPlanCount > 0 ? 'text-amber-600' : 'text-stone-400'}`}
                />
                <p className="text-muted-foreground text-[10px] font-bold uppercase">
                  À planifier
                </p>
              </div>
              <p
                className={`text-xl font-bold ${toPlanCount > 0 ? 'text-amber-700' : 'text-stone-900'}`}
              >
                {toPlanCount}
              </p>
            </CardContent>
          </Card>
          <Link href="/dashboard/finances">
            <Card className="border-none bg-white shadow-sm transition-shadow hover:shadow-md">
              <CardContent className="p-3">
                <div className="mb-1 flex items-center gap-1.5">
                  <Euro className="h-3.5 w-3.5 text-emerald-600" />
                  <p className="text-muted-foreground text-[10px] font-bold uppercase">
                    MRR
                  </p>
                </div>
                <p className="text-xl font-bold text-emerald-700">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(mrr)}
                </p>
              </CardContent>
            </Card>
          </Link>
        </section>

        {/* Chiffre d'affaires Card */}
        {estimatedCa > 0 && (
          <Link href="/dashboard/finances">
            <Card className="border-none bg-emerald-50 shadow-sm transition-shadow hover:shadow-md">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                    <Wallet className="h-5 w-5 text-emerald-700" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-600 uppercase">
                      CA estimé {new Date().getFullYear()}
                    </p>
                    <p className="text-xl font-bold text-emerald-800">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(estimatedCa)}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-emerald-400" />
              </CardContent>
            </Card>
          </Link>
        )}

        {/* Bannière Plan */}
        <PlanBanner
          organizationId={organizationId}
          clientsCount={clientsCount}
          locale={locale}
        />

        {/* Section: Aujourd'hui */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold text-stone-800">
              Aujourd&apos;hui
            </h2>
            <Button variant="ghost" size="sm" className="text-primary" asChild>
              <Link href="/agenda">Agenda</Link>
            </Button>
          </div>

          {totalToday === 0 ? (
            <Card className="border-none shadow-sm">
              <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                <p className="text-sm text-stone-500">
                  Aucune intervention prévue aujourd&apos;hui
                </p>
                <Button size="sm" asChild>
                  <Link href="/tournees/new">Planifier une visite</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {todayInterventions.map((intervention) => {
                const client = intervention.gardenClient
                const clientName = client
                  ? `${client.firstName} ${client.lastName}`
                  : 'Client inconnu'
                const address = client?.addressCity ?? ''
                const isCurrent = intervention.status === 'in_progress'
                const isDone = intervention.status === 'completed'

                return (
                  <Link
                    key={intervention.id}
                    href={`/tournees/${intervention.id}`}
                  >
                    <Card
                      className={`border-none shadow-sm transition-shadow hover:shadow-md ${isCurrent ? 'ring-primary ring-2 ring-offset-1' : ''}`}
                    >
                      <CardContent className="flex items-center gap-3 p-3">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            isDone
                              ? 'bg-emerald-100 text-emerald-700'
                              : isCurrent
                                ? 'bg-primary text-white'
                                : 'bg-stone-100 text-stone-500'
                          }`}
                        >
                          {formatTime(intervention.scheduledDate)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-sm font-bold text-stone-900">
                            {clientName}
                          </h3>
                          <div className="text-muted-foreground flex items-center text-xs">
                            <MapPin className="mr-1 h-3 w-3 shrink-0" />
                            <span className="truncate">{address}</span>
                          </div>
                        </div>

                        {isCurrent ? (
                          <Button
                            size="icon"
                            className="bg-accent hover:bg-accent/90 text-accent-foreground h-9 w-9 shrink-0 rounded-full"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        ) : isDone ? (
                          <Badge
                            variant="outline"
                            className="shrink-0 border-emerald-200 bg-emerald-50 text-emerald-700"
                          >
                            Fait
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="shrink-0 bg-stone-100 text-stone-500"
                          >
                            {getInterventionTypeLabel(intervention.type)}
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        {/* Section: À planifier */}
        {toPlanCount > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold text-stone-800">
                À planifier
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary"
                asChild
              >
                <Link href="/clients">Voir tous</Link>
              </Button>
            </div>

            <div className="space-y-2">
              {/* Clients en retard (rouge) */}
              {overdueClients.map((client) => (
                <Link
                  key={client.id}
                  href={`/tournees/new?clientId=${client.id}`}
                >
                  <Card className="border-l-4 border-none border-l-red-400 shadow-sm transition-shadow hover:shadow-md">
                    <CardContent className="flex items-center gap-3 p-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-bold text-stone-900">
                          {client.firstName} {client.lastName}
                        </h3>
                        <p className="text-xs font-medium text-red-600">
                          {client.nextVisitDate &&
                            formatRelativeDate(client.nextVisitDate)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0 border-red-200 text-red-700 hover:bg-red-50"
                      >
                        Planifier
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}

              {/* Clients à venir cette semaine (amber) */}
              {upcomingClients.map((client) => (
                <Link
                  key={client.id}
                  href={`/tournees/new?clientId=${client.id}`}
                >
                  <Card className="border-none shadow-sm transition-shadow hover:shadow-md">
                    <CardContent className="flex items-center gap-3 p-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
                        <Clock className="h-4 w-4 text-amber-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-bold text-stone-900">
                          {client.firstName} {client.lastName}
                        </h3>
                        <p className="text-xs font-medium text-amber-600">
                          {client.nextVisitDate &&
                            formatRelativeDate(client.nextVisitDate)}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" className="shrink-0">
                        Planifier
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}

              {/* Clients jamais planifiés (stone) */}
              {clientsWithoutVisit.slice(0, 3).map((client) => (
                <Link
                  key={client.id}
                  href={`/tournees/new?clientId=${client.id}`}
                >
                  <Card className="border-none shadow-sm transition-shadow hover:shadow-md">
                    <CardContent className="flex items-center gap-3 p-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-100">
                        <CalendarPlus className="h-4 w-4 text-stone-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-bold text-stone-900">
                          {client.firstName} {client.lastName}
                        </h3>
                        <p className="text-xs text-stone-500">
                          Jamais planifié
                        </p>
                      </div>
                      <Button size="sm" variant="outline" className="shrink-0">
                        Planifier
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}

              {clientsWithoutVisit.length > 3 && (
                <p className="text-center text-xs text-stone-500">
                  + {clientsWithoutVisit.length - 3} autre
                  {clientsWithoutVisit.length - 3 > 1 ? 's' : ''} client
                  {clientsWithoutVisit.length - 3 > 1 ? 's' : ''} sans prochaine
                  visite
                </p>
              )}
            </div>
          </section>
        )}

        {/* Section: Mon activité */}
        <section className="space-y-4">
          <h2 className="font-heading text-lg font-bold text-stone-800">
            Mon activité
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-none bg-white shadow-sm">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-emerald-600">
                  {
                    todayInterventions.filter((i) => i.status === 'completed')
                      .length
                  }
                </p>
                <p className="text-xs text-stone-500">
                  visites aujourd&apos;hui
                </p>
              </CardContent>
            </Card>
            <Card className="border-none bg-white shadow-sm">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {scheduledInterventions.length}
                </p>
                <p className="text-xs text-stone-500">à venir</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  )
}

export default withAuth(Page)
