import type {Session} from 'next-auth'

import {getUserByEmailDao} from '@/db/repositories/user-repository'
import {auth} from '@/lib/auth'

import {User, UserRoles} from '../types/domain/user-types'
export type AuthUser = {
  session?: Session
  user?: User
  role: UserRoles
}

export const getSessionAuth = async () => {
  const session = await auth()
  return session
}

export const isAuthAdmin = async () => {
  const authUser = await getAuthUser()
  console.log('isAuthAdmin authUser', authUser)
  return authUser?.role === 'admin'
}

export const getAuthUser = async () => {
  const session = await auth()
  if (!session?.user?.email) return
  const email = session?.user?.email ?? ''
  const user = await getUserByEmailDao(email)
  return user
}

export const getAuthUserId = async () => {
  const user = await getAuthUser()
  if (!user) return
  return user.id
}

export const roleHierarchy = ['public', 'user', 'admin']

export function hasRequiredRole(
  userConnected?: User,
  requestedRole?: UserRoles
) {
  if (!userConnected || !requestedRole) {
    return false
  }
  // Définir l'ordre des privilèges

  const useRole = userConnected?.role ?? 'public'
  const userRoleIndex = roleHierarchy.indexOf(useRole as UserRoles)
  const requestedRoleIndex = roleHierarchy.indexOf(requestedRole)
  if (requestedRoleIndex === -1 || userRoleIndex === -1) {
    return false
  }
  //console.log('hasRequiredRole', useRole, requestedRole)
  if (userRoleIndex >= requestedRoleIndex) {
    return true
  }
  return false
}
