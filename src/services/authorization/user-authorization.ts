import {getUserByIdDao} from '@/db/repositories/user-repository'
import {getAuthUser} from '@/services/authentication/auth-utils'

import {ROLE_ADMIN} from '../types/domain/auth-types'

export const canReadUser = async (resourceUid: string) => {
  const authUser = await getAuthUser()
  const user = await getUserByIdDao(resourceUid)
  if (
    (await isAdmin()) ||
    authUser?.id === resourceUid ||
    user?.visibility === 'public'
  )
    return true
  return false
}

export const canUpdateUser = async (resourceUid: string) => {
  const authUser = await getAuthUser()
  if ((await isAdmin()) || authUser?.id === resourceUid) return true
  return false
}

const isAdmin = async () => {
  const authUser = await getAuthUser()
  return authUser?.roles?.includes(ROLE_ADMIN)
}
