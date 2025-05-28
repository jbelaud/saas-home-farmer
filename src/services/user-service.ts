import {
  createUserDao,
  getUserByEmailDao,
  getUserByIdDao,
  updateUserSafeByUidDao,
} from '@/db/repositories/user-repository'

import {canReadUser, canUpdateUser} from './authorization/user-authorization'
import {AuthorizationError} from './errors/authorization-error'
import {
  ValidationError,
  ValidationParsedZodError,
} from './errors/validation-error'
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
