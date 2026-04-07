'use client'

import {useRouter, useSearchParams} from 'next/navigation'
import {useCallback, useMemo, useState} from 'react'
import {toast} from 'sonner'

import {
  useClientsFinancial,
  useDeleteExpense,
  useExpenses,
  useExpensesByCategory,
  useFinanceSummary,
  useRevenueByMonth,
} from '@/components/hooks/client/use-finance-queries'
import type {ExpenseModel} from '@/db/models/farmer-model'

import {ClientRevenueTable} from './client-revenue-table'
import {ExpenseHistoryTable} from './expense-history-table'
import {ExpenseSheet} from './expense-sheet'
import {FinanceCharts} from './finance-charts'
import {FinanceFilters, type FinanceFilterState} from './finance-filters'
import {FinanceKpiCards} from './finance-kpi-cards'
import {FinancePdfExportButton} from './finance-pdf-export'
import {FinanceSkeleton} from './finance-skeleton'
import {YearSelector} from './year-selector'

type Props = {
  availableYears: number[]
  initialYear: number
  userName: string
  companyName: string
}

export function FinancesDashboardClient({
  availableYears,
  initialYear,
  userName,
  companyName,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Year state from URL
  const year = Number(searchParams.get('year')) || initialYear

  const handleYearChange = useCallback(
    (newYear: number) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('year', String(newYear))
      router.push(`?${params.toString()}`, {scroll: false})
    },
    [router, searchParams]
  )

  // Filter state
  const [filters, setFilters] = useState<FinanceFilterState>({
    dateRange: {
      from: new Date(year, 0, 1),
      to: new Date(year, 11, 31, 23, 59, 59),
    },
    paymentTypes: [],
    clientStatuses: [],
    amountRange: {min: 0, max: 10000},
  })

  // Update date range when year changes
  const from = useMemo(() => new Date(year, 0, 1), [year])
  const to = useMemo(() => new Date(year, 11, 31, 23, 59, 59), [year])

  // Queries
  const summaryQuery = useFinanceSummary(
    filters.dateRange.from ?? from,
    filters.dateRange.to ?? to
  )
  const revenueQuery = useRevenueByMonth(year)
  const clientsQuery = useClientsFinancial(
    filters.dateRange.from ?? from,
    filters.dateRange.to ?? to
  )
  const expensesQuery = useExpenses(
    filters.dateRange.from ?? from,
    filters.dateRange.to ?? to
  )
  const expensesByCategoryQuery = useExpensesByCategory(
    filters.dateRange.from ?? from,
    filters.dateRange.to ?? to
  )

  // Filter clients on the client side
  const filteredClients = useMemo(() => {
    if (!clientsQuery.data) return []
    let result = clientsQuery.data

    if (filters.paymentTypes.length > 0) {
      result = result.filter(
        (c) => c.paymentType && filters.paymentTypes.includes(c.paymentType)
      )
    }

    if (filters.clientStatuses.length > 0) {
      result = result.filter((c) => {
        const status = c.isActive ? 'active' : 'churned'
        return filters.clientStatuses.includes(status)
      })
    }

    if (filters.amountRange.min > 0) {
      result = result.filter(
        (c) => (c.monthlyAmount ?? 0) >= filters.amountRange.min
      )
    }

    if (filters.amountRange.max < 10000) {
      result = result.filter(
        (c) => (c.monthlyAmount ?? 0) <= filters.amountRange.max
      )
    }

    return result
  }, [clientsQuery.data, filters])

  // Expense sheet state
  const [expenseSheetOpen, setExpenseSheetOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<ExpenseModel | null>(
    null
  )
  const deleteMutation = useDeleteExpense()

  const handleEditExpense = useCallback((expense: ExpenseModel) => {
    setEditingExpense(expense)
    setExpenseSheetOpen(true)
  }, [])

  const handleDeleteExpense = useCallback(
    async (id: string) => {
      try {
        await deleteMutation.mutateAsync(id)
        toast.success('Dépense supprimée')
      } catch {
        toast.error('Erreur lors de la suppression')
      }
    },
    [deleteMutation]
  )

  return (
    <div className="space-y-6">
      {/* Year selector + PDF export */}
      <div className="flex items-center justify-between">
        <YearSelector
          year={year}
          availableYears={availableYears}
          onChange={handleYearChange}
        />
        <FinancePdfExportButton
          summary={summaryQuery.data}
          chartData={revenueQuery.data}
          clients={filteredClients}
          expensesByCategory={expensesByCategoryQuery.data ?? []}
          userName={userName}
          companyName={companyName}
          year={year}
          from={filters.dateRange.from ?? from}
          to={filters.dateRange.to ?? to}
        />
      </div>

      {/* Filters */}
      <FinanceFilters
        filters={filters}
        onFiltersChange={setFilters}
        year={year}
      />

      {/* KPI Cards */}
      {summaryQuery.isLoading ? (
        <FinanceSkeleton type="kpi" />
      ) : summaryQuery.data ? (
        <FinanceKpiCards summary={summaryQuery.data} />
      ) : null}

      {/* Revenue Chart */}
      {revenueQuery.isLoading ? (
        <FinanceSkeleton type="chart" />
      ) : revenueQuery.data ? (
        <FinanceCharts data={revenueQuery.data} year={year} />
      ) : null}

      {/* Client Revenue Table */}
      {clientsQuery.isLoading ? (
        <FinanceSkeleton type="table" />
      ) : (
        <ClientRevenueTable
          clients={filteredClients}
          onAddExpense={() => setExpenseSheetOpen(true)}
        />
      )}

      {/* Expense History Table */}
      <ExpenseHistoryTable
        expenses={expensesQuery.data ?? []}
        isLoading={expensesQuery.isLoading}
        onEdit={handleEditExpense}
        onDelete={handleDeleteExpense}
      />

      {/* Expense Sheet */}
      <ExpenseSheet
        open={expenseSheetOpen}
        onOpenChange={(open) => {
          setExpenseSheetOpen(open)
          if (!open) setEditingExpense(null)
        }}
        expenses={expensesQuery.data ?? []}
        isLoading={expensesQuery.isLoading}
        initialExpense={editingExpense}
      />
    </div>
  )
}
