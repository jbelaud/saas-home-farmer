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

//Roles
export const roleHierarchy = [
  'public',
  'user',
  'redactor',
  'moderator',
  'admin',
  'super_admin',
] satisfies Roles[]

export const ROLE_PUBLIC = 'public'
export const ROLE_USER = 'user'
export const ROLE_REDACTOR = 'redactor'
export const ROLE_MODERATOR = 'moderator'
export const ROLE_ADMIN = 'admin'
export const ROLE_SUPER_ADMIN = 'super_admin'
