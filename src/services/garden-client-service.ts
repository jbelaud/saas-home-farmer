import {AddGardenClientModel, GardenClientModel} from '@/db/models/farmer-model'
import {
  createGardenClientDao,
  deleteGardenClientDao,
  getActiveClientsCountByOrganizationDao,
  getClientsNeedingVisitDao,
  getClientsWithoutNextVisitDao,
  getGardenClientByIdAndOrganizationDao,
  getGardenClientsByOrganizationDao,
  updateClientNextVisitDateDao,
  updateGardenClientDao,
} from '@/db/repositories/garden-client-repository'
import {getPlanByCodeDao} from '@/db/repositories/subscription-repository'
import {
  getActiveSubscriptions,
  getAuthUser,
} from '@/services/authentication/auth-service'
import {AuthorizationError} from '@/services/errors/authorization-error'
import {ValidationError} from '@/services/errors/validation-error'
import {PaginatedResponse, Pagination} from '@/services/types/common-type'

// ============================================================
// Helpers
// ============================================================

const getActiveOrganizationId = async (): Promise<string> => {
  const user = await getAuthUser()
  const orgId = user?.organizations?.[0]?.organization?.id
  if (!orgId) {
    throw new AuthorizationError('Aucune organisation active')
  }
  return orgId
}

/**
 * Vérifie si le Farmer peut ajouter un nouveau client selon son plan.
 * Lève une ValidationError si la limite est atteinte.
 */
const checkClientLimitOrThrow = async (
  organizationId: string
): Promise<void> => {
  const subscriptions = await getActiveSubscriptions(organizationId)
  const activeSub = subscriptions?.[0] as
    | {plan: string; status: string}
    | undefined

  const planCode = activeSub?.plan ?? 'graine'

  const plan = await getPlanByCodeDao(planCode)
  const limits = plan?.limits as Record<string, number> | null
  const clientLimit = limits?.clients ?? 1

  if (clientLimit === -1) return

  const currentCount =
    await getActiveClientsCountByOrganizationDao(organizationId)

  if (currentCount >= clientLimit) {
    throw new ValidationError(
      `Limite de ${clientLimit} client${clientLimit > 1 ? 's' : ''} atteinte pour votre plan "${plan?.planName ?? planCode}". Passez à un plan supérieur pour ajouter plus de clients.`
    )
  }
}

// ============================================================
// CRUD : garden_client service
// ============================================================

export const createGardenClientService = async (
  data: Omit<AddGardenClientModel, 'organizationId'>
): Promise<GardenClientModel> => {
  const organizationId = await getActiveOrganizationId()
  await checkClientLimitOrThrow(organizationId)
  return createGardenClientDao({...data, organizationId})
}

export const getGardenClientByIdService = async (
  id: string
): Promise<GardenClientModel | undefined> => {
  const organizationId = await getActiveOrganizationId()
  return getGardenClientByIdAndOrganizationDao(id, organizationId)
}

export const getGardenClientsByOrganizationService = async (
  pagination: Pagination,
  search?: string
): Promise<PaginatedResponse<GardenClientModel>> => {
  const organizationId = await getActiveOrganizationId()
  return getGardenClientsByOrganizationDao(organizationId, pagination, search)
}

export const updateGardenClientService = async (
  id: string,
  data: Partial<AddGardenClientModel>
): Promise<void> => {
  const organizationId = await getActiveOrganizationId()
  const existing = await getGardenClientByIdAndOrganizationDao(
    id,
    organizationId
  )
  if (!existing) {
    throw new AuthorizationError('Client introuvable')
  }
  await updateGardenClientDao({
    ...data,
    id,
    organizationId,
    firstName: data.firstName ?? existing.firstName,
    lastName: data.lastName ?? existing.lastName,
    addressStreet: data.addressStreet ?? existing.addressStreet,
    addressCity: data.addressCity ?? existing.addressCity,
    addressZip: data.addressZip ?? existing.addressZip,
  })
}

export const deleteGardenClientService = async (id: string): Promise<void> => {
  const organizationId = await getActiveOrganizationId()
  const existing = await getGardenClientByIdAndOrganizationDao(
    id,
    organizationId
  )
  if (!existing) {
    throw new AuthorizationError('Client introuvable')
  }
  await deleteGardenClientDao(id)
}

export const getActiveClientsCountService = async (): Promise<number> => {
  const organizationId = await getActiveOrganizationId()
  return getActiveClientsCountByOrganizationDao(organizationId)
}

export const getClientsNeedingVisitService = async (withinDays: number = 7) => {
  const organizationId = await getActiveOrganizationId()
  return getClientsNeedingVisitDao(organizationId, withinDays)
}

export const getClientsWithoutNextVisitService = async () => {
  const organizationId = await getActiveOrganizationId()
  return getClientsWithoutNextVisitDao(organizationId)
}

export const updateClientNextVisitDateService = async (
  clientId: string,
  nextVisitDate: Date
): Promise<void> => {
  const organizationId = await getActiveOrganizationId()
  const existing = await getGardenClientByIdAndOrganizationDao(
    clientId,
    organizationId
  )
  if (!existing) {
    throw new AuthorizationError('Client introuvable')
  }
  await updateClientNextVisitDateDao(clientId, nextVisitDate)
}
