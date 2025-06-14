import {cache} from 'react'

import {
  canCreateOrganization,
  canDeleteOrganization,
  canManageOrganizationMembers,
  canReadOrganizationMember,
  canUpdateOrganization,
} from '@/services/authorization/organization-authorization'
import {
  getAllOrganizationsWithPaginationService,
  getInvitationMembersService,
  getOrganizationBySlugService,
  getOrganizationMembersService,
} from '@/services/facades/organization-service-facade'
import {Pagination} from '@/services/types/common-type'

export type OrganizationMemberDTO = {
  id: string
  name: string
  email: string
  image: string | null
  role: string
  joinedAt: Date
}

export type OrganizationDTO = {
  id: string
  name: string
  slug: string
  description: string | null
  logo: string | null
  createdAt: Date | null
  updatedAt: Date | null
  metadata: string | null
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
      joinedAt: m.createdAt,
    }
  })
}

export type MemberOrInvitationDTO = {
  id: string
  name: string | null
  email: string
  image: string | null
  role: string | null
  joinedAt: Date | null
  status: 'member' | 'invited'
}

export async function getMembersAndInvitationsDal(
  organizationId: string
): Promise<MemberOrInvitationDTO[]> {
  const [members, invitations] = await Promise.all([
    getOrganizationMembersService(organizationId),
    getInvitationMembersService(organizationId),
  ])

  const memberDTOs = members.map((m) => {
    if (!m.user) {
      throw new Error('User data missing from organization member')
    }
    return {
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
      image: m.user.image ?? null,
      role: m.role,
      joinedAt: m.createdAt,
      status: 'member' as const,
    }
  })

  const invitationDTOs = invitations.map((i) => ({
    id: i.id,
    name: i.user?.name ?? null,
    email: i.email,
    image: i.user?.image ?? null,
    role: i.role,
    joinedAt: i.expiresAt,
    status: 'invited' as const,
  }))

  return [...memberDTOs, ...invitationDTOs]
}

export const getAllOrganizationsWithPaginationDal = cache(
  async (pagination: Pagination, search?: string) => {
    // Utiliser le service pour récupérer les organisations avec pagination et recherche
    return await getAllOrganizationsWithPaginationService(pagination, search)
  }
)

export async function getOrganizationPermissions(organizationId?: string) {
  const [canCreate, canEdit, canDelete, canReadMembers, canManageMembers] =
    await Promise.all([
      canCreateOrganization(),
      organizationId ? canUpdateOrganization(organizationId) : false,
      organizationId ? canDeleteOrganization(organizationId) : false,
      organizationId ? canReadOrganizationMember(organizationId) : false,
      organizationId ? canManageOrganizationMembers(organizationId) : false,
    ])

  return {
    canCreate,
    canEdit,
    canDelete,
    canReadMembers,
    canManageMembers,
  }
}

export const getOrganizationBySlugDal = cache(
  async (slug: string): Promise<OrganizationDTO | null> => {
    const organization = await getOrganizationBySlugService(slug)

    if (!organization) {
      return null
    }

    return {
      id: organization.id,
      name: organization.name,
      slug: organization.slug ?? '',
      description: organization.description ?? null,
      logo: organization.logo ?? null,
      createdAt: organization.createdAt ?? null,
      updatedAt: organization.updatedAt ?? null,
      metadata: organization.metadata ?? null,
    }
  }
)

export const getOrganizationAdminPermissionsDal = cache(async () => {
  // Pour l'admin, on peut gérer toutes les organisations
  const [canCreate] = await Promise.all([canCreateOrganization()])

  return {
    canCreate,
    canEdit: true, // Admin peut éditer toutes les organisations
    canDelete: true, // Admin peut supprimer toutes les organisations
    canManage: true, // Admin peut gérer toutes les organisations
  }
})
