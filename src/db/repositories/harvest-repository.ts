import {and, desc, eq, gte, lte, sql, sum} from 'drizzle-orm'

import db from '@/db/models/db'
import {
  AddHarvestModel,
  HarvestModel,
  harvests,
  UpdateHarvestModel,
} from '@/db/models/farmer-model'
import {PaginatedResponse, Pagination} from '@/services/types/common-type'

// ============================================================
// CRUD : harvest
// ============================================================

export const createHarvestDao = async (
  harvest: AddHarvestModel
): Promise<HarvestModel> => {
  const rows = await db.insert(harvests).values(harvest).returning()
  return rows[0]
}

export const getHarvestByIdDao = async (
  id: string
): Promise<HarvestModel | undefined> => {
  return db.query.harvests.findFirst({
    where: (h, {eq}) => eq(h.id, id),
    with: {
      gardenClient: true,
    },
  })
}

export const updateHarvestDao = async (
  harvest: UpdateHarvestModel
): Promise<void> => {
  if (!harvest.id) {
    throw new Error('Harvest ID is required')
  }
  await db.update(harvests).set(harvest).where(eq(harvests.id, harvest.id))
}

export const deleteHarvestDao = async (id: string): Promise<void> => {
  await db.delete(harvests).where(eq(harvests.id, id))
}

// ============================================================
// REQUÊTES SPÉCIALISÉES : harvest
// ============================================================

export const getHarvestsByGardenClientDao = async (
  gardenClientId: string,
  organizationId: string,
  pagination: Pagination
): Promise<PaginatedResponse<HarvestModel>> => {
  const condition = and(
    eq(harvests.gardenClientId, gardenClientId),
    eq(harvests.organizationId, organizationId)
  )

  const [rows, [{count}]] = await Promise.all([
    db
      .select()
      .from(harvests)
      .where(condition)
      .orderBy(desc(harvests.harvestDate))
      .limit(pagination.limit)
      .offset(pagination.offset),
    db
      .select({count: sql<number>`count(*)`})
      .from(harvests)
      .where(condition),
  ])

  const page = Math.floor(pagination.offset / pagination.limit) + 1
  const totalPages = Math.ceil(count / pagination.limit)

  return {
    data: rows.length === 0 ? [] : rows,
    pagination: {total: count, page, limit: pagination.limit, totalPages},
  }
}

export const getHarvestsByOrganizationDao = async (
  organizationId: string,
  pagination: Pagination
): Promise<PaginatedResponse<HarvestModel>> => {
  const [rows, [{count}]] = await Promise.all([
    db
      .select()
      .from(harvests)
      .where(eq(harvests.organizationId, organizationId))
      .orderBy(desc(harvests.harvestDate))
      .limit(pagination.limit)
      .offset(pagination.offset),
    db
      .select({count: sql<number>`count(*)`})
      .from(harvests)
      .where(eq(harvests.organizationId, organizationId)),
  ])

  const page = Math.floor(pagination.offset / pagination.limit) + 1
  const totalPages = Math.ceil(count / pagination.limit)

  return {
    data: rows.length === 0 ? [] : rows,
    pagination: {total: count, page, limit: pagination.limit, totalPages},
  }
}

export const getTotalHarvestValueByClientDao = async (
  gardenClientId: string,
  organizationId: string
): Promise<number> => {
  const [{total}] = await db
    .select({total: sum(harvests.calculatedValueEur)})
    .from(harvests)
    .where(
      and(
        eq(harvests.gardenClientId, gardenClientId),
        eq(harvests.organizationId, organizationId)
      )
    )
  return Number(total ?? 0)
}

export const getTotalHarvestValueByClientAndYearDao = async (
  gardenClientId: string,
  organizationId: string,
  year: number
): Promise<number> => {
  const startDate = new Date(year, 0, 1)
  const endDate = new Date(year, 11, 31, 23, 59, 59)

  const [{total}] = await db
    .select({total: sum(harvests.calculatedValueEur)})
    .from(harvests)
    .where(
      and(
        eq(harvests.gardenClientId, gardenClientId),
        eq(harvests.organizationId, organizationId),
        gte(harvests.harvestDate, startDate),
        lte(harvests.harvestDate, endDate)
      )
    )
  return Number(total ?? 0)
}

export const getHarvestStatsByClientDao = async (
  gardenClientId: string,
  organizationId: string
): Promise<{totalWeightKg: number; totalValueEur: number; count: number}> => {
  const [{totalWeight, totalValue, count}] = await db
    .select({
      totalWeight: sum(harvests.weightKg),
      totalValue: sum(harvests.calculatedValueEur),
      count: sql<number>`count(*)`,
    })
    .from(harvests)
    .where(
      and(
        eq(harvests.gardenClientId, gardenClientId),
        eq(harvests.organizationId, organizationId)
      )
    )
  return {
    totalWeightKg: Number(totalWeight ?? 0),
    totalValueEur: Number(totalValue ?? 0),
    count: Number(count ?? 0),
  }
}
