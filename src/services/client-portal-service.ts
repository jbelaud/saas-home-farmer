import {GardenClientModel, HarvestModel} from '@/db/models/farmer-model'
import {getGardenClientByAccessTokenDao} from '@/db/repositories/garden-client-repository'
import {
  createHarvestDao,
  getHarvestsByGardenClientDao,
  getHarvestStatsByClientDao,
} from '@/db/repositories/harvest-repository'
import {
  getInterventionsByGardenClientDao,
  getLastCompletedInterventionByClientDao,
} from '@/db/repositories/intervention-repository'
import {PaginatedResponse, Pagination} from '@/services/types/common-type'

// ============================================================
// Client Portal Service
// Pas d'auth Better Auth — validation par accessToken uniquement
// ============================================================

export const getClientByAccessTokenService = async (
  accessToken: string
): Promise<GardenClientModel | null> => {
  const client = await getGardenClientByAccessTokenDao(accessToken)
  return client ?? null
}

export const getClientPortalDashboardService = async (accessToken: string) => {
  const client = await getGardenClientByAccessTokenDao(accessToken)
  if (!client) {
    throw new Error('Client introuvable ou inactif')
  }

  const [harvestStats, lastIntervention, recentHarvests] = await Promise.all([
    getHarvestStatsByClientDao(client.id, client.organizationId),
    getLastCompletedInterventionByClientDao(client.id, client.organizationId),
    getHarvestsByGardenClientDao(client.id, client.organizationId, {
      limit: 5,
      offset: 0,
    }),
  ])

  return {
    client,
    harvestStats,
    lastIntervention,
    recentHarvests: recentHarvests.data,
  }
}

export const getClientHarvestsService = async (
  accessToken: string,
  pagination: Pagination
): Promise<PaginatedResponse<HarvestModel>> => {
  const client = await getGardenClientByAccessTokenDao(accessToken)
  if (!client) {
    throw new Error('Client introuvable ou inactif')
  }
  return getHarvestsByGardenClientDao(
    client.id,
    client.organizationId,
    pagination
  )
}

export const addHarvestFromPortalService = async (
  accessToken: string,
  data: {
    cropName: string
    weightKg: number
    marketPricePerKg: number
    harvestDate: Date
  }
): Promise<HarvestModel> => {
  const client = await getGardenClientByAccessTokenDao(accessToken)
  if (!client) {
    throw new Error('Client introuvable ou inactif')
  }

  const calculatedValueEur = (data.weightKg * data.marketPricePerKg).toFixed(2)

  return createHarvestDao({
    organizationId: client.organizationId,
    gardenClientId: client.id,
    harvestDate: data.harvestDate,
    cropName: data.cropName,
    weightKg: data.weightKg,
    marketPricePerKg: data.marketPricePerKg.toFixed(4),
    calculatedValueEur,
  })
}

export const getClientInterventionsService = async (
  accessToken: string,
  pagination: Pagination
) => {
  const client = await getGardenClientByAccessTokenDao(accessToken)
  if (!client) {
    throw new Error('Client introuvable ou inactif')
  }
  return getInterventionsByGardenClientDao(
    client.id,
    client.organizationId,
    pagination
  )
}
