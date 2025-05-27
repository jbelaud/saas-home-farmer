import {
  createUserDao,
  getPublicUsersWithPaginationDao,
  getUserByEmailDao,
  getUserByIdDao,
  updateUserByUidDao,
  updateUserSafeByUidDao,
} from '@/db/repositories/user-repository'

import {GrantedError} from './errors/granted-error'
import {ParsedError, ParsedZodError} from './errors/parsed-error'
import {CreateUser, UpdateUser} from './types/domain/user-types'
import {
  baseUserServiceSchema,
  createUserServiceSchema,
  updateUserServiceSchema,
  userUuidSchema,
} from './validation/user-validation'
import {canReadUser, canUpdateUser} from './authorization/user-authorization'
import {AuthorizationError} from './errors/errors'

export const createUser = async (userParams: CreateUser) => {
  const parsed = createUserServiceSchema.safeParse(userParams)
  if (!parsed.success) {
    throw new ParsedZodError(parsed.error)
  }
  const userParamsSanitized = parsed.data
  const user = await createUserDao(userParamsSanitized)
  return user
}

export const getUserById = async (id: string) => {
  const parsed = userUuidSchema.safeParse(id)
  if (!parsed.success) {
    throw new ParsedError(parsed.error.message)
  }
  const parsedUuid = parsed.data
  const granted = await canReadUser(parsedUuid)

  if (!granted) {
    throw new GrantedError()
  }
  return await getUserByIdDao(parsedUuid)
}

export const getUserByEmail = async (email: string) => {
  const parsed = baseUserServiceSchema.safeParse({email})
  if (!parsed.success) {
    throw new ParsedError(parsed.error.message)
  }
  const emailParamsSanitized = parsed.data.email
  return await getUserByEmailDao(emailParamsSanitized)
}

export const updateUserService = async (
  userId: string,
  userParams: UpdateUser
) => {
  const resourceUid = userParams.id
  const granted = await canUpdateUser(resourceUid)

  if (!granted) {
    throw new AuthorizationError()
  }
  userParams.updatedAt = new Date()
  const parsed = updateUserServiceSchema.safeParse(userParams)
  if (!parsed.success) {
    throw new ParsedError(parsed.error.message)
  }

  const userParamsSanitized = parsed.data

  await updateUserSafeByUidDao(userParamsSanitized, resourceUid)
}
