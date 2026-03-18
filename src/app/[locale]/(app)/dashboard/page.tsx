import {AlertTriangle, ChevronRight, CloudSun, MapPin} from 'lucide-react'
import Link from 'next/link'
import {redirect} from 'next/navigation'

import withAuth, {WithAuthProps} from '@/components/features/auth/with-auth'
import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {Card, CardContent} from '@/components/ui/card'
import {getSessionAuth} from '@/services/authentication/auth-service'
import {getAuthUser} from '@/services/authentication/auth-service'
import {getFarmerProfileByOrganizationIdService} from '@/services/facades/farmer-service-facade'
import {getActiveClientsCountService} from '@/services/facades/garden-client-service-facade'
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

function getMonthTasks(): {label: string; done: boolean}[] {
  const month = new Date().getMonth()
  const tasksByMonth: Record<number, {label: string; done: boolean}[]> = {
    0: [
      {label: 'Planification des cultures', done: false},
      {label: 'Commande de graines', done: false},
      {label: 'Amendement du sol (si hors gel)', done: false},
    ],
    1: [
      {label: 'Semis sous abri (tomates, poivrons)', done: false},
      {label: 'Taille des arbres fruitiers', done: false},
      {label: 'Préparation des planches de culture', done: false},
    ],
    2: [
      {label: 'Taille des rosiers', done: false},
      {label: 'Semis tomates (intérieur)', done: false},
      {label: 'Amendement du sol', done: true},
    ],
    3: [
      {label: 'Plantation des pommes de terre', done: false},
      {label: 'Semis en pleine terre (radis, carottes)', done: false},
      {label: 'Installation des tuteurs', done: false},
    ],
    4: [
      {label: 'Repiquage des tomates', done: false},
      {label: 'Paillage des massifs', done: false},
      {label: 'Semis haricots et courgettes', done: false},
    ],
    5: [
      {label: 'Arrosage régulier', done: false},
      {label: 'Taille des gourmands (tomates)', done: false},
      {label: 'Récolte fraises et radis', done: false},
    ],
    6: [
      {label: 'Arrosage intensif', done: false},
      {label: 'Récolte tomates et courgettes', done: false},
      {label: 'Semis pour cultures automne', done: false},
    ],
    7: [
      {label: 'Récolte été (tomates, aubergines)', done: false},
      {label: 'Semis engrais vert', done: false},
      {label: 'Préparation cultures automne', done: false},
    ],
    8: [
      {label: 'Plantation poireaux et choux', done: false},
      {label: 'Récolte courges et potirons', done: false},
      {label: 'Nettoyage des parcelles vides', done: false},
    ],
    9: [
      {label: 'Plantation ail et oignons', done: false},
      {label: 'Protection hivernale', done: false},
      {label: 'Dernières récoltes', done: false},
    ],
    10: [
      {label: 'Paillage hivernal', done: false},
      {label: 'Nettoyage du potager', done: false},
      {label: 'Entretien des outils', done: false},
    ],
    11: [
      {label: 'Planification saison prochaine', done: false},
      {label: 'Bilan annuel récoltes', done: false},
      {label: 'Commande de compost', done: false},
    ],
  }
  return tasksByMonth[month] ?? []
}

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

// ============================================================
// Page
// ============================================================

