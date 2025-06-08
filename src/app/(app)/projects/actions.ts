'use server'

import {revalidatePath} from 'next/cache'

import {requireActionAuth} from '@/app/dal/user-dal'
import {
  deleteProjectService,
  updateProjectService,
} from '@/services/facades/project-service-facade'

export type FormState = {
  success: boolean
  errors?: Array<{field: string; message: string}>
  message?: string
}

export async function updateProjectAction(
  id: string,
  prevState?: FormState,
  formData?: FormData
): Promise<FormState> {
  try {
    await requireActionAuth()

    if (!formData) {
      return {
        success: false,
        message: 'Données invalides',
      }
    }

    const name = formData.get('name') as string
    const description = formData.get('description') as string

    // Validation basique
    if (!name) {
      return {
        success: false,
        message: 'Le nom du projet est requis',
        errors: [{field: 'name', message: 'Le nom est requis'}],
      }
    }

    await updateProjectService({
      id,
      name,
      description: description || undefined,
    })

    revalidatePath('/projects')
    return {
      success: true,
      message: 'Projet mis à jour avec succès',
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du projet:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Une erreur est survenue',
    }
  }
}

export async function deleteProjectAction(id: string): Promise<FormState> {
  try {
    await requireActionAuth()

    await deleteProjectService(id)

    revalidatePath('/projects')
    return {
      success: true,
      message: 'Projet supprimé avec succès',
    }
  } catch (error) {
    console.error('Erreur lors de la suppression du projet:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Une erreur est survenue',
    }
  }
}
