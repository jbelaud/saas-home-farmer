import {and, eq, sql} from 'drizzle-orm'

import db from '@/db/models/db'
import {
  AddOrganizationModel,
  AddUserOrganizationModel,
  OrganizationModel,
  OrganizationRoleEnumModel,
  organizations,
  UpdateOrganizationModel,
  UserOrganizationModel,
  userOrganizations,
} from '@/db/models/organization-model'
import {PaginatedResponse, Pagination} from '@/services/types/common-type'
import {UserOrganizationData} from '@/services/types/domain/organization-types'

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
  const row = await db.query.organizations.findFirst({
    where: (organization, {eq}) => eq(organization.id, id),
  })
  return row
}

export const getOrganizationBySlugDao = async (
  slug: string
): Promise<OrganizationModel | undefined> => {
  const row = await db.query.organizations.findFirst({
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

// ===== CRUD USER-ORGANIZATIONS =====

export const createUserOrganizationDao = async (
  userOrganization: AddUserOrganizationModel
): Promise<UserOrganizationModel> => {
  const row = await db
    .insert(userOrganizations)
    .values(userOrganization)
    .returning()
  return row[0]
}

export const getUserOrganizationDao = async (
  userId: string,
  organizationId: string
): Promise<UserOrganizationModel | undefined> => {
  const row = await db.query.userOrganizations.findFirst({
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
    .update(userOrganizations)
    .set({role})
    .where(
      and(
        eq(userOrganizations.userId, userId),
        eq(userOrganizations.organizationId, organizationId)
      )
    )
}

export const deleteUserOrganizationDao = async (
  userId: string,
  organizationId: string
): Promise<void> => {
  await db
    .delete(userOrganizations)
    .where(
      and(
        eq(userOrganizations.userId, userId),
        eq(userOrganizations.organizationId, organizationId)
      )
    )
}

// ===== REQUÊTES SPÉCIALISÉES =====

export const getUserOrganizationsDao = async (
  userId: string
): Promise<UserOrganizationModel[]> => {
  const rows = await db.query.userOrganizations.findMany({
    where: (userOrg, {eq}) => eq(userOrg.userId, userId),
    with: {
      organization: true,
    },
  })
  return rows
}

export const getOrganizationMembersDao = async (
  organizationId: string
): Promise<UserOrganizationData[]> => {
  const rows = await db.query.userOrganizations.findMany({
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
      image: organizations.image,
      createdAt: organizations.createdAt,
      updatedAt: organizations.updatedAt,
    })
    .from(organizations)
    .innerJoin(
      userOrganizations,
      eq(organizations.id, userOrganizations.organizationId)
    )
    .where(eq(userOrganizations.userId, userId))
    .orderBy(organizations.name)

  return rows
}

export const getUserRoleInOrganizationDao = async (
  userId: string,
  organizationId: string
): Promise<OrganizationRoleEnumModel | null> => {
  const row = await db.query.userOrganizations.findFirst({
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
