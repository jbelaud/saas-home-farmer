import {and, desc, eq, gte, lte, sql} from 'drizzle-orm'

import db from '@/db/models/db'
import {
  AddInterventionModel,
  InterventionModel,
  interventions,
  InterventionStatusEnumModel,
  UpdateInterventionModel,
} from '@/db/models/farmer-model'
import {PaginatedResponse, Pagination} from '@/services/types/common-type'

// ============================================================
// CRUD : intervention
// ============================================================

export const createInterventionDao = async (
  intervention: AddInterventionModel
): Promise<InterventionModel> => {
  const rows = await db.insert(interventions).values(intervention).returning()
  return rows[0]
}

export const getInterventionByIdDao = async (
  id: string
): Promise<InterventionModel | undefined> => {
  return db.query.interventions.findFirst({
    where: (i, {eq}) => eq(i.id, id),
    with: {
      gardenClient: true,
    },
  })
}

export const getInterventionByIdAndOrganizationDao = async (
  id: string,
  organizationId: string
): Promise<InterventionModel | undefined> => {
  return db.query.interventions.findFirst({
    where: (i, {eq, and}) =>
      and(eq(i.id, id), eq(i.organizationId, organizationId)),
    with: {
      gardenClient: true,
    },
  })
}

export const updateInterventionDao = async (
  intervention: UpdateInterventionModel
): Promise<void> => {
  if (!intervention.id) {
    throw new Error('Intervention ID is required')
  }
  await db
    .update(interventions)
    .set({...intervention, updatedAt: new Date()})
    .where(eq(interventions.id, intervention.id))
}

export const updateInterventionStatusDao = async (
  id: string,
  status: InterventionStatusEnumModel
): Promise<void> => {
  await db
    .update(interventions)
    .set({status, updatedAt: new Date()})
    .where(eq(interventions.id, id))
}

export const deleteInterventionDao = async (id: string): Promise<void> => {
  await db.delete(interventions).where(eq(interventions.id, id))
}

// ============================================================
// REQUÊTES SPÉCIALISÉES : intervention
// ============================================================

export const getInterventionsByOrganizationDao = async (
  organizationId: string,
  pagination: Pagination
): Promise<PaginatedResponse<InterventionModel>> => {
  const [rows, [{count}]] = await Promise.all([
    db
      .select()
      .from(interventions)
      .where(eq(interventions.organizationId, organizationId))
      .orderBy(desc(interventions.scheduledDate))
      .limit(pagination.limit)
      .offset(pagination.offset),
    db
      .select({count: sql<number>`count(*)`})
      .from(interventions)
      .where(eq(interventions.organizationId, organizationId)),
  ])

  const page = Math.floor(pagination.offset / pagination.limit) + 1
  const totalPages = Math.ceil(count / pagination.limit)

  return {
    data: rows.length === 0 ? [] : rows,
    pagination: {total: count, page, limit: pagination.limit, totalPages},
  }
}

export const getInterventionsByGardenClientDao = async (
  gardenClientId: string,
  organizationId: string,
  pagination: Pagination
): Promise<PaginatedResponse<InterventionModel>> => {
  const condition = and(
    eq(interventions.gardenClientId, gardenClientId),
    eq(interventions.organizationId, organizationId)
  )

  const [rows, [{count}]] = await Promise.all([
    db
      .select()
      .from(interventions)
      .where(condition)
      .orderBy(desc(interventions.scheduledDate))
      .limit(pagination.limit)
      .offset(pagination.offset),
    db
      .select({count: sql<number>`count(*)`})
      .from(interventions)
      .where(condition),
  ])

  const page = Math.floor(pagination.offset / pagination.limit) + 1
  const totalPages = Math.ceil(count / pagination.limit)

  return {
    data: rows.length === 0 ? [] : rows,
    pagination: {total: count, page, limit: pagination.limit, totalPages},
  }
}

export const getInterventionsByDateRangeDao = async (
  organizationId: string,
  startDate: Date,
  endDate: Date
): Promise<InterventionModel[]> => {
  return db
    .select()
    .from(interventions)
    .where(
      and(
        eq(interventions.organizationId, organizationId),
        gte(interventions.scheduledDate, startDate),
        lte(interventions.scheduledDate, endDate)
      )
    )
    .orderBy(interventions.scheduledDate)
}

export const getInterventionsByStatusDao = async (
  organizationId: string,
  status: InterventionStatusEnumModel
): Promise<InterventionModel[]> => {
  return db
    .select()
    .from(interventions)
    .where(
      and(
        eq(interventions.organizationId, organizationId),
        eq(interventions.status, status)
      )
    )
    .orderBy(interventions.scheduledDate)
}

export const getInterventionsCountByOrganizationDao = async (
  organizationId: string
): Promise<number> => {
  const [{count}] = await db
    .select({count: sql<number>`count(*)`})
    .from(interventions)
    .where(eq(interventions.organizationId, organizationId))
  return count
}
