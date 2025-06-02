import {getUserByEmailDao} from '@/db/repositories/user-repository'
import {auth} from '@/lib/auth'

import {roleHierarchy} from '../types/domain/auth-types'
import {Roles, User} from '../types/domain/user-types'

export const getAuthUser = async () => {
  const session = await auth()
  if (!session?.user?.email) return
  const email = session?.user?.email ?? ''
  const user = await getUserByEmailDao(email)
  return user
}

export const getSessionAuth = async () => {
  const session = await auth()
  return session
}

export const isAuthAdmin = async () => {
  const authUser = await getAuthUser()
  return authUser?.roles?.includes('admin')
}

export const getAuthUserId = async () => {
  const user = await getAuthUser()
  if (!user) return
  return user.id
}

export function hasRequiredRole(userConnected?: User, requestedRole?: Roles) {
  if (!userConnected || !requestedRole) {
    return false
  }

  // Vérifier que l'utilisateur a des rôles
  const userRoles = userConnected?.roles ?? ['public']
  const requestedRoleIndex = roleHierarchy.indexOf(requestedRole)

  if (requestedRoleIndex === -1) {
    return false
  }

  // Vérifier si au moins un des rôles de l'utilisateur est supérieur ou égal au rôle requis
  return userRoles.some((role) => {
    const userRoleIndex = roleHierarchy.indexOf(role as Roles)
    return userRoleIndex !== -1 && userRoleIndex >= requestedRoleIndex
  })
}
