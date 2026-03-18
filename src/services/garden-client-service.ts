import {AddGardenClientModel, GardenClientModel} from '@/db/models/farmer-model'
import {
  createGardenClientDao,
  deleteGardenClientDao,
  getActiveClientsCountByOrganizationDao,
  getGardenClientByIdAndOrganizationDao,
  getGardenClientsByOrganizationDao,
  updateGardenClientDao,
} from '@/db/repositories/garden-client-repository'
import {getAuthUser} from '@/services/authentication/auth-service'
import {AuthorizationError} from '@/services/errors/authorization-error'
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

// ============================================================
// CRUD : garden_client service
// ============================================================

export const createGardenClientService = async (
  data: Omit<AddGardenClientModel, 'organizationId'>
): Promise<GardenClientModel> => {
  const organizationId = await getActiveOrganizationId()
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
  await updateGardenClientDao({...data, id})
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
