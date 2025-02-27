import {
  createUserDao,
  getPublicUsersWithPaginationDao,
  getUserByEmailDao,
  getUserByIdDao,
  updateUserByUidDao,
} from '@/db/repositories/user-repository'

import {GrantedError} from './errors/granted-error'
import {ParsedError} from './errors/parsed-error'
import {CreateUser, UpdateUser} from './types/domain/user-types'
import {
  baseUserServiceSchema,
  createUserServiceSchema,
  updateUserServiceSchema,
  userUuidSchema,
} from './validation/user-validation'
import {canReadUser, canUpdateUser} from './authorization/user-authorization'
import {DATA_ROWS_PER_PAGE} from '@/lib/constants'

export const createUser = async (userParams: CreateUser) => {
  const parsed = createUserServiceSchema.safeParse(userParams)
  if (!parsed.success) {
    throw new ParsedError(parsed.error.message)
  }
  const userParamsSanitized = parsed.data
  const user = await createUserDao(userParamsSanitized)
  return user
}
export const updateUser = async (userParams: UpdateUser) => {
  const resourceUid = userParams.id
  const granted = await canUpdateUser(resourceUid)

  if (!granted) {
    throw new GrantedError()
  }

  const userBeforeUpdate = await getUserByIdDao(userParams.id)

  if (!userBeforeUpdate) {
    throw new Error('Utilisateur introuvable')
  }

  const parsed = updateUserServiceSchema.safeParse(userParams)
  if (!parsed.success) {
    throw new ParsedError(parsed.error.message)
  }

  const userParamsSanitized = parsed.data
  const updatedUserData = {
    ...userParamsSanitized,
    role: userBeforeUpdate.role,
    visibility: userBeforeUpdate.visibility,
    emailVerified: userBeforeUpdate.emailVerified,
    password: userParamsSanitized.password ?? userBeforeUpdate.password,
  }
  await updateUserByUidDao(updatedUserData, resourceUid)
  return userBeforeUpdate
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

export const getPublicUsersWithPagination = async (page: number) => {
  // turn page into offset & limit data per page
  const offset = (page - 1) * 10
  const limit = DATA_ROWS_PER_PAGE
  const usersPagination = await getPublicUsersWithPaginationDao({limit, offset})

  if (!usersPagination) return

  return {
    ...usersPagination,
    data: usersPagination.data,
  }
}
