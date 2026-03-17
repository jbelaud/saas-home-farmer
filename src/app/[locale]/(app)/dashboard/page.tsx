import {CalendarDays, Leaf, Users} from 'lucide-react'
import {redirect} from 'next/navigation'

import withAuth, {WithAuthProps} from '@/components/features/auth/with-auth'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {getSessionAuth} from '@/services/authentication/auth-service'
import {getFarmerProfileByOrganizationIdService} from '@/services/facades/farmer-service-facade'

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Tableau de bord</h1>
        <p className="text-stone-500">
          Bienvenue sur MyHomeFarmer — votre espace professionnel.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-stone-500">
              Clients actifs
            </CardTitle>
            <Users className="h-4 w-4 text-stone-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">—</p>
            <p className="mt-1 text-xs text-stone-400">À venir</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-stone-500">
              Prochaine tournée
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-stone-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">—</p>
            <p className="mt-1 text-xs text-stone-400">À venir</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-stone-500">
              Mon activité
            </CardTitle>
            <Leaf className="h-4 w-4 text-stone-400" />
          </CardHeader>
          <CardContent>
            <p className="truncate text-lg font-bold">
              {farmerProfile.companyName}
            </p>
            <p className="mt-1 text-xs text-stone-400">
              {farmerProfile.country}
              {farmerProfile.isSapEnabled ? ' · SAP activé' : ''}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-dashed border-stone-300 bg-stone-50">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Leaf className="mb-3 h-10 w-10 text-stone-300" />
          <p className="font-semibold text-stone-500">
            Les fonctionnalités arrivent bientôt
          </p>
          <p className="mt-1 text-sm text-stone-400">
            Gestion des clients, tournées et rapports d&apos;intervention
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default withAuth(Page)
