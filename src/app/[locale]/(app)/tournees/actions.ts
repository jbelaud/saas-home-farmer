'use server'

import {revalidatePath} from 'next/cache'
import {z} from 'zod'

import {requireActionAuth} from '@/app/dal/user-dal'
import {updateClientNextVisitDateService} from '@/services/facades/garden-client-service-facade'
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
  durationMinutes: z.preprocess(
    (val) => (val === '' || val === undefined ? undefined : Number(val)),
    z.number().nonnegative().optional()
  ),
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
      console.error(
        'createInterventionAction validation errors:',
        parsed.error.issues
      )
      const errors = parsed.error.issues.map((i) => ({
        field: String(i.path[0]),
        message: i.message,
      }))
      const fieldMessages = errors
        .map((e) => `${e.field}: ${e.message}`)
        .join(', ')
      return {
        success: false,
        message: `Données invalides — ${fieldMessages}`,
        errors,
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

// ============================================================
// Rapport de visite — compléter une intervention
// ============================================================

const completeInterventionSchema = z.object({
  proNotes: z.string().optional().or(z.literal('')),
  nextVisitDate: z.string().min(1, 'La date du prochain passage est requise'),
  durationMinutes: z.coerce.number().positive().optional().or(z.literal(0)),
})

export async function completeInterventionAction(
  interventionId: string,
  gardenClientId: string,
  _prev: InterventionFormState,
  formData: FormData
): Promise<InterventionFormState> {
  try {
    await requireActionAuth()

    const raw = Object.fromEntries(formData.entries())
    const parsed = completeInterventionSchema.safeParse(raw)

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
      proNotes: data.proNotes || null,
      durationMinutes: data.durationMinutes || null,
    })

    await updateInterventionStatusService(interventionId, 'completed')

    await updateClientNextVisitDateService(
      gardenClientId,
      new Date(data.nextVisitDate)
    )

    revalidatePath('/tournees')
    revalidatePath('/dashboard')
    return {success: true, message: 'Visite terminée !'}
  } catch (error) {
    console.error('completeInterventionAction error:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Une erreur est survenue',
    }
  }
}
