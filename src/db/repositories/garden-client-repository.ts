import {and, eq, ilike, or, sql} from 'drizzle-orm'

import db from '@/db/models/db'
import {
  AddGardenClientModel,
  GardenClientModel,
  gardenClients,
  UpdateGardenClientModel,
} from '@/db/models/farmer-model'
import {PaginatedResponse, Pagination} from '@/services/types/common-type'

// ============================================================
// CRUD : garden_client
// ============================================================

export const createGardenClientDao = async (
  client: AddGardenClientModel
): Promise<GardenClientModel> => {
  const rows = await db.insert(gardenClients).values(client).returning()
  return rows[0]
}

export const getGardenClientByIdDao = async (
  id: string
): Promise<GardenClientModel | undefined> => {
  return db.query.gardenClients.findFirst({
    where: (gc, {eq}) => eq(gc.id, id),
  })
}

export const getGardenClientByIdAndOrganizationDao = async (
  id: string,
  organizationId: string
): Promise<GardenClientModel | undefined> => {
  return db.query.gardenClients.findFirst({
    where: (gc, {eq, and}) =>
      and(eq(gc.id, id), eq(gc.organizationId, organizationId)),
  })
}

export const updateGardenClientDao = async (
  client: UpdateGardenClientModel
): Promise<void> => {
  if (!client.id) {
    throw new Error('GardenClient ID is required')
  }
  await db
    .update(gardenClients)
    .set({...client, updatedAt: new Date()})
    .where(eq(gardenClients.id, client.id))
}

export const deleteGardenClientDao = async (id: string): Promise<void> => {
  await db.delete(gardenClients).where(eq(gardenClients.id, id))
}

export const softDeleteGardenClientDao = async (id: string): Promise<void> => {
  await db
    .update(gardenClients)
    .set({isActive: false, updatedAt: new Date()})
    .where(eq(gardenClients.id, id))
}

// ============================================================
// REQUÊTES SPÉCIALISÉES : garden_client
// ============================================================

export const getGardenClientsByOrganizationDao = async (
  organizationId: string,
  pagination: Pagination,
  search?: string
): Promise<PaginatedResponse<GardenClientModel>> => {
  const baseCondition = and(
    eq(gardenClients.organizationId, organizationId),
    eq(gardenClients.isActive, true)
  )

  const searchCondition =
    search && search.trim()
      ? and(
          baseCondition,
          or(
            ilike(gardenClients.firstName, `%${search.trim()}%`),
            ilike(gardenClients.lastName, `%${search.trim()}%`),
            ilike(gardenClients.email, `%${search.trim()}%`),
            ilike(gardenClients.addressCity, `%${search.trim()}%`)
          )
        )
      : baseCondition

  const [rows, [{count}]] = await Promise.all([
    db
      .select()
      .from(gardenClients)
      .where(searchCondition)
      .orderBy(gardenClients.lastName)
      .limit(pagination.limit)
      .offset(pagination.offset),
    db
      .select({count: sql<number>`count(*)`})
      .from(gardenClients)
      .where(searchCondition),
  ])

  const page = Math.floor(pagination.offset / pagination.limit) + 1
  const totalPages = Math.ceil(count / pagination.limit)

  return {
    data: rows.length === 0 ? [] : rows,
    pagination: {
      total: count,
      page,
      limit: pagination.limit,
      totalPages,
    },
  }
}

export const getGardenClientByAccessTokenDao = async (
  accessToken: string
): Promise<GardenClientModel | undefined> => {
  return db.query.gardenClients.findFirst({
    where: (gc, {eq, and}) =>
      and(eq(gc.accessToken, accessToken), eq(gc.isActive, true)),
  })
}

export const getActiveClientsCountByOrganizationDao = async (
  organizationId: string
): Promise<number> => {
  const [{count}] = await db
    .select({count: sql<number>`count(*)`})
    .from(gardenClients)
    .where(
      and(
        eq(gardenClients.organizationId, organizationId),
        eq(gardenClients.isActive, true)
      )
    )
  return count
}

/**
 * Clients dont la prochaine visite est dans le passé ou dans les N prochains jours.
 * Triés par urgence (les plus en retard d'abord).
 */
export const getClientsNeedingVisitDao = async (
  organizationId: string,
  withinDays: number = 7
): Promise<GardenClientModel[]> => {
  const limitDate = new Date()
  limitDate.setDate(limitDate.getDate() + withinDays)

  return db
    .select()
    .from(gardenClients)
    .where(
      and(
        eq(gardenClients.organizationId, organizationId),
        eq(gardenClients.isActive, true),
        sql`${gardenClients.nextVisitDate} IS NOT NULL AND ${gardenClients.nextVisitDate} <= ${limitDate}`
      )
    )
    .orderBy(gardenClients.nextVisitDate)
}

/**
 * Clients actifs sans nextVisitDate (jamais planifié).
 */
export const getClientsWithoutNextVisitDao = async (
  organizationId: string
): Promise<GardenClientModel[]> => {
  return db
    .select()
    .from(gardenClients)
    .where(
      and(
        eq(gardenClients.organizationId, organizationId),
        eq(gardenClients.isActive, true),
        sql`${gardenClients.nextVisitDate} IS NULL`
      )
    )
    .orderBy(gardenClients.createdAt)
}

/**
 * Met à jour la nextVisitDate d'un client.
 */
export const updateClientNextVisitDateDao = async (
  clientId: string,
  nextVisitDate: Date
): Promise<void> => {
  await db
    .update(gardenClients)
    .set({nextVisitDate, updatedAt: new Date()})
    .where(eq(gardenClients.id, clientId))
}
