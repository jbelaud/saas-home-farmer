import {getAuthUser, isAuthAdmin} from '../authentication/auth-utils'

export const canReadUser = async (resourceUid: string) => {
  const authUser = await getAuthUser()
  if ((await isAuthAdmin()) || authUser?.user?.id === resourceUid) return true
  return false
}

export const canUpdateUser = async (resourceUid: string) => {
  const authUser = await getAuthUser()
  if ((await isAuthAdmin()) || authUser?.user?.id === resourceUid) return true
  return false
}
