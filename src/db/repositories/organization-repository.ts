import {and, eq, or, sql} from 'drizzle-orm'

import {member, organization as organizations} from '@/db/models/auth-model'
import db from '@/db/models/db'
import {
  AddMemberModel,
  AddOrganizationModel,
  MemberModel,
  OrganizationModel,
  OrganizationRoleEnumModel,
  UpdateOrganizationModel,
} from '@/db/models/organization-model'
import {PaginatedResponse, Pagination} from '@/services/types/common-type'
import {
  Invitation,
  MemberData,
} from '@/services/types/domain/organization-types'

import {UserModel} from '../models/user-model'

/**
 * Génère un slug unique pour une organisation
 * @param name Le nom de l'organisation
 * @returns Un slug unique basé sur le nom
 */
export const generateUniqueSlug = async (name: string): Promise<string> => {
  // Fonction pour générer un slug à partir d'un nom
  const generateSlug = (baseName: string): string => {
    return `${baseName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.random().toString(36).substring(2, 6)}`
  }

  // Générer le premier slug
  let slug = generateSlug(name)
  let attempts = 0
  const maxAttempts = 10 // Limite de tentatives pour éviter une boucle infinie

  // Vérifier si le slug existe déjà
  while (attempts < maxAttempts) {
    const existingOrg = await getOrganizationBySlugDao(slug)
    if (!existingOrg) {
      return slug
    }
    slug = generateSlug(name)
    attempts++
  }

  // Si on n'a pas trouvé de slug unique après maxAttempts, on ajoute un timestamp
  return `${generateSlug(name)}-${Date.now()}`
}

// ===== CRUD ORGANIZATIONS =====

export const createOrganizationDao = async (
  organization: AddOrganizationModel
): Promise<OrganizationModel> => {
  const row = await db.insert(organizations).values(organization).returning()
  return row[0]
}

export const getOrganizationByIdDao = async (
  id: string
): Promise<OrganizationModel | undefined> => {
  const row = await db.query.organization.findFirst({
    where: (organization, {eq}) => eq(organization.id, id),
  })
  return row
}

export const getOrganizationBySlugDao = async (
  slug: string
): Promise<OrganizationModel | undefined> => {
  const row = await db.query.organization.findFirst({
    where: (organization, {eq}) => eq(organization.slug, slug),
  })
  return row
}

export const updateOrganizationDao = async (
  organization: UpdateOrganizationModel
): Promise<void> => {
  if (!organization.id) {
    throw new Error('Organization ID is required')
  }
  await db
    .update(organizations)
    .set({...organization, updatedAt: new Date()})
    .where(eq(organizations.id, organization.id))
}

export const deleteOrganizationDao = async (id: string): Promise<void> => {
  await db.delete(organizations).where(eq(organizations.id, id))
}

export const getOrganizationsDao = async (
  pagination: Pagination
): Promise<PaginatedResponse<OrganizationModel>> => {
  const [rows, [{count}]] = await Promise.all([
    db
      .select()
      .from(organizations)
      .limit(pagination.limit)
      .offset(pagination.offset)
      .orderBy(organizations.createdAt),
    db.select({count: sql<number>`count(*)`}).from(organizations),
  ])

  return {
    data: rows.length === 0 ? [] : rows,
    pagination: {
      rowCount: count,
      pageSize: pagination.limit,
    },
  }
}

export const getAllOrganizationsWithPaginationDao = async (
  pagination: Pagination,
  search?: string
): Promise<PaginatedResponse<OrganizationModel>> => {
  // Construire la clause WHERE pour la recherche
  let searchCondition
  if (search && search.trim()) {
    const searchTerm = search.trim()
    searchCondition = or(
      sql`${organizations.name} ILIKE ${`%${searchTerm}%`}`,
      sql`${organizations.slug} ILIKE ${`%${searchTerm}%`}`,
      sql`${organizations.description} ILIKE ${`%${searchTerm}%`}`
    )
  }

  // Récupérer les organisations avec recherche
  const [rows, [{count}]] = await Promise.all([
    db
      .select()
      .from(organizations)
      .where(searchCondition)
      .limit(pagination.limit)
      .offset(pagination.offset)
      .orderBy(sql`${organizations.createdAt} DESC`),
    db
      .select({count: sql<number>`count(*)`})
      .from(organizations)
      .where(searchCondition),
  ])

  return {
    data: rows.length === 0 ? [] : rows,
    pagination: {
      rowCount: count,
      pageSize: pagination.limit,
    },
  }
}

