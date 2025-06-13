import {
  AddMemberModel,
  AddOrganizationModel,
  MemberModel,
  OrganizationModel,
  OrganizationRoleEnumModel,
  UpdateOrganizationModel,
} from '@/db/models/organization-model'
import {UserModel} from '@/db/models/user-model'

// Types de domaine découplés des types Drizzle
export type Organization = OrganizationModel
export type UserOrganization = MemberModel
export type UserOrganizationData = MemberModel & {
  user?: UserModel
  organization?: OrganizationModel
}

export type OrganizationRole = OrganizationRoleEnumModel

// Types pour les opérations
export type CreateOrganization = AddOrganizationModel
export type UpdateOrganization = {
  id: string
} & Partial<Omit<UpdateOrganizationModel, 'id'>>

export type CreateUserOrganization = AddMemberModel