async function Page(_props: WithAuthProps) {
  const session = await getSessionAuth()
  const user = await getAuthUser()
  const organizationId = session?.session?.activeOrganizationId

  if (!organizationId) {
    redirect('/onboarding')
  }

  const farmerProfile =
    await getFarmerProfileByOrganizationIdService(organizationId)

  if (!farmerProfile) {
    redirect('/onboarding')
  }

  const [clientsCount, todayInterventions, scheduledInterventions] =
    await Promise.all([
      getActiveClientsCountService(),
      getTodayInterventionsWithClientService(),
      getScheduledInterventionsService(),
    ])

  const firstName = user?.name?.split(' ')[0] ?? 'Farmer'
  const completedToday = todayInterventions.filter(
    (i) => i.status === 'completed'
  ).length
  const totalToday = todayInterventions.length
  const currentMonth = MONTH_NAMES[new Date().getMonth()]
  const monthTasks = getMonthTasks()

  return (
    <div className="min-h-screen bg-stone-50">
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
            <span className="block text-xs opacity-80">Tournée</span>
            <div className="flex items-end justify-between">
              <span className="text-lg font-bold">
                {completedToday}/{totalToday}
              </span>
              <span className="mb-1 text-xs opacity-80">Terminé</span>
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
      <div className="hidden px-8 pt-6 md:block">
        <h1 className="font-heading text-2xl font-bold text-stone-900">
          Bonjour, {firstName} 👋
        </h1>
        <p className="text-stone-500">
          {farmerProfile.companyName} · {formatDate()}
        </p>
      </div>

      <main className="space-y-6 px-4 py-6 md:px-8">
        {/* KPI Cards */}
        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Card className="border-none bg-white shadow-sm">
            <CardContent className="p-3">
              <p className="text-muted-foreground text-[10px] font-bold uppercase">
                Clients Actifs
              </p>
              <p className="text-xl font-bold text-stone-900">{clientsCount}</p>
              <p className="text-[10px] font-medium text-blue-600">en suivi</p>
            </CardContent>
          </Card>
          <Card className="border-none bg-white shadow-sm">
            <CardContent className="p-3">
              <p className="text-muted-foreground text-[10px] font-bold uppercase">
                Planifiées
              </p>
              <p className="text-xl font-bold text-stone-900">
                {scheduledInterventions.length}
              </p>
              <p className="text-[10px] font-medium text-emerald-600">
                interventions à venir
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Alerte Météo (info statique pour le moment) */}
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-800">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">
            Pensez à vérifier la météo avant chaque tournée. Les prévisions
            seront intégrées prochainement.
          </p>
        </div>

        {/* Section: Ma Tournée du jour */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold text-stone-800">
              Ma Tournée
            </h2>
            <Button variant="ghost" size="sm" className="text-primary" asChild>
              <Link href="/tournees">Voir tout</Link>
            </Button>
          </div>

          {totalToday === 0 ? (
            <Card className="border-none shadow-sm">
              <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                <p className="text-stone-500">
                  Aucune intervention prévue aujourd&apos;hui
                </p>
                <Button asChild>
                  <Link href="/tournees/new">Planifier une intervention</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {todayInterventions.map((intervention) => {
                const client = intervention.gardenClient
                const clientName = client
                  ? `${client.firstName} ${client.lastName}`
                  : 'Client inconnu'
                const address = client?.addressStreet ?? ''
                const isCurrent = intervention.status === 'in_progress'
                const isDone = intervention.status === 'completed'

                return (
                  <Link
                    key={intervention.id}
                    href={`/tournees/${intervention.id}`}
                  >
                    <Card
                      className={`border-none shadow-sm ${isCurrent ? 'ring-primary ring-2 ring-offset-2' : ''}`}
                    >
                      <CardContent className="flex items-center gap-4 p-4">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            isDone
                              ? 'bg-emerald-100 text-emerald-700'
                              : isCurrent
                                ? 'bg-primary text-white'
                                : 'bg-stone-100 text-stone-500'
                          }`}
                        >
                          {formatTime(intervention.scheduledDate)}
                        </div>

                        <div className="flex-1">
                          <h3 className="font-bold text-stone-900">
                            {clientName}
                          </h3>
                          <div className="text-muted-foreground flex items-center text-sm">
                            <MapPin className="mr-1 h-3 w-3" />
                            {address}
                          </div>
                        </div>

                        {isCurrent ? (
                          <Button
                            size="icon"
                            className="bg-accent hover:bg-accent/90 text-accent-foreground h-10 w-10 rounded-full"
                          >
                            <ChevronRight />
                          </Button>
                        ) : isDone ? (
                          <Badge
                            variant="outline"
                            className="border-emerald-200 bg-emerald-50 text-emerald-700"
                          >
                            Fait
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-stone-100 text-stone-500"
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

        {/* Section: Tâches de Saison */}
        <section>
          <h2 className="font-heading mb-4 text-xl font-bold text-stone-800">
            À faire en {currentMonth}
          </h2>
          <Card>
            <CardContent className="p-0">
              {monthTasks.map((task, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-4 ${index < monthTasks.length - 1 ? 'border-b' : ''}`}
                >
                  <div
                    className={`h-2 w-2 rounded-full ${task.done ? 'bg-stone-300' : 'bg-primary'}`}
                  />
                  <span
                    className={`text-sm font-medium ${task.done ? 'text-muted-foreground line-through' : ''}`}
                  >
                    {task.label}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}

export default withAuth(Page)
