'use server'

import {revalidatePath} from 'next/cache'
import {z} from 'zod'

import {requireActionAuth} from '@/app/dal/user-dal'
import {
  createInterventionService,
  deleteInterventionService,
  updateInterventionService,
  updateInterventionStatusService,
} from '@/services/facades/intervention-service-facade'

// ============================================================
// Validation schemas
// ============================================================

const interventionSchema = z.object({
  gardenClientId: z.string().min(1, 'Le client est requis'),
  scheduledDate: z.string().min(1, 'La date est requise'),
  durationMinutes: z.coerce.number().positive().optional().or(z.literal(0)),
  type: z.enum([
    'maintenance',
    'plantation',
    'setup',
    'harvest_support',
    'consultation',
  ]),
  proNotes: z.string().optional().or(z.literal('')),
})

// ============================================================
// Types
// ============================================================

export type InterventionFormState = {
  success: boolean
  message?: string
  errors?: {field: string; message: string}[]
}

// ============================================================
// Actions
// ============================================================

export async function createInterventionAction(
  _prev: InterventionFormState,
  formData: FormData
): Promise<InterventionFormState> {
  try {
    await requireActionAuth()

    const raw = Object.fromEntries(formData.entries())
    const parsed = interventionSchema.safeParse(raw)

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

    const data = parsed.data

    await createInterventionService({
      gardenClientId: data.gardenClientId,
      scheduledDate: new Date(data.scheduledDate),
      durationMinutes: data.durationMinutes || null,
      type: data.type,
      proNotes: data.proNotes || null,
      status: 'scheduled',
    })

    revalidatePath('/tournees')
    return {success: true, message: 'Intervention planifiée'}
  } catch (error) {
    console.error('createInterventionAction error:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Une erreur est survenue',
    }
  }
}

export async function updateInterventionAction(
  interventionId: string,
  _prev: InterventionFormState,
  formData: FormData
): Promise<InterventionFormState> {
  try {
    await requireActionAuth()

    const raw = Object.fromEntries(formData.entries())
    const parsed = interventionSchema.safeParse(raw)

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

    const data = parsed.data

    await updateInterventionService(interventionId, {
      gardenClientId: data.gardenClientId,
      scheduledDate: new Date(data.scheduledDate),
      durationMinutes: data.durationMinutes || null,
      type: data.type,
      proNotes: data.proNotes || null,
    })

    revalidatePath('/tournees')
    return {success: true, message: 'Intervention mise à jour'}
  } catch (error) {
    console.error('updateInterventionAction error:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Une erreur est survenue',
    }
  }
}

export async function updateInterventionStatusAction(
  interventionId: string,
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
): Promise<InterventionFormState> {
  try {
    await requireActionAuth()
    await updateInterventionStatusService(interventionId, status)
    revalidatePath('/tournees')
    return {success: true, message: 'Statut mis à jour'}
  } catch (error) {
    console.error('updateInterventionStatusAction error:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Une erreur est survenue',
    }
  }
}

export async function deleteInterventionAction(
  interventionId: string
): Promise<InterventionFormState> {
  try {
    await requireActionAuth()
    await deleteInterventionService(interventionId)
    revalidatePath('/tournees')
    return {success: true, message: 'Intervention supprimée'}
  } catch (error) {
    console.error('deleteInterventionAction error:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Une erreur est survenue',
    }
  }
}
