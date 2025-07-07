'use server'

import {revalidatePath} from 'next/cache'

import {
  createPlanService,
  deletePlanService,
  softDeletePlanService,
  updatePlanService,
} from '@/services/facades/subscription-service-facade'
import {ActionResponse} from '@/services/types/common-type'
import {
  CreatePlan,
  UpdatePlan,
} from '@/services/types/domain/subscription-types'

export async function createPlanAction(
  planData: CreatePlan
): Promise<ActionResponse> {
  try {
    const newPlan = await createPlanService(planData)
    revalidatePath('/admin/plans')
    return {
      success: true,
      message: 'Plan créé avec succès',
      data: newPlan,
    }
  } catch (error) {
    console.error('Error creating plan:', error)
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Erreur lors de la création du plan',
    }
  }
}

export async function updatePlanAction(
  planData: UpdatePlan
): Promise<ActionResponse> {
  try {
    const updatedPlan = await updatePlanService(planData)
    revalidatePath('/admin/plans')
    return {
      success: true,
      message: 'Plan mis à jour avec succès',
      data: updatedPlan,
    }
  } catch (error) {
    console.error('Error updating plan:', error)
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Erreur lors de la mise à jour du plan',
    }
  }
}

export async function softDeletePlanAction(
  planId: string
): Promise<ActionResponse> {
  try {
    await softDeletePlanService(planId)
    revalidatePath('/admin/plans')
    return {
      success: true,
      message: 'Plan archivé avec succès',
    }
  } catch (error) {
    console.error('Error archiving plan:', error)
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Erreur lors de l'archivage du plan",
    }
  }
}

export async function deletePlanAction(
  planId: string
): Promise<ActionResponse> {
  try {
    await deletePlanService(planId)
    revalidatePath('/admin/plans')
    return {
      success: true,
      message: 'Plan supprimé définitivement',
    }
  } catch (error) {
    console.error('Error deleting plan:', error)
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Erreur lors de la suppression du plan',
    }
  }
}
