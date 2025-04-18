import {UserDTO} from './user-types'

export enum RoleEnum {
  GUEST = 'guest',
  USER = 'user',
  REDACTOR = 'redactor',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

export type WithAuthProps = {
  user: UserDTO
}

export type SessionPayload = {
  userId?: string | number //used for simple session
  sessionId?: string //used for multisession db
  expiresAt: Date
  role?: RoleEnum
}

export interface SignInError {
  type: 'CredentialsSignin'
  message?: string
  code?: string
}

export const roleHierarchy = [
  RoleEnum.GUEST,
  RoleEnum.USER,
  RoleEnum.REDACTOR,
  RoleEnum.MODERATOR,
  RoleEnum.ADMIN,
  RoleEnum.SUPER_ADMIN,
]
