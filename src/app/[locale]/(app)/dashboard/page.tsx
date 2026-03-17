import {redirect} from 'next/navigation'

import withAuth, {WithAuthProps} from '@/components/features/auth/with-auth'
import DashboardPage from '@/components/features/dashboard/dashboard'
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

  return <DashboardPage />
}

export default withAuth(Page)
