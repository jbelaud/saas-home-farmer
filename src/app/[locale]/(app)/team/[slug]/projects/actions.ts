'use server'

import {revalidatePath} from 'next/cache'

import {requireActionAuth} from '@/app/dal/user-dal'
import {
  createProjectService,
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
    const organizationId = formData.get('organizationId') as string

    // Validation basique
    if (!name) {
      return {
        success: false,
        message: 'Le nom du projet est requis',
        errors: [{field: 'name', message: 'Le nom est requis'}],
      }
    }

    if (!organizationId) {
      return {
        success: false,
        message: "L'organisation est requise",
        errors: [
          {field: 'organizationId', message: "L'organisation est requise"},
        ],
      }
    }

    await updateProjectService({
      id,
      name,
      description: description || undefined,
    })

    // Revalider le chemin spécifique à l'organisation
    revalidatePath('/team/[slug]/projects', 'page')
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

    // Revalider le chemin spécifique à l'organisation
    revalidatePath('/team/[slug]/projects', 'page')
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

export async function createProjectAction(
  prevState?: FormState,
  formData?: FormData
): Promise<FormState> {
  try {
    const user = await requireActionAuth()

    if (!formData) {
      return {
        success: false,
        message: 'Données invalides',
      }
    }

    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const organizationId = formData.get('organizationId') as string

    // Validation basique
    if (!name) {
      return {
        success: false,
        message: 'Le nom du projet est requis',
        errors: [{field: 'name', message: 'Le nom est requis'}],
      }
    }

    if (!organizationId) {
      return {
        success: false,
        message: "L'organisation est requise",
        errors: [
          {field: 'organizationId', message: "L'organisation est requise"},
        ],
      }
    }

    await createProjectService({
      name,
      description: description || undefined,
      organizationId,
      createdBy: user.id,
    })

    // Revalider le chemin spécifique à l'organisation
    revalidatePath('/team/[slug]/projects', 'page')
    return {
      success: true,
      message: 'Projet créé avec succès',
    }
  } catch (error) {
    console.error('Erreur lors de la création du projet:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Une erreur est survenue',
    }
  }
}