// ===== CRUD USER-ORGANIZATIONS =====

export const createOrganizationMemberDao = async (
  userOrganization: AddMemberModel
): Promise<MemberModel> => {
  const row = await db.insert(member).values(userOrganization).returning()
  return row[0]
}

export const getUserOrganizationDao = async (
  userId: string,
  organizationId: string
): Promise<MemberModel | undefined> => {
  const row = await db.query.member.findFirst({
    where: (userOrg, {eq, and}) =>
      and(
        eq(userOrg.userId, userId),
        eq(userOrg.organizationId, organizationId)
      ),
  })
  return row
}

export const updateUserOrganizationRoleDao = async (
  userId: string,
  organizationId: string,
  role: OrganizationRoleEnumModel
): Promise<void> => {
  await db
    .update(member)
    .set({role})
    .where(
      and(eq(member.userId, userId), eq(member.organizationId, organizationId))
    )
}

export const deleteUserOrganizationDao = async (
  userId: string,
  organizationId: string
): Promise<void> => {
  await db
    .delete(member)
    .where(
      and(eq(member.userId, userId), eq(member.organizationId, organizationId))
    )
}

// ===== REQUÊTES SPÉCIALISÉES =====

export const getMembersDao = async (userId: string): Promise<MemberModel[]> => {
  const rows = await db.query.member.findMany({
    where: (member, {eq}) => eq(member.userId, userId),
    with: {
      organization: true,
    },
  })
  return rows
}

export const getOrganizationMembersDao = async (
  organizationId: string
): Promise<MemberData[]> => {
  const rows = await db.query.member.findMany({
    where: (userOrg, {eq}) => eq(userOrg.organizationId, organizationId),
    with: {
      user: true,
    },
  })
  return rows
}

export const getOrganizationsByUserIdDao = async (
  userId: string
): Promise<OrganizationModel[]> => {
  const rows = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      slug: organizations.slug,
      description: organizations.description,
      logo: organizations.logo,
      metadata: organizations.metadata,
      createdAt: organizations.createdAt,
      updatedAt: organizations.updatedAt,
    })
    .from(organizations)
    .innerJoin(member, eq(organizations.id, member.organizationId))
    .where(eq(member.userId, userId))
    .orderBy(organizations.name)

  return rows
}

export const getInvitationMembersDao = async (
  organizationId: string
): Promise<(Invitation & {user: UserModel | null})[]> => {
  const rows = await db.query.invitation.findMany({
    where: (invitation, {eq, and}) =>
      and(
        eq(invitation.organizationId, organizationId),
        eq(invitation.status, 'pending')
      ),
    with: {
      inviter: true,
    },
  })

  const invitationsWithUsers = await Promise.all(
    rows.map(async (invitation) => {
      const user = await db.query.user.findFirst({
        where: (user, {eq}) => eq(user.email, invitation.email),
      })
      return {
        ...invitation,
        user: user ?? null,
      }
    })
  )

  return invitationsWithUsers
}

export const getUserRoleInOrganizationDao = async (
  userId: string,
  organizationId: string
): Promise<OrganizationRoleEnumModel | null> => {
  const row = await db.query.member.findFirst({
    where: (userOrg, {eq, and}) =>
      and(
        eq(userOrg.userId, userId),
        eq(userOrg.organizationId, organizationId)
      ),
    columns: {
      role: true,
    },
  })
  return row?.role || null
}
