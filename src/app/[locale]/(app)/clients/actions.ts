'use server'

import {revalidatePath} from 'next/cache'
import {z} from 'zod'

import {requireActionAuth} from '@/app/dal/user-dal'
import {
  createGardenClientService,
  deleteGardenClientService,
  updateGardenClientService,
} from '@/services/facades/garden-client-service-facade'

// ============================================================
// Validation schemas
// ============================================================

const gardenClientSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  addressStreet: z.string().min(1, "L'adresse est requise"),
  addressCity: z.string().min(1, 'La ville est requise'),
  addressZip: z.string().min(1, 'Le code postal est requis'),
  surfaceSqm: z.coerce.number().positive().optional().or(z.literal(0)),
  exposure: z
    .enum(['full_sun', 'partial_shade', 'full_shade'])
    .optional()
    .or(z.literal('')),
  soilType: z
    .enum(['clay', 'sandy', 'loamy', 'chalky', 'peaty', 'silty'])
    .optional()
    .or(z.literal('')),
  hasWaterAccess: z.coerce.boolean().optional(),
  waterAccessNotes: z.string().optional().or(z.literal('')),
  accessDigicode: z.string().optional().or(z.literal('')),
  accessPortalCode: z.string().optional().or(z.literal('')),
  accessKeyLocation: z.string().optional().or(z.literal('')),
  accessNotes: z.string().optional().or(z.literal('')),
  hasTaxAdvantage: z.coerce.boolean().optional(),
})

// ============================================================
// Types
// ============================================================

export type ClientFormState = {
  success: boolean
  message?: string
  errors?: {field: string; message: string}[]
}

// ============================================================
// Actions
// ============================================================

export async function createGardenClientAction(
  _prev: ClientFormState,
  formData: FormData
): Promise<ClientFormState> {
  try {
    await requireActionAuth()

    const raw = Object.fromEntries(formData.entries())
    const parsed = gardenClientSchema.safeParse(raw)

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

    await createGardenClientService({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email || null,
      phone: data.phone || null,
      addressStreet: data.addressStreet,
      addressCity: data.addressCity,
      addressZip: data.addressZip,
      surfaceSqm: data.surfaceSqm || null,
      exposure: data.exposure && data.exposure !== '' ? data.exposure : null,
      soilType: data.soilType && data.soilType !== '' ? data.soilType : null,
      hasWaterAccess: data.hasWaterAccess ?? false,
      waterAccessNotes: data.waterAccessNotes || null,
      accessDigicode: data.accessDigicode || null,
      accessPortalCode: data.accessPortalCode || null,
      accessKeyLocation: data.accessKeyLocation || null,
      accessNotes: data.accessNotes || null,
      hasTaxAdvantage: data.hasTaxAdvantage ?? false,
    })

    revalidatePath('/clients')
    return {success: true, message: 'Client créé avec succès'}
  } catch (error) {
    console.error('createGardenClientAction error:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Une erreur est survenue',
    }
  }
}

export async function updateGardenClientAction(
  clientId: string,
  _prev: ClientFormState,
  formData: FormData
): Promise<ClientFormState> {
  try {
    await requireActionAuth()

    const raw = Object.fromEntries(formData.entries())
    const parsed = gardenClientSchema.safeParse(raw)

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

    await updateGardenClientService(clientId, {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email || null,
      phone: data.phone || null,
      addressStreet: data.addressStreet,
      addressCity: data.addressCity,
      addressZip: data.addressZip,
      surfaceSqm: data.surfaceSqm || null,
      exposure: data.exposure && data.exposure !== '' ? data.exposure : null,
      soilType: data.soilType && data.soilType !== '' ? data.soilType : null,
      hasWaterAccess: data.hasWaterAccess ?? false,
      waterAccessNotes: data.waterAccessNotes || null,
      accessDigicode: data.accessDigicode || null,
      accessPortalCode: data.accessPortalCode || null,
      accessKeyLocation: data.accessKeyLocation || null,
      accessNotes: data.accessNotes || null,
      hasTaxAdvantage: data.hasTaxAdvantage ?? false,
    })

    revalidatePath('/clients')
    return {success: true, message: 'Client mis à jour avec succès'}
  } catch (error) {
    console.error('updateGardenClientAction error:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Une erreur est survenue',
    }
  }
}

export async function deleteGardenClientAction(
  clientId: string
): Promise<ClientFormState> {
  try {
    await requireActionAuth()
    await deleteGardenClientService(clientId)
    revalidatePath('/clients')
    return {success: true, message: 'Client supprimé'}
  } catch (error) {
    console.error('deleteGardenClientAction error:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Une erreur est survenue',
    }
  }
}
