'use server'

import {revalidatePath} from 'next/cache'

import {MARKET_PRICES} from '@/lib/constants/market-prices'
import {addHarvestFromPortalService} from '@/services/facades/client-portal-service-facade'

// ============================================================
// Types
// ============================================================

export type AddHarvestState = {
  success: boolean
  message?: string
  errors?: {field: string; message: string}[]
}

// ============================================================
// Action : ajouter une récolte
// ============================================================

export async function addHarvestAction(
  token: string,
  locale: string,
  _prevState: AddHarvestState,
  formData: FormData
): Promise<AddHarvestState> {
  const cropName = formData.get('cropName')?.toString()?.trim()
  const weightKgRaw = formData.get('weightKg')?.toString()
  const harvestDateRaw = formData.get('harvestDate')?.toString()

  // Validation
  const errors: {field: string; message: string}[] = []

  if (!cropName) {
    errors.push({field: 'cropName', message: 'Choisissez un légume'})
  }
  if (!weightKgRaw || isNaN(Number(weightKgRaw)) || Number(weightKgRaw) <= 0) {
    errors.push({field: 'weightKg', message: 'Poids invalide'})
  }
  if (!harvestDateRaw) {
    errors.push({field: 'harvestDate', message: 'Date requise'})
  }

  if (errors.length > 0) {
    return {success: false, message: 'Données invalides', errors}
  }

  const validCropName = cropName ?? ''
  const weightKg = Number(weightKgRaw)
  const harvestDate = new Date(harvestDateRaw ?? '')
  const marketPricePerKg = MARKET_PRICES[validCropName] ?? 5.0

  try {
    await addHarvestFromPortalService(token, {
      cropName: validCropName,
      weightKg,
      marketPricePerKg,
      harvestDate,
    })

    revalidatePath(`/${locale}/client-portal/${token}`)
    revalidatePath(`/${locale}/client-portal/${token}/harvests`)

    return {
      success: true,
      message: `${cropName} ajouté ! (${(weightKg * marketPricePerKg).toFixed(2)} €)`,
    }
  } catch {
    return {
      success: false,
      message: "Erreur lors de l'ajout de la récolte",
    }
  }
}
