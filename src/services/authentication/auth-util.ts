import {
  RoleConst,
  roleHierarchy,
  UserOrganizationRoleConst,
} from '../types/domain/auth-types'
import {Roles, User} from '../types/domain/user-types'

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

export function hasRequiredRoles(
  userConnected?: User,
  requestedRoles?: Roles[]
) {
  if (!userConnected || !requestedRoles || requestedRoles.length === 0) {
    return false
  }

  // Vérifier que l'utilisateur a des rôles
  const userRoles = userConnected?.roles ?? ['public']

  // Vérifier si l'utilisateur a au moins un des rôles requis
  return requestedRoles.some((requestedRole) => {
    const requestedRoleIndex = roleHierarchy.indexOf(requestedRole)
    if (requestedRoleIndex === -1) return false

    return userRoles.some((userRole) => {
      const userRoleIndex = roleHierarchy.indexOf(userRole as Roles)
      return userRoleIndex !== -1 && userRoleIndex >= requestedRoleIndex
    })
  })
}

export const isAdmin = (user?: User | null) => {
  if (!user) return false
  return (
    user?.roles?.includes(RoleConst.ADMIN) ||
    user?.roles?.includes(RoleConst.SUPER_ADMIN)
  )
}
export const isOrganizationAdmin = async (
  user: User,
  organizationId: string
) => {
  return user?.organizations?.some(
    (organization) =>
      organization.organizationId === organizationId &&
      organization.role === UserOrganizationRoleConst.ADMIN
  )
}

export const isOrganizationOwner = async (
  user: User,
  organizationId: string
) => {
  return user?.organizations?.some(
    (organization) =>
      organization.organizationId === organizationId &&
      organization.role === UserOrganizationRoleConst.OWNER
  )
}
export const isOrganizationMember = async (
  user: User,
  organizationId: string
) => {
  return user?.organizations?.some(
    (organization) =>
      organization.organizationId === organizationId &&
      organization.role === UserOrganizationRoleConst.MEMBER
  )
}
