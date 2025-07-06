'use server'

import {revalidatePath} from 'next/cache'

import {requireActionAuth} from '@/app/dal/user-dal'
import {
  createProjectService,
  createTaskService,
  deleteProjectService,
  deleteTaskService,
  updateProjectService,
  updateTaskOrderService,
  updateTaskService,
  updateTasksOrderService,
} from '@/services/facades/project-service-facade'
import {TaskStatus} from '@/services/types/domain/project-types'

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

// ===== ACTIONS POUR LES TÂCHES =====

export async function createTaskAction(
  projectId: string,
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

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const status = (formData.get('status') as TaskStatus) || 'todo'
    const organizationId = formData.get('organizationId') as string
    const assignedTo = formData.get('assignedTo') as string

    // Validation basique
    if (!title) {
      return {
        success: false,
        message: 'Le titre de la tâche est requis',
        errors: [{field: 'title', message: 'Le titre est requis'}],
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

    await createTaskService({
      title,
      description: description || undefined,
      status,
      order: 0,
      projectId,
      organizationId,
      createdBy: user.id,
      assignedTo: assignedTo || undefined,
    })

    revalidatePath('/team/[slug]/projects/[id]', 'page')
    return {
      success: true,
      message: 'Tâche créée avec succès',
    }
  } catch (error) {
    console.error('Erreur lors de la création de la tâche:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Une erreur est survenue',
    }
  }
}

export async function updateTaskAction(
  taskId: string,
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

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const status = formData.get('status') as TaskStatus
    const assignedTo = formData.get('assignedTo') as string

    // Validation basique
    if (!title) {
      return {
        success: false,
        message: 'Le titre de la tâche est requis',
        errors: [{field: 'title', message: 'Le titre est requis'}],
      }
    }

    await updateTaskService({
      id: taskId,
      title,
      description: description || undefined,
      status: status || undefined,
      assignedTo: assignedTo || undefined,
    })

    revalidatePath('/team/[slug]/projects/[id]', 'page')
    return {
      success: true,
      message: 'Tâche mise à jour avec succès',
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la tâche:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Une erreur est survenue',
    }
  }
}

export async function deleteTaskAction(taskId: string): Promise<FormState> {
  try {
    await requireActionAuth()

    await deleteTaskService(taskId)

    revalidatePath('/team/[slug]/projects/[id]', 'page')
    return {
      success: true,
      message: 'Tâche supprimée avec succès',
    }
  } catch (error) {
    console.error('Erreur lors de la suppression de la tâche:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Une erreur est survenue',
    }
  }
}

// ===== ACTIONS POUR LE DRAG AND DROP =====

export async function updateTaskOrderAction(
  taskId: string,
  newOrder: number,
  newStatus?: TaskStatus
): Promise<FormState> {
  try {
    await requireActionAuth()

    await updateTaskOrderService(taskId, newOrder, newStatus)

    revalidatePath('/team/[slug]/projects/[id]', 'page')
    return {
      success: true,
      message: 'Ordre des tâches mis à jour',
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'ordre:", error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Une erreur est survenue',
    }
  }
}

export async function updateTasksOrderAction(
  tasksUpdates: Array<{id: string; order: number; status?: TaskStatus}>
): Promise<FormState> {
  try {
    await requireActionAuth()

    await updateTasksOrderService(tasksUpdates)

    // Pas de revalidation - on garde l'état optimiste local
    return {
      success: true,
      message: 'Ordre des tâches mis à jour',
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'ordre:", error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Une erreur est survenue',
    }
  }
}
