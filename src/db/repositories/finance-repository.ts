import {and, eq, gte, lte, sql} from 'drizzle-orm'

import db from '@/db/models/db'
import {
  expenses,
  gardenClients,
  interventions,
  invoices,
} from '@/db/models/farmer-model'

// ============================================================
// KPI Aggregations
// ============================================================

export const getMrrDao = async (organizationId: string): Promise<number> => {
  const [result] = await db
    .select({
      total: sql<number>`coalesce(sum(${gardenClients.monthlyAmount}), 0)`,
    })
    .from(gardenClients)
    .where(
      and(
        eq(gardenClients.organizationId, organizationId),
        eq(gardenClients.isActive, true)
      )
    )
  return Number(result?.total ?? 0)
}

export const getActiveClientCountDao = async (
  organizationId: string
): Promise<number> => {
  const [result] = await db
    .select({count: sql<number>`count(*)`})
    .from(gardenClients)
    .where(
      and(
        eq(gardenClients.organizationId, organizationId),
        eq(gardenClients.isActive, true)
      )
    )
  return Number(result?.count ?? 0)
}

export const getAvgSurfaceDao = async (
  organizationId: string
): Promise<number> => {
  const [result] = await db
    .select({
      avg: sql<number>`coalesce(avg(${gardenClients.surfaceM2}), 0)`,
    })
    .from(gardenClients)
    .where(
      and(
        eq(gardenClients.organizationId, organizationId),
        eq(gardenClients.isActive, true)
      )
    )
  return Number(result?.avg ?? 0)
}

export const getRevenueYtdDao = async (
  organizationId: string,
  from: Date,
  to: Date
): Promise<number> => {
  const [result] = await db
    .select({
      total: sql<number>`coalesce(sum(${invoices.amountTtc}::numeric), 0)`,
    })
    .from(invoices)
    .where(
      and(
        eq(invoices.organizationId, organizationId),
        eq(invoices.status, 'paid'),
        gte(invoices.issueDate, from),
        lte(invoices.issueDate, to)
      )
    )
  return Number(result?.total ?? 0)
}

export const getRevenueByMonthDao = async (
  organizationId: string,
  year: number
): Promise<{month: number; total: number}[]> => {
  const startDate = new Date(year, 0, 1)
  const endDate = new Date(year + 1, 0, 1)

  const rows = await db
    .select({
      month: sql<number>`extract(month from ${invoices.issueDate})`,
      total: sql<number>`coalesce(sum(${invoices.amountTtc}::numeric), 0)`,
    })
    .from(invoices)
    .where(
      and(
        eq(invoices.organizationId, organizationId),
        eq(invoices.status, 'paid'),
        gte(invoices.issueDate, startDate),
        lte(invoices.issueDate, endDate)
      )
    )
    .groupBy(sql`extract(month from ${invoices.issueDate})`)
    .orderBy(sql`extract(month from ${invoices.issueDate})`)

  return rows.map((r) => ({month: Number(r.month), total: Number(r.total)}))
}

// ============================================================
// Revenue estimation from client subscriptions (monthlyAmount)
// ============================================================

export const getEstimatedRevenueYtdDao = async (
  organizationId: string,
  from: Date,
  to: Date
): Promise<number> => {
  // Calculate how many months the period covers
  const monthsInPeriod =
    (to.getFullYear() - from.getFullYear()) * 12 +
    (to.getMonth() - from.getMonth()) +
    1

  const [result] = await db
    .select({
      totalMonthly: sql<number>`coalesce(sum(${gardenClients.monthlyAmount}), 0)`,
    })
    .from(gardenClients)
    .where(
      and(
        eq(gardenClients.organizationId, organizationId),
        eq(gardenClients.isActive, true)
      )
    )

  const monthly = Number(result?.totalMonthly ?? 0)

  // Cap at current month if "to" is in the future
  const now = new Date()
  const currentMonth = now.getMonth()
  const fromMonth = from.getMonth()
  const isCurrentYear = from.getFullYear() === now.getFullYear()
  const elapsedMonths = isCurrentYear
    ? Math.min(currentMonth - fromMonth + 1, monthsInPeriod)
    : monthsInPeriod

  return monthly * Math.max(elapsedMonths, 0)
}

