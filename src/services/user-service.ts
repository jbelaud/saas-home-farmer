import {
  createUserAndOrganizationTxnDao,
  createUserDao,
  getAllUsersWithPaginationDao,
  getUserByEmailDao,
  getUserByIdDao,
  searchUsersDao,
  updateUserSafeByUidDao,
} from '@/db/repositories/user-repository'

import {
  canManageUsers,
  canReadUser,
  canUpdateUser,
} from './authorization/user-authorization'
import {AuthorizationError} from './errors/authorization-error'
import {
  ValidationError,
  ValidationParsedZodError,
} from './errors/validation-error'
import {Pagination} from './types/common-type'
import {CreateOrganization} from './types/domain/organization-types'
import {CreateUser, UpdateUser} from './types/domain/user-types'
import {
  baseUserServiceSchema,
  createUserServiceSchema,
  updateUserServiceSchema,
  userUuidSchema,
} from './validation/user-validation'

export const createUserService = async (userParams: CreateUser) => {
  const parsed = createUserServiceSchema.safeParse(userParams)
  if (!parsed.success) {
    throw new ValidationParsedZodError(parsed.error)
  }
  const userParamsSanitized = parsed.data
  const user = await createUserDao(userParamsSanitized)
  return user
}

export const getUserByIdService = async (id: string) => {
  const parsed = userUuidSchema.safeParse(id)
  if (!parsed.success) {
    throw new ValidationError(parsed.error.message)
  }
  const parsedUuid = parsed.data
  const granted = await canReadUser(parsedUuid)

  if (!granted) {
    throw new AuthorizationError()
  }
  return await getUserByIdDao(parsedUuid)
}

export const getUserByEmailService = async (email: string) => {
  const parsed = baseUserServiceSchema.safeParse({email})
  if (!parsed.success) {
    throw new ValidationError(parsed.error.message)
  }
  const emailParamsSanitized = parsed.data.email
  return await getUserByEmailDao(emailParamsSanitized)
}

export const updateUserService = async (userParams: UpdateUser) => {
  const resourceUid = userParams.id
  const granted = await canUpdateUser(resourceUid)

  if (!granted) {
    throw new AuthorizationError()
  }
  userParams.updatedAt = new Date()
  const parsed = updateUserServiceSchema.safeParse(userParams)
  if (!parsed.success) {
    throw new ValidationError(parsed.error.message)
  }

  const userParamsSanitized = parsed.data

  await updateUserSafeByUidDao(userParamsSanitized, resourceUid)
}

export const createUserOrganizationService = async (userParams: CreateUser) => {
  const parsed = createUserServiceSchema.safeParse(userParams)
  if (!parsed.success) {
    throw new ValidationParsedZodError(parsed.error)
  }
  const userParamsSanitized = parsed.data

  // Créer les données de l'organisation basées sur l'email de l'utilisateur
  const organizationData: CreateOrganization = {
    name: `${userParamsSanitized.email} organization`,
    slug: userParamsSanitized.email.split('@')[0],
    description: `Organization for ${userParamsSanitized.email}`,
  }

  // Utiliser la fonction transactionnelle
  const result = await createUserAndOrganizationTxnDao(
    userParamsSanitized,
    organizationData
  )

  return result
}

/**
 * Recherche des utilisateurs par nom ou email (LIKE/ILIKE),
 * possibilité d'exclure ceux déjà membres d'une organisation.
 */
export const searchUsersService = async (
  query: string,
  excludeOrganizationId?: string
) => {
  if (!query || query.trim().length < 2) {
    throw new ValidationError(
      'Le terme de recherche doit contenir au moins 2 caractères.'
    )
  }
  // Optionnel : on pourrait ajouter une vérification d'autorisation ici
  return await searchUsersDao(query.trim(), excludeOrganizationId)
}

/**
 * Récupère tous les utilisateurs avec pagination pour l'administration
 * Requiert des permissions d'administrateur
 */
export const getAllUsersWithPaginationService = async (
  pagination: Pagination,
  search?: string
) => {
  const granted = await canManageUsers()
  if (!granted) {
    throw new AuthorizationError()
  }

  return await getAllUsersWithPaginationDao(pagination, search)
}
