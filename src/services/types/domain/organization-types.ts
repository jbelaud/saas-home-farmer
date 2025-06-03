import {
  AddOrganizationModel,
  AddUserOrganizationModel,
  OrganizationModel,
  OrganizationRoleEnumModel,
  UpdateOrganizationModel,
  UserOrganizationModel,
} from '@/db/models/organization-model'

// Constantes pour les rôles utilisateur dans une organisation
export const UserOrganizationRoleConst = {
  OWNER: 'OWNER' as OrganizationRoleEnumModel,
  ADMIN: 'ADMIN' as OrganizationRoleEnumModel,
  MEMBER: 'MEMBER' as OrganizationRoleEnumModel,
} as const

// Types de domaine découplés des types Drizzle
export type Organization = OrganizationModel
export type UserOrganization = UserOrganizationModel
export type OrganizationRole = OrganizationRoleEnumModel

// Types pour les opérations
export type CreateOrganization = AddOrganizationModel
export type UpdateOrganization = {
  id: string
} & Partial<Omit<UpdateOrganizationModel, 'id'>>

export type CreateUserOrganization = AddUserOrganizationModel
