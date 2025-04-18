import {UserModel} from '@/db/models/user-model'

// ICI les TYPES DE DOMAIN sont EGAUX aux types drizzle
// Les fichier types DOMAINS sont la pour décorréler les types de drizzle des types de domaine (services)
export type User = UserModel
export type UserRoles = User['role']
export type UserVisibility = User['visibility']
export type CreateUser = Pick<User, 'email' | 'name' | 'password'>
export type UpdateUser = Omit<User, 'role' | 'emailVerified' | 'password'>

export type UserDTO = {
  id: string
  email: string
  name?: string
  role?: string
  image?: string
}
