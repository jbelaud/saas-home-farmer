import {
  createOrganizationDao,
  createUserOrganizationDao,
  deleteOrganizationDao,
  deleteUserOrganizationDao,
  getOrganizationByIdDao,
  getOrganizationBySlugDao,
  getOrganizationMembersDao,
  getOrganizationsByUserIdDao,
  getOrganizationsDao,
  getUserOrganizationDao,
  getUserOrganizationsDao,
  getUserRoleInOrganizationDao,
  updateOrganizationDao,
  updateUserOrganizationRoleDao,
} from '@/db/repositories/organization-repository'
import {getAuthUser} from '@/services/authentication/auth-utils'

import {
  canChangeOrganizationMemberRole,
  canCreateOrganization,
  canDeleteOrganization,
  canInviteToOrganization,
  canManageOrganizationMembers,
  canReadOrganization,
  canRemoveFromOrganization,
  canUpdateOrganization,
} from './authorization/organization-authorization'
import {AuthorizationError} from './errors/authorization-error'
import {
  ValidationError,
  ValidationParsedZodError,
} from './errors/validation-error'
import {Pagination} from './types/common-type'
import {UserOrganizationRoleConst} from './types/domain/auth-types'
import {
  CreateOrganization,
  CreateUserOrganization,
  OrganizationRole,
  UpdateOrganization,
} from './types/domain/organization-types'
import {
  createOrganizationServiceSchema,
  createUserOrganizationServiceSchema,
  organizationRoleSchema,
  organizationUuidSchema,
  updateOrganizationServiceSchema,
  userUuidSchema,
} from './validation/organization-validation'

// ===== CRUD ORGANIZATIONS =====

export const createOrganizationService = async (
  organizationParams: CreateOrganization
) => {
  const granted = await canCreateOrganization()
  if (!granted) {
    throw new AuthorizationError()
  }

  const parsed = createOrganizationServiceSchema.safeParse(organizationParams)
  if (!parsed.success) {
    throw new ValidationParsedZodError(parsed.error)
  }
  const organizationParamsSanitized = parsed.data

  // Créer l'organisation
  const organization = await createOrganizationDao(organizationParamsSanitized)

  // Ajouter le créateur comme OWNER
  const authUser = await getAuthUser()
  if (authUser?.id) {
    await createUserOrganizationDao({
      userId: authUser.id,
      organizationId: organization.id,
      role: UserOrganizationRoleConst.OWNER,
    })
  }

  return organization
}

export const getOrganizationByIdService = async (id: string) => {
  const parsed = organizationUuidSchema.safeParse(id)
  if (!parsed.success) {
    throw new ValidationError(parsed.error.message)
  }
  const parsedUuid = parsed.data

  const granted = await canReadOrganization(parsedUuid)
  if (!granted) {
    throw new AuthorizationError()
  }

  return await getOrganizationByIdDao(parsedUuid)
}

export const getOrganizationBySlugService = async (slug: string) => {
  const parsed = createOrganizationServiceSchema
    .pick({slug: true})
    .safeParse({slug})
  if (!parsed.success) {
    throw new ValidationError(parsed.error.message)
  }
  const slugSanitized = parsed.data.slug

  const organization = await getOrganizationBySlugDao(slugSanitized)
  if (!organization) {
    return null
  }

  const granted = await canReadOrganization(organization.id)
  if (!granted) {
    throw new AuthorizationError()
  }

  return organization
}

export const updateOrganizationService = async (
  organizationParams: UpdateOrganization
) => {
  const resourceId = organizationParams.id
  const granted = await canUpdateOrganization(resourceId)
  if (!granted) {
    throw new AuthorizationError()
  }

  organizationParams.updatedAt = new Date()
  const parsed = updateOrganizationServiceSchema.safeParse(organizationParams)
  if (!parsed.success) {
    throw new ValidationError(parsed.error.message)
  }

  const organizationParamsSanitized = parsed.data
  await updateOrganizationDao(organizationParamsSanitized)
}

export const deleteOrganizationService = async (id: string) => {
  const parsed = organizationUuidSchema.safeParse(id)
  if (!parsed.success) {
    throw new ValidationError(parsed.error.message)
  }
  const parsedUuid = parsed.data

  const granted = await canDeleteOrganization(parsedUuid)
  if (!granted) {
    throw new AuthorizationError()
  }

  await deleteOrganizationDao(parsedUuid)
}

export const getOrganizationsService = async (pagination: Pagination) => {
  return await getOrganizationsDao(pagination)
}

// ===== USER ORGANIZATIONS MANAGEMENT =====

