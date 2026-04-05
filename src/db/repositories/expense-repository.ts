import {and, desc, eq, gte, lte, sql} from 'drizzle-orm'

import db from '@/db/models/db'
import {
  AddExpenseModel,
  ExpenseCategoryEnumModel,
  ExpenseModel,
  expenses,
  UpdateExpenseModel,
} from '@/db/models/farmer-model'

// ============================================================
// CRUD : expense
// ============================================================

export const createExpenseDao = async (
  expense: AddExpenseModel
): Promise<ExpenseModel> => {
  const rows = await db.insert(expenses).values(expense).returning()
  return rows[0]
}

export const getExpenseByIdDao = async (
  id: string
): Promise<ExpenseModel | undefined> => {
  return db.query.expenses.findFirst({
    where: (e, {eq}) => eq(e.id, id),
  })
}

export const getExpenseByIdAndOrganizationDao = async (
  id: string,
  organizationId: string
): Promise<ExpenseModel | undefined> => {
  return db.query.expenses.findFirst({
    where: (e, {eq, and}) =>
      and(eq(e.id, id), eq(e.organizationId, organizationId)),
  })
}

export const updateExpenseDao = async (
  expense: UpdateExpenseModel
): Promise<void> => {
  if (!expense.id) {
    throw new Error('Expense ID is required')
  }
  await db
    .update(expenses)
    .set({...expense, updatedAt: new Date()})
    .where(eq(expenses.id, expense.id))
}

export const deleteExpenseDao = async (id: string): Promise<void> => {
  await db.delete(expenses).where(eq(expenses.id, id))
}

// ============================================================
// REQUÊTES SPÉCIALISÉES : expense
// ============================================================

export const getExpensesByOrganizationDao = async (
  organizationId: string,
  from?: Date,
  to?: Date
): Promise<ExpenseModel[]> => {
  const conditions = [eq(expenses.organizationId, organizationId)]
  if (from) conditions.push(gte(expenses.date, from))
  if (to) conditions.push(lte(expenses.date, to))

  return db
    .select()
    .from(expenses)
    .where(and(...conditions))
    .orderBy(desc(expenses.date))
}

export const getExpensesTotalByOrganizationDao = async (
  organizationId: string,
  from: Date,
  to: Date
): Promise<number> => {
  const [result] = await db
    .select({total: sql<number>`coalesce(sum(${expenses.amount}), 0)`})
    .from(expenses)
    .where(
      and(
        eq(expenses.organizationId, organizationId),
        gte(expenses.date, from),
        lte(expenses.date, to)
      )
    )
  return Number(result?.total ?? 0)
}

export const getExpensesByMonthDao = async (
  organizationId: string,
  year: number
): Promise<{month: number; total: number}[]> => {
  const startDate = new Date(year, 0, 1)
  const endDate = new Date(year + 1, 0, 1)

  const rows = await db
    .select({
      month: sql<number>`extract(month from ${expenses.date})`,
      total: sql<number>`coalesce(sum(${expenses.amount}), 0)`,
    })
    .from(expenses)
    .where(
      and(
        eq(expenses.organizationId, organizationId),
        gte(expenses.date, startDate),
        lte(expenses.date, endDate)
      )
    )
    .groupBy(sql`extract(month from ${expenses.date})`)
    .orderBy(sql`extract(month from ${expenses.date})`)

  return rows.map((r) => ({month: Number(r.month), total: Number(r.total)}))
}

export const getExpensesByCategoryDao = async (
  organizationId: string,
  from: Date,
  to: Date
): Promise<{category: ExpenseCategoryEnumModel; total: number}[]> => {
  const rows = await db
    .select({
      category: expenses.category,
      total: sql<number>`coalesce(sum(${expenses.amount}), 0)`,
    })
    .from(expenses)
    .where(
      and(
        eq(expenses.organizationId, organizationId),
        gte(expenses.date, from),
        lte(expenses.date, to)
      )
    )
    .groupBy(expenses.category)
    .orderBy(sql`sum(${expenses.amount}) desc`)

  return rows.map((r) => ({
    category: r.category,
    total: Number(r.total),
  }))
}

export const getExpenseYearsDao = async (
  organizationId: string
): Promise<number[]> => {
  const rows = await db
    .select({
      year: sql<number>`distinct extract(year from ${expenses.date})`,
    })
    .from(expenses)
    .where(eq(expenses.organizationId, organizationId))
    .orderBy(sql`extract(year from ${expenses.date}) desc`)

  return rows.map((r) => Number(r.year))
}
