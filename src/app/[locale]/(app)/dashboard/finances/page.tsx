import {redirect} from 'next/navigation'

import withAuth, {WithAuthProps} from '@/components/features/auth/with-auth'
import {FinancesDashboardClient} from '@/components/features/finances/finances-dashboard-client'
import {
  getActiveOrganizationId,
  getAuthUser,
} from '@/services/authentication/auth-service'
import {getFarmerProfileByOrganizationIdService} from '@/services/facades/farmer-service-facade'
import {getAvailableYearsService} from '@/services/facades/finance-service-facade'

async function Page({
  searchParams,
}: WithAuthProps & {searchParams?: Promise<{year?: string}>}) {
  const resolvedSearchParams = await searchParams
  const user = await getAuthUser()
  const organizationId = await getActiveOrganizationId()

  if (!organizationId) {
    redirect('/onboarding')
  }

  const farmerProfile =
    await getFarmerProfileByOrganizationIdService(organizationId)

  if (!farmerProfile) {
    redirect('/onboarding')
  }

  const availableYears = await getAvailableYearsService()
  const currentYear = resolvedSearchParams?.year
    ? Number(resolvedSearchParams.year)
    : new Date().getFullYear()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-stone-900">
          Mon activité financière
        </h1>
        <p className="text-stone-500">
          {farmerProfile.companyName ?? user?.name ?? 'Farmer'}
        </p>
      </div>

      <FinancesDashboardClient
        availableYears={availableYears}
        initialYear={currentYear}
        userName={user?.name ?? 'Farmer'}
        companyName={farmerProfile.companyName ?? ''}
      />
    </div>
  )
}

export default withAuth(Page)
