import {CalendarDays, ClipboardList, Leaf, Plus, Users} from 'lucide-react'
import Link from 'next/link'
import {redirect} from 'next/navigation'

import withAuth, {WithAuthProps} from '@/components/features/auth/with-auth'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {getSessionAuth} from '@/services/authentication/auth-service'
import {getFarmerProfileByOrganizationIdService} from '@/services/facades/farmer-service-facade'
import {getActiveClientsCountService} from '@/services/facades/garden-client-service-facade'
import {
  getInterventionsCountService,
  getScheduledInterventionsService,
} from '@/services/facades/intervention-service-facade'

function formatNextIntervention(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

async function Page(_props: WithAuthProps) {
  const session = await getSessionAuth()
  const organizationId = session?.session?.activeOrganizationId

  if (!organizationId) {
    redirect('/onboarding')
  }

  const farmerProfile =
    await getFarmerProfileByOrganizationIdService(organizationId)

  if (!farmerProfile) {
    redirect('/onboarding')
  }

  const [clientsCount, interventionsCount, scheduledInterventions] =
    await Promise.all([
      getActiveClientsCountService(),
      getInterventionsCountService(),
      getScheduledInterventionsService(),
    ])

  const nextIntervention = scheduledInterventions[0] ?? null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Tableau de bord</h1>
          <p className="text-stone-500">
            {farmerProfile.companyName} · {farmerProfile.country}
            {farmerProfile.isSapEnabled ? ' · SAP' : ''}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/clients">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-stone-500">
                Clients actifs
              </CardTitle>
              <Users className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-emerald-700">
                {clientsCount}
              </p>
              <p className="mt-1 text-xs text-stone-400">
                {clientsCount === 0
                  ? 'Ajoutez votre premier client'
                  : `client${clientsCount > 1 ? 's' : ''} en suivi`}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/tournees">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-stone-500">
                Prochaine intervention
              </CardTitle>
              <CalendarDays className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              {nextIntervention ? (
                <>
                  <p className="text-lg font-bold text-stone-900">
                    {formatNextIntervention(nextIntervention.scheduledDate)}
                  </p>
                  <p className="mt-1 text-xs text-stone-400">
                    {nextIntervention.type === 'maintenance'
                      ? 'Entretien'
                      : nextIntervention.type === 'plantation'
                        ? 'Plantation'
                        : nextIntervention.type === 'setup'
                          ? 'Installation'
                          : nextIntervention.type === 'harvest_support'
                            ? 'Aide récolte'
                            : 'Consultation'}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-3xl font-bold text-stone-300">—</p>
                  <p className="mt-1 text-xs text-stone-400">
                    Aucune planifiée
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </Link>

        <Link href="/tournees">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-stone-500">
                Total interventions
              </CardTitle>
              <ClipboardList className="h-4 w-4 text-stone-400" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{interventionsCount}</p>
              <p className="mt-1 text-xs text-stone-400">
                {scheduledInterventions.length > 0
                  ? `${scheduledInterventions.length} planifiée${scheduledInterventions.length > 1 ? 's' : ''}`
                  : 'Aucune en attente'}
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Actions rapides</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Button className="h-14 justify-start gap-3 text-base" asChild>
            <Link href="/clients/new">
              <Plus className="h-5 w-5" />
              Ajouter un client
            </Link>
          </Button>
          <Button
            className="h-14 justify-start gap-3 text-base"
            variant="outline"
            asChild
          >
            <Link href="/tournees/new">
              <CalendarDays className="h-5 w-5" />
              Planifier une intervention
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Prochaines interventions */}
      {scheduledInterventions.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Prochaines interventions</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/tournees">Voir tout</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {scheduledInterventions.slice(0, 5).map((intervention) => (
              <Link
                key={intervention.id}
                href={`/tournees/${intervention.id}`}
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-stone-50"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
                  <Leaf className="h-4 w-4 text-emerald-700" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {formatNextIntervention(intervention.scheduledDate)}
                  </p>
                  <p className="text-xs text-stone-400">
                    {intervention.durationMinutes
                      ? `${intervention.durationMinutes} min`
                      : 'Durée non définie'}
                  </p>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default withAuth(Page)
