'use server'

import {revalidatePath} from 'next/cache'

import {getAuthUser} from '@/services/authentication/auth-utils'
import {updateOrganizationService} from '@/services/facades/organization-service-facade'
import {UpdateOrganization} from '@/services/types/domain/organization-types'

import {
  organizationFormSchema,
  OrganizationFormSchemaType,
} from './organization-form-validation'

type ValidationError = {
  field: keyof OrganizationFormSchemaType
  message: string
}

export type FormState = {
  success: boolean
  errors?: ValidationError[]
  message?: string
}

export async function updateOrganizationAction(
  prevState?: FormState,
  formData?: FormData
): Promise<FormState> {
  const user = await getAuthUser()
  if (!user) {
    return {success: false, message: 'Utilisateur non trouvé'}
  }
  if (!formData) {
    return {success: false, message: 'Données invalides'}
  }

  // Extraire les données du FormData
  const organizationData: UpdateOrganization = {
    id: formData.get('id') as string,
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    description: formData.get('description') as string,
    image: formData.get('image') as string,
  }

  // STEP 1 : Valider les données avec le schéma Zod côté back
  const validationResult = organizationFormSchema.safeParse(organizationData)

  if (!validationResult.success) {
    // Récupérer les messages d'erreur à plat
    const errorMessages = validationResult.error.errors
      .map((err) => `${err.path.join('.')}: ${err.message}`)
      .join(', ')
    // Récupérer les messages d'erreur pour chaque champ
    const validationErrors: ValidationError[] =
      validationResult.error.errors.map((err) => ({
        field: err.path[0] as keyof OrganizationFormSchemaType,
        message: err.message,
      }))
    return {
      success: false,
      message: `Validation échouée: ${errorMessages}`,
      errors: validationErrors,
    }
  }

  const validatedData = validationResult.data as UpdateOrganization

  try {
    await updateOrganizationService(validatedData)
    revalidatePath('/organizations')
    return {success: true, message: 'Organisation mise à jour avec succès'}
  } catch (error) {
    console.error(error)
    return {
      success: false,
      message: "Échec de la mise à jour de l'organisation",
    }
  }
}
