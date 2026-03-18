import {
  AddInterventionModel,
  InterventionModel,
  InterventionStatusEnumModel,
} from '@/db/models/farmer-model'
import {
  createInterventionDao,
  deleteInterventionDao,
  getInterventionByIdAndOrganizationDao,
  getInterventionsByDateRangeDao,
  getInterventionsByGardenClientDao,
  getInterventionsByOrganizationDao,
  getInterventionsByStatusDao,
  getInterventionsCountByOrganizationDao,
  updateInterventionDao,
  updateInterventionStatusDao,
} from '@/db/repositories/intervention-repository'
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
// CRUD : intervention service
// ============================================================

export const createInterventionService = async (
  data: Omit<AddInterventionModel, 'organizationId'>
): Promise<InterventionModel> => {
  const organizationId = await getActiveOrganizationId()
  return createInterventionDao({...data, organizationId})
}

export const getInterventionByIdService = async (
  id: string
): Promise<InterventionModel | undefined> => {
  const organizationId = await getActiveOrganizationId()
  return getInterventionByIdAndOrganizationDao(id, organizationId)
}

export const getInterventionsByOrganizationService = async (
  pagination: Pagination
): Promise<PaginatedResponse<InterventionModel>> => {
  const organizationId = await getActiveOrganizationId()
  return getInterventionsByOrganizationDao(organizationId, pagination)
}

export const getInterventionsByClientService = async (
  gardenClientId: string,
  pagination: Pagination
): Promise<PaginatedResponse<InterventionModel>> => {
  const organizationId = await getActiveOrganizationId()
  return getInterventionsByGardenClientDao(
    gardenClientId,
    organizationId,
    pagination
  )
}

export const getInterventionsByDateRangeService = async (
  startDate: Date,
  endDate: Date
): Promise<InterventionModel[]> => {
  const organizationId = await getActiveOrganizationId()
  return getInterventionsByDateRangeDao(organizationId, startDate, endDate)
}

export const getScheduledInterventionsService = async (): Promise<
  InterventionModel[]
> => {
  const organizationId = await getActiveOrganizationId()
  return getInterventionsByStatusDao(organizationId, 'scheduled')
}

export const updateInterventionService = async (
  id: string,
  data: Partial<AddInterventionModel>
): Promise<void> => {
  const organizationId = await getActiveOrganizationId()
  const existing = await getInterventionByIdAndOrganizationDao(
    id,
    organizationId
  )
  if (!existing) {
    throw new AuthorizationError('Intervention introuvable')
  }
  await updateInterventionDao({...data, id})
}

export const updateInterventionStatusService = async (
  id: string,
  status: InterventionStatusEnumModel
): Promise<void> => {
  const organizationId = await getActiveOrganizationId()
  const existing = await getInterventionByIdAndOrganizationDao(
    id,
    organizationId
  )
  if (!existing) {
    throw new AuthorizationError('Intervention introuvable')
  }
  await updateInterventionStatusDao(id, status)
}

export const deleteInterventionService = async (id: string): Promise<void> => {
  const organizationId = await getActiveOrganizationId()
  const existing = await getInterventionByIdAndOrganizationDao(
    id,
    organizationId
  )
  if (!existing) {
    throw new AuthorizationError('Intervention introuvable')
  }
  await deleteInterventionDao(id)
}

export const getInterventionsCountService = async (): Promise<number> => {
  const organizationId = await getActiveOrganizationId()
  return getInterventionsCountByOrganizationDao(organizationId)
}
