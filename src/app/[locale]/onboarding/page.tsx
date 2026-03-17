import {redirect} from 'next/navigation'
import {setRequestLocale} from 'next-intl/server'

import withAuth from '@/components/features/auth/with-auth'
import {OnboardingWizard} from '@/components/features/onboarding/onboarding-wizard'
import {getSessionAuth} from '@/services/authentication/auth-service'
import {getFarmerProfileByOrganizationIdService} from '@/services/facades/farmer-service-facade'

async function OnboardingPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params
  setRequestLocale(locale)

  const session = await getSessionAuth()
  const organizationId = session?.session?.activeOrganizationId

  if (organizationId) {
    const profile =
      await getFarmerProfileByOrganizationIdService(organizationId)
    if (profile) {
      redirect('/dashboard')
    }
  }

  return <OnboardingWizard />
}

export default withAuth(OnboardingPage)