export const getEstimatedRevenueByMonthDao = async (
  organizationId: string,
  year: number
): Promise<{month: number; total: number}[]> => {
  // Get total monthlyAmount of active clients
  const [result] = await db
    .select({
      totalMonthly: sql<number>`coalesce(sum(${gardenClients.monthlyAmount}), 0)`,
    })
    .from(gardenClients)
    .where(
      and(
        eq(gardenClients.organizationId, organizationId),
        eq(gardenClients.isActive, true)
      )
    )

  const monthly = Number(result?.totalMonthly ?? 0)
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1 // 1-indexed

  // For past/current year: show revenue up to current month
  // For future year: show 0
  return Array.from({length: 12}, (_, i) => {
    const month = i + 1
    const hasRevenue =
      year < currentYear || (year === currentYear && month <= currentMonth)
    return {
      month,
      total: hasRevenue ? monthly : 0,
    }
  })
}

// ============================================================
// Client financial data
// ============================================================

export const getClientsWithFinancialDataDao = async (
  organizationId: string,
  from: Date,
  to: Date
) => {
  const clients = await db
    .select({
      id: gardenClients.id,
      firstName: gardenClients.firstName,
      lastName: gardenClients.lastName,
      surfaceM2: gardenClients.surfaceM2,
      monthlyAmount: gardenClients.monthlyAmount,
      paymentType: gardenClients.paymentType,
      isActive: gardenClients.isActive,
      totalPaid: sql<number>`coalesce((
        select sum(${invoices.amountTtc}::numeric)
        from ${invoices}
        where ${invoices.gardenClientId} = ${gardenClients.id}
          and ${invoices.status} = 'paid'
          and ${invoices.issueDate} >= ${from}
          and ${invoices.issueDate} <= ${to}
      ), 0)`,
      lastVisitDate: sql<string | null>`(
        select max(${interventions.scheduledDate})
        from ${interventions}
        where ${interventions.gardenClientId} = ${gardenClients.id}
          and ${interventions.status} = 'completed'
      )`,
    })
    .from(gardenClients)
    .where(eq(gardenClients.organizationId, organizationId))
    .orderBy(gardenClients.lastName)

  // Calculate elapsed months for estimation
  const now = new Date()
  const fromMonth = from.getMonth()
  const toMonth = to.getMonth()
  const monthsInPeriod =
    (to.getFullYear() - from.getFullYear()) * 12 + (toMonth - fromMonth) + 1
  const isCurrentYear = from.getFullYear() === now.getFullYear()
  const elapsedMonths = isCurrentYear
    ? Math.min(now.getMonth() - fromMonth + 1, monthsInPeriod)
    : monthsInPeriod

  return clients.map((c) => {
    const invoicePaid = Number(c.totalPaid)
    // If no invoices, estimate from monthlyAmount * elapsed months
    const estimatedPaid =
      c.monthlyAmount && c.isActive
        ? c.monthlyAmount * Math.max(elapsedMonths, 0)
        : 0
    return {
      ...c,
      totalPaid: invoicePaid > 0 ? invoicePaid : estimatedPaid,
      lastVisitDate: c.lastVisitDate ? new Date(c.lastVisitDate) : null,
    }
  })
}

// ============================================================
// Available years (for year-over-year navigation)
// ============================================================

export const getAvailableYearsDao = async (
  organizationId: string
): Promise<number[]> => {
  const invoiceYears = await db
    .select({
      year: sql<number>`distinct extract(year from ${invoices.issueDate})`,
    })
    .from(invoices)
    .where(eq(invoices.organizationId, organizationId))

  const expenseYears = await db
    .select({
      year: sql<number>`distinct extract(year from ${expenses.date})`,
    })
    .from(expenses)
    .where(eq(expenses.organizationId, organizationId))

  const allYears = new Set([
    ...invoiceYears.map((r) => Number(r.year)),
    ...expenseYears.map((r) => Number(r.year)),
    new Date().getFullYear(),
  ])

  return [...allYears].sort((a, b) => b - a)
}
