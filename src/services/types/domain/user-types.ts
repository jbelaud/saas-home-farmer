import {UserModel} from '@/db/models/user-model'

export type User = UserModel
export type UserRoles = User['role']
export type UserVisibility = User['visibility']
export type CreateUser = Pick<User, 'email' | 'name' | 'password'>
export type UpdateUser = Omit<User, 'role' | 'emailVerified' | 'password'>
