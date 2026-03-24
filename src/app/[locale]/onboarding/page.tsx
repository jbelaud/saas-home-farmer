import {redirect} from 'next/navigation'
import {setRequestLocale} from 'next-intl/server'

import withAuth from '@/components/features/auth/with-auth'
import {OnboardingWizard} from '@/components/features/onboarding/onboarding-wizard'
import {getAuthUser} from '@/services/authentication/auth-service'
import {getFarmerProfileByOrganizationIdService} from '@/services/facades/farmer-service-facade'

async function OnboardingPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params
  setRequestLocale(locale)

  const user = await getAuthUser()

  // Chercher le profil farmer sur toutes les orgs de l'utilisateur
  // (l'org active peut ne pas être celle avec le profil farmer)
  if (user?.organizations?.length) {
    for (const orgMember of user.organizations) {
      const orgId = orgMember.organization?.id
      if (orgId) {
        const profile = await getFarmerProfileByOrganizationIdService(orgId)
        if (profile) {
          redirect('/dashboard')
        }
      }
    }
  }

  return <OnboardingWizard />
}

export default withAuth(OnboardingPage)
