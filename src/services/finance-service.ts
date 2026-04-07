import {AddExpenseModel, ExpenseModel} from '@/db/models/farmer-model'
import {
  createExpenseDao,
  deleteExpenseDao,
  getExpenseByIdAndOrganizationDao,
  getExpensesByCategoryDao,
  getExpensesByMonthDao,
  getExpensesByOrganizationDao,
  getExpensesTotalByOrganizationDao,
  updateExpenseDao,
} from '@/db/repositories/expense-repository'
import {
  getActiveClientCountDao,
  getAvailableYearsDao,
  getAvgSurfaceDao,
  getClientsWithFinancialDataDao,
  getEstimatedRevenueByMonthDao,
  getEstimatedRevenueYtdDao,
  getMrrDao,
  getRevenueByMonthDao,
  getRevenueYtdDao,
} from '@/db/repositories/finance-repository'
import {getActiveOrganizationId} from '@/services/authentication/auth-service'
import {AuthorizationError} from '@/services/errors/authorization-error'

// ============================================================
// Types
// ============================================================

export type FinanceSummary = {
  mrr: number
  arr: number
  revenueYtd: number
  expensesYtd: number
  netMarginPercent: number
  activeClientCount: number
  arpc: number
  avgSurfaceM2: number
}

export type MonthlyFinanceData = {
  month: number
  monthLabel: string
  revenue: number
  expenses: number
}

export type ClientFinancialRow = {
  id: string
  firstName: string
  lastName: string
  surfaceM2: number | null
  monthlyAmount: number | null
  paymentType: string | null
  isActive: boolean
  createdAt: Date
  totalPaid: number
  lastVisitDate: Date | null
}

// ============================================================
// Finance Summary KPIs
// ============================================================

export const getFinanceSummaryService = async (
  from: Date,
  to: Date
): Promise<FinanceSummary> => {
  const organizationId = await getActiveOrganizationId()

  const [
    mrr,
    activeClientCount,
    avgSurfaceM2,
    invoiceRevenueYtd,
    estimatedRevenueYtd,
    expensesYtd,
  ] = await Promise.all([
    getMrrDao(organizationId),
    getActiveClientCountDao(organizationId),
    getAvgSurfaceDao(organizationId),
    getRevenueYtdDao(organizationId, from, to),
    getEstimatedRevenueYtdDao(organizationId, from, to),
    getExpensesTotalByOrganizationDao(organizationId, from, to),
  ])

  // Use invoice revenue if available, otherwise use estimated from monthlyAmount
  const revenueYtd =
    invoiceRevenueYtd > 0 ? invoiceRevenueYtd : estimatedRevenueYtd

  const arr = mrr * 12
  const arpc = activeClientCount > 0 ? mrr / activeClientCount : 0
  const netMarginPercent =
    revenueYtd > 0 ? ((revenueYtd - expensesYtd) / revenueYtd) * 100 : 0

  return {
    mrr,
    arr,
    revenueYtd,
    expensesYtd,
    netMarginPercent,
    activeClientCount,
    arpc,
    avgSurfaceM2,
  }
}

// ============================================================
// Individual KPIs (for main dashboard)
// ============================================================

export const getMrrService = async (): Promise<number> => {
  const organizationId = await getActiveOrganizationId()
  return getMrrDao(organizationId)
}

export const getEstimatedRevenueYtdService = async (
  from: Date,
  to: Date
): Promise<number> => {
  const organizationId = await getActiveOrganizationId()
  return getEstimatedRevenueYtdDao(organizationId, from, to)
}

// ============================================================
// Revenue by Month (for chart)
// ============================================================

const FRENCH_MONTHS = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
]

export const getRevenueByMonthService = async (
  year: number
): Promise<MonthlyFinanceData[]> => {
  const organizationId = await getActiveOrganizationId()

  const [revenueByMonth, estimatedByMonth, expensesByMonth] = await Promise.all(
    [
      getRevenueByMonthDao(organizationId, year),
      getEstimatedRevenueByMonthDao(organizationId, year),
      getExpensesByMonthDao(organizationId, year),
    ]
  )

  const revenueMap = new Map(revenueByMonth.map((r) => [r.month, r.total]))
  const estimatedMap = new Map(estimatedByMonth.map((r) => [r.month, r.total]))
  const expenseMap = new Map(expensesByMonth.map((e) => [e.month, e.total]))

  // Use invoice revenue if any month has data, otherwise fall back to estimated
  const hasInvoiceData = revenueByMonth.length > 0

  return Array.from({length: 12}, (_, i) => {
    const month = i + 1
    const invoiceRev = revenueMap.get(month) ?? 0
    const estimatedRev = estimatedMap.get(month) ?? 0
    return {
      month,
      monthLabel: FRENCH_MONTHS[i],
      revenue: hasInvoiceData ? invoiceRev : estimatedRev,
      expenses: expenseMap.get(month) ?? 0,
    }
  })
}

// ============================================================
// Client Financial Data (for table)
// ============================================================

export const getClientsFinancialService = async (
  from: Date,
  to: Date
): Promise<ClientFinancialRow[]> => {
  const organizationId = await getActiveOrganizationId()
  return getClientsWithFinancialDataDao(organizationId, from, to)
}

// ============================================================
// Expense CRUD Service
// ============================================================

export const createExpenseService = async (
  data: Omit<AddExpenseModel, 'organizationId'>
): Promise<ExpenseModel> => {
  const organizationId = await getActiveOrganizationId()
  return createExpenseDao({...data, organizationId})
}

export const updateExpenseService = async (
  id: string,
  data: Partial<AddExpenseModel>
): Promise<void> => {
  const organizationId = await getActiveOrganizationId()
  const existing = await getExpenseByIdAndOrganizationDao(id, organizationId)
  if (!existing) {
    throw new AuthorizationError('Dépense introuvable')
  }
  await updateExpenseDao({
    ...data,
    id,
    organizationId,
    date: data.date ?? existing.date,
    amount: data.amount ?? existing.amount,
    label: data.label ?? existing.label,
    category: data.category ?? existing.category,
  })
}

export const deleteExpenseService = async (id: string): Promise<void> => {
  const organizationId = await getActiveOrganizationId()
  const existing = await getExpenseByIdAndOrganizationDao(id, organizationId)
  if (!existing) {
    throw new AuthorizationError('Dépense introuvable')
  }
  await deleteExpenseDao(id)
}

export const getExpensesService = async (
  from?: Date,
  to?: Date
): Promise<ExpenseModel[]> => {
  const organizationId = await getActiveOrganizationId()
  return getExpensesByOrganizationDao(organizationId, from, to)
}

export const getExpensesByCategoryService = async (from: Date, to: Date) => {
  const organizationId = await getActiveOrganizationId()
  return getExpensesByCategoryDao(organizationId, from, to)
}

// ============================================================
// Year-over-year navigation
// ============================================================

export const getAvailableYearsService = async (): Promise<number[]> => {
  const organizationId = await getActiveOrganizationId()
  return getAvailableYearsDao(organizationId)
}