export const getUserOrganizationsService = async (userId?: string) => {
  const authUser = await getAuthUser()
  const targetUserId = userId || authUser?.id

  if (!targetUserId) {
    throw new AuthorizationError()
  }

  const parsed = userUuidSchema.safeParse(targetUserId)
  if (!parsed.success) {
    throw new ValidationError(parsed.error.message)
  }
  const parsedUuid = parsed.data

  return await getUserOrganizationsDao(parsedUuid)
}

export const getOrganizationsByUserIdService = async (userId?: string) => {
  const authUser = await getAuthUser()
  const targetUserId = userId || authUser?.id

  if (!targetUserId) {
    throw new AuthorizationError()
  }

  const parsed = userUuidSchema.safeParse(targetUserId)
  if (!parsed.success) {
    throw new ValidationError(parsed.error.message)
  }
  const parsedUuid = parsed.data

  return await getOrganizationsByUserIdDao(parsedUuid)
}

export const getOrganizationMembersService = async (organizationId: string) => {
  const parsed = organizationUuidSchema.safeParse(organizationId)
  if (!parsed.success) {
    throw new ValidationError(parsed.error.message)
  }
  const parsedUuid = parsed.data

  const granted = await canManageOrganizationMembers(parsedUuid)
  if (!granted) {
    throw new AuthorizationError()
  }

  return await getOrganizationMembersDao(parsedUuid)
}

export const inviteUserToOrganizationService = async (
  userOrganizationParams: CreateUserOrganization
) => {
  const parsed = createUserOrganizationServiceSchema.safeParse(
    userOrganizationParams
  )
  if (!parsed.success) {
    throw new ValidationParsedZodError(parsed.error)
  }
  const params = parsed.data

  const granted = await canInviteToOrganization(params.organizationId)
  if (!granted) {
    throw new AuthorizationError()
  }

  // Vérifier si l'utilisateur n'est pas déjà membre
  const existingMembership = await getUserOrganizationDao(
    params.userId,
    params.organizationId
  )
  if (existingMembership) {
    throw new ValidationError(
      "L'utilisateur est déjà membre de cette organisation"
    )
  }

  return await createUserOrganizationDao(params)
}

export const removeUserFromOrganizationService = async (
  userId: string,
  organizationId: string
) => {
  const userParsed = userUuidSchema.safeParse(userId)
  const orgParsed = organizationUuidSchema.safeParse(organizationId)

  if (!userParsed.success) {
    throw new ValidationError(userParsed.error.message)
  }
  if (!orgParsed.success) {
    throw new ValidationError(orgParsed.error.message)
  }

  const userIdSanitized = userParsed.data
  const organizationIdSanitized = orgParsed.data

  const granted = await canRemoveFromOrganization(
    organizationIdSanitized,
    userIdSanitized
  )
  if (!granted) {
    throw new AuthorizationError()
  }

  await deleteUserOrganizationDao(userIdSanitized, organizationIdSanitized)
}

export const changeUserOrganizationRoleService = async (
  userId: string,
  organizationId: string,
  role: OrganizationRole
) => {
  const userParsed = userUuidSchema.safeParse(userId)
  const orgParsed = organizationUuidSchema.safeParse(organizationId)
  const roleParsed = organizationRoleSchema.safeParse(role)

  if (!userParsed.success) {
    throw new ValidationError(userParsed.error.message)
  }
  if (!orgParsed.success) {
    throw new ValidationError(orgParsed.error.message)
  }
  if (!roleParsed.success) {
    throw new ValidationError(roleParsed.error.message)
  }

  const userIdSanitized = userParsed.data
  const organizationIdSanitized = orgParsed.data
  const roleSanitized = roleParsed.data

  const granted = await canChangeOrganizationMemberRole(
    organizationIdSanitized,
    userIdSanitized
  )
  if (!granted) {
    throw new AuthorizationError()
  }

  await updateUserOrganizationRoleDao(
    userIdSanitized,
    organizationIdSanitized,
    roleSanitized
  )
}

export const getUserRoleInOrganizationService = async (
  userId: string,
  organizationId: string
) => {
  const userParsed = userUuidSchema.safeParse(userId)
  const orgParsed = organizationUuidSchema.safeParse(organizationId)

  if (!userParsed.success) {
    throw new ValidationError(userParsed.error.message)
  }
  if (!orgParsed.success) {
    throw new ValidationError(orgParsed.error.message)
  }

  const userIdSanitized = userParsed.data
  const organizationIdSanitized = orgParsed.data

  const granted = await canReadOrganization(organizationIdSanitized)
  if (!granted) {
    throw new AuthorizationError()
  }

  return await getUserRoleInOrganizationDao(
    userIdSanitized,
    organizationIdSanitized
  )
}
