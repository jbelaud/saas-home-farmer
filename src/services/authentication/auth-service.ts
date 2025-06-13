import {headers} from 'next/headers'

import {getUserByIdDao} from '@/db/repositories/user-repository'
import {auth} from '@/lib/better-auth/auth'

import {RoleConst} from '../types/domain/auth-types'

export const getAuthUser = async () => {
  const session = await getSessionAuth()
  if (!session?.session?.userId) return
  const user = await getUserByIdDao(session.session.userId)
  return user
}

export const getSessionAuth = async () => {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  })
  return session
}

export const isAuthAdmin = async () => {
  const authUser = await getAuthUser()
  return authUser?.roles?.includes(RoleConst.ADMIN)
}

export const getAuthUserId = async () => {
  const user = await getAuthUser()
  if (!user) return
  return user.id
}
