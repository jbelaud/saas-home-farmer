import {
  canCreateOrganization,
  canDeleteOrganization,
  canManageOrganizationMembers,
  canUpdateOrganization,
} from '@/services/authorization/organization-authorization'
import {getOrganizationMembersService} from '@/services/facades/organization-service-facade'

export type OrganizationMemberDTO = {
  id: string
  name: string
  email: string
  image: string | null
  role: string
  joinedAt: Date
}

export async function getOrganizationMembersDal(
  organizationId: string
): Promise<OrganizationMemberDTO[]> {
  const members = await getOrganizationMembersService(organizationId)
  return members.map((m) => {
    if (!m.user) {
      throw new Error('User data missing from organization member')
    }
    return {
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
      image: m.user.image ?? null,
      role: m.role,
      joinedAt: m.joinedAt ?? new Date(),
    }
  })
}

export async function getOrganizationPermissions(organizationId?: string) {
  const [canCreate, canEdit, canDelete, canManageMembers] = await Promise.all([
    canCreateOrganization(),
    organizationId ? canUpdateOrganization(organizationId) : false,
    organizationId ? canDeleteOrganization(organizationId) : false,
    organizationId ? canManageOrganizationMembers(organizationId) : false,
  ])

  return {
    canCreate,
    canEdit,
    canDelete,
    canManageMembers,
  }
}
