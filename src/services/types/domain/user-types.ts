import {Session} from 'next-auth'

import {
  AddUserModel,
  RoleEnumModel,
  RoleModel,
  UpdateUserModel,
  UserModel,
  UserRoleModel,
} from '@/db/models/user-model'

import {MemberData} from './organization-types'

// ICI les TYPES DE DOMAIN sont EGAUX aux types drizzle
// Les fichier types DOMAINS sont la pour décorréler les types de drizzle des types de domaine (services)

export type User = UserModel & {
  roles?: Roles[]
  organizations?: MemberData[]
}
export type RequireAuthOptions = {
  roles?: Roles[]
  active?: boolean
}
export type UserVisibility = User['visibility']

// Types pour les rôles
export type Role = RoleModel
export type UserRole = UserRoleModel
export type Roles = RoleEnumModel

// Utilisateur avec ses rôles
export type UserWithRoles = User & {
  roles: Role[]
}

export type CreateUser = Pick<AddUserModel, 'email' | 'name'>
export type UpdateUser = {
  id: string
} & Partial<Omit<UpdateUserModel, 'id'>>

//DTO = Data Transfer Object
export type UserDTO = {
  id: string
  email: string
  name?: string
  roles?: string[]
  image?: string
}

export type AuthUser = {
  session?: Session
  user?: UserWithRoles
  roles: Roles[]
}

// Types pour la gestion des rôles
export type AssignRoleToUser = {
  userId: string
  roleId: string
  assignedBy?: string
}

export type RolePermission = {
  canRead: boolean
  canWrite: boolean
  canDelete: boolean
  canAdmin: boolean
}

export type UserPermissions = {
  [key: string]: RolePermission
}
