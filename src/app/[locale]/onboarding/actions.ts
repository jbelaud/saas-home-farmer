'use server'

import {isRedirectError} from 'next/dist/client/components/redirect-error'
import {headers} from 'next/headers'
import {redirect} from 'next/navigation'
import {getLocale} from 'next-intl/server'
import {z} from 'zod'

import {auth} from '@/lib/better-auth/auth'
import {getAuthUser} from '@/services/authentication/auth-service'
import {initializeFarmerOnboardingService} from '@/services/facades/farmer-service-facade'
import {createOrganizationService} from '@/services/facades/organization-service-facade'

const onboardingSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  companyName: z.string().min(1),
  phone: z.string().max(20).optional().or(z.literal('')),
  country: z.enum(['FR', 'BE', 'CH', 'OTHER']),
})

export type OnboardingFormState = {
  success: boolean
  message?: string
  errors?: {field: string; message: string}[]
}

export async function completeOnboardingAction(
  _prev: OnboardingFormState,
  formData: FormData
): Promise<OnboardingFormState> {
  try {
    const user = await getAuthUser()
    if (!user) {
      return {success: false, message: 'Non authentifié'}
    }

    const raw = {
      firstName: formData.get('firstName')?.toString() ?? '',
      lastName: formData.get('lastName')?.toString() ?? '',
      companyName: formData.get('companyName')?.toString() ?? '',
      phone: formData.get('phone')?.toString() ?? '',
      country: formData.get('country')?.toString() ?? 'FR',
    }

    const parsed = onboardingSchema.safeParse(raw)
    if (!parsed.success) {
      return {
        success: false,
        message: 'Données invalides',
        errors: parsed.error.issues.map((i) => ({
          field: String(i.path[0]),
          message: i.message,
        })),
      }
    }

    const {firstName, lastName, companyName, phone, country} = parsed.data

    // Mettre à jour le nom et le téléphone de l'utilisateur
    await auth.api.updateUser({
      headers: await headers(),
      body: {
        name: `${firstName} ${lastName}`,
        ...(phone ? {phone} : {}),
      },
    })

    // Créer l'Organization (= le compte Farmer dans Better Auth)
    const slug = companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .concat('-', Date.now().toString(36))

    const organization = await createOrganizationService({
      name: companyName,
      slug,
    })

    // Créer le farmerProfile lié à l'organization
    await initializeFarmerOnboardingService(organization.id, {
      companyName,
      country,
    })

    // Activer l'organisation dans la session pour éviter la boucle onboarding
    await auth.api.setActiveOrganization({
      headers: await headers(),
      body: {organizationId: organization.id},
    })

    const locale = await getLocale()
    redirect(`/${locale}/dashboard`)
  } catch (error) {
    if (isRedirectError(error)) throw error
    console.error('Onboarding error:', error)
    return {
      success: false,
      message: 'Une erreur est survenue lors de la création de votre compte.',
    }
  }
}
