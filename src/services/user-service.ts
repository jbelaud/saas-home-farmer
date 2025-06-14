import {generateUniqueSlug} from '@/db/repositories/organization-repository'
import {
  createUserAndOrganizationTxnDao,
  createUserDao,
  createUserRoleAndOrganizationTxnDao,
  getAllUsersWithPaginationDao,
  getUserByEmailDao,
  getUserByIdDao,
  isEmailExistsDao,
  searchUsersDao,
  updateUserSafeByUidDao,
} from '@/db/repositories/user-repository'
import {hashPassword} from '@/lib/crypto'

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

/**
 * Crée un utilisateur et une organisation
 * @deprecated Utiliser createUserRoleAndOrganizationTxnDao
 * @param userParams
 * @returns
 */
export const createUserOrganizationService = async (userParams: CreateUser) => {
  const parsed = createUserServiceSchema.safeParse(userParams)
  if (!parsed.success) {
    throw new ValidationParsedZodError(parsed.error)
  }
  const userParamsSanitized = parsed.data

  // Hasher le mot de passe avant de créer l'utilisateur
  const hashedPassword = await hashPassword(userParamsSanitized.password ?? '')
  userParamsSanitized.password = hashedPassword

  const slug = await generateUniqueSlug(userParamsSanitized.email.split('@')[0])

  // Créer les données de l'organisation basées sur l'email de l'utilisateur
  const organizationData: CreateOrganization = {
    name: `${userParamsSanitized.name} organization`,
    slug,
    description: `Organization for ${userParamsSanitized.email}`,
  }

  // Utiliser la fonction transactionnelle
  const result = await createUserAndOrganizationTxnDao(
    userParamsSanitized,
    organizationData
  )

  return result
}

export const createOrganizationForUserService = async (email: string) => {
  if (!email) {
    throw new ValidationError('Email is required')
  }
  const user = await getUserByEmailDao(email)
  if (!user) {
    throw new ValidationError('User not found')
  }
  const slug = await generateUniqueSlug(email.split('@')[0])

  // Créer les données de l'organisation basées sur l'email de l'utilisateur
  const organizationData: CreateOrganization = {
    name: `${user.name} organization`,
    slug,
    description: `Organization for ${user.email}`,
  }

  // Utiliser la fonction transactionnelle avec l'utilisateur existant
  const result = await createUserRoleAndOrganizationTxnDao(
    user.id,
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

/**
 * Vérifie si un email est disponible pour l'inscription
 */
export const isEmailAvailableService = async (
  email: string
): Promise<boolean> => {
  const exists = await isEmailExistsDao(email)
  return !exists
}
