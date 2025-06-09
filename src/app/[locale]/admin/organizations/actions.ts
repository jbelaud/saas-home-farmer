'use server'

import {revalidatePath} from 'next/cache'

import {requireActionAuth} from '@/app/dal/user-dal'
import {
  deleteOrganizationService,
  updateOrganizationService,
} from '@/services/facades/organization-service-facade'
import {RoleConst} from '@/services/types/domain/auth-types'

export type FormState = {
  success: boolean
  errors?: Array<{field: string; message: string}>
  message?: string
}

export async function updateOrganizationAction(
  id: string,
  prevState?: FormState,
  formData?: FormData
): Promise<FormState> {
  await requireActionAuth({
    roles: [RoleConst.ADMIN, RoleConst.SUPER_ADMIN],
  })
  if (!formData) {
    return {success: false, message: 'Données invalides'}
  }

  try {
    const name = formData.get('name') as string
    const slug = formData.get('slug') as string
    const description = formData.get('description') as string

    // Validation optionnelle des données
    if (!name || !slug) {
      return {
        success: false,
        message: 'Le nom et le slug sont requis',
      }
    }

    await updateOrganizationService({
      id,
      name,
      slug,
      description: description || undefined,
    })

    revalidatePath('/admin/organizations')
    return {
      success: true,
      message: 'Organisation mise à jour avec succès',
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Une erreur est survenue',
    }
  }
}

export async function deleteOrganizationAction(id: string): Promise<FormState> {
  try {
    await deleteOrganizationService(id)

    revalidatePath('/admin/organizations')
    return {
      success: true,
      message: 'Organisation supprimée avec succès',
    }
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Une erreur est survenue',
    }
  }
}
