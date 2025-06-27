import {
  AddInvitationModel,
  InvitationModel,
  UpdateInvitationModel,
} from '@/db/models/auth-model'
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
export type Member = MemberModel
export type MemberData = MemberModel & {
  user?: UserModel
  organization?: OrganizationModel
}

export type OrganizationRole = OrganizationRoleEnumModel

export const OrganizationRoleConst = {
  admin: 'admin',
  member: 'member',
  owner: 'owner',
} satisfies Record<OrganizationRole, string>

// Types pour les opérations
export type CreateOrganization = AddOrganizationModel
export type UpdateOrganization = {
  id: string
} & Partial<Omit<UpdateOrganizationModel, 'id'>>

export type CreateMember = AddMemberModel

//invitation types
export type Invitation = InvitationModel

export type InvitationWithUser = Invitation & {
  user: UserModel | null
}

export type CreateInvitation = AddInvitationModel
export type UpdateInvitation = {
  id: string
} & Partial<Omit<UpdateInvitationModel, 'id'>>
