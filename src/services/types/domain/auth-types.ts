import {OrganizationRoleEnumModel} from '@/db/models/organization-model'

import {Roles, UserDTO} from './user-types'

export type WithAuthProps = {
  user: UserDTO
}

export type SessionPayload = {
  userId?: string | number //used for simple session
  sessionId?: string //used for multisession db
  expiresAt: Date
  role?: Roles
}

export interface SignInError {
  type: 'CredentialsSignin'
  message?: string
  code?: string
}

//Roles GLOBAUX
export const roleHierarchy = [
  'public',
  'user',
  'redactor',
  'moderator',
  'admin',
  'super_admin',
] satisfies Roles[]

// export const ROLE_PUBLIC = 'public'
// export const ROLE_USER = 'user'
// export const ROLE_REDACTOR = 'redactor'
// export const ROLE_MODERATOR = 'moderator'
// export const ROLE_ADMIN = 'admin'
// export const ROLE_SUPER_ADMIN = 'super_admin'

// Context pour spécifier l'organisation COURANTE
export interface OrganizationContext {
  organizationId: string // Quelle org est active maintenant
}

// Constantes pour les rôles utilisateur dans une organisation
export const UserOrganizationRoleConst = {
  OWNER: 'OWNER' as OrganizationRoleEnumModel,
  ADMIN: 'ADMIN' as OrganizationRoleEnumModel,
  MEMBER: 'MEMBER' as OrganizationRoleEnumModel,
} as const

// Constantes pour les rôles globaux
export const RoleConst = {
  PUBLIC: 'public' as Roles,
  USER: 'user' as Roles,
  REDACTOR: 'redactor' as Roles,
  MODERATOR: 'moderator' as Roles,
  ADMIN: 'admin' as Roles,
  SUPER_ADMIN: 'super_admin' as Roles,
} as const
