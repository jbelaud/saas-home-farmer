'use client'

import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'

import type {ExpenseModel} from '@/db/models/farmer-model'
import type {
  ClientFinancialRow,
  FinanceSummary,
  MonthlyFinanceData,
} from '@/services/finance-service'

// ============================================================
// Helpers
// ============================================================

function buildDateParams(from: Date, to: Date): string {
  return `from=${from.toISOString()}&to=${to.toISOString()}`
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Erreur ${res.status}: ${res.statusText}`)
  }
  return res.json()
}

// ============================================================
// Query Keys
// ============================================================

export const financeKeys = {
  all: ['finances'] as const,
  summary: (from: string, to: string) =>
    [...financeKeys.all, 'summary', from, to] as const,
  revenueByMonth: (year: number) =>
    [...financeKeys.all, 'revenue-by-month', year] as const,
  clients: (from: string, to: string) =>
    [...financeKeys.all, 'clients', from, to] as const,
  expenses: (from?: string, to?: string) =>
    [...financeKeys.all, 'expenses', from, to] as const,
  expensesByCategory: (from: string, to: string) =>
    [...financeKeys.all, 'expenses-by-category', from, to] as const,
}

const STALE_TIME = 5 * 60 * 1000 // 5 minutes — offline-first friendly

// ============================================================
// Queries
// ============================================================

export function useFinanceSummary(from: Date, to: Date) {
  return useQuery<FinanceSummary>({
    queryKey: financeKeys.summary(from.toISOString(), to.toISOString()),
    queryFn: () =>
      fetchJson(`/api/finances/summary?${buildDateParams(from, to)}`),
    staleTime: STALE_TIME,
  })
}

export function useRevenueByMonth(year: number) {
  return useQuery<MonthlyFinanceData[]>({
    queryKey: financeKeys.revenueByMonth(year),
    queryFn: () => fetchJson(`/api/finances/revenue-by-month?year=${year}`),
    staleTime: STALE_TIME,
  })
}

export function useClientsFinancial(from: Date, to: Date) {
  return useQuery<ClientFinancialRow[]>({
    queryKey: financeKeys.clients(from.toISOString(), to.toISOString()),
    queryFn: () =>
      fetchJson(`/api/finances/clients?${buildDateParams(from, to)}`),
    staleTime: STALE_TIME,
  })
}

export function useExpenses(from?: Date, to?: Date) {
  const params = new URLSearchParams()
  if (from) params.set('from', from.toISOString())
  if (to) params.set('to', to.toISOString())
  const qs = params.toString()

  return useQuery<ExpenseModel[]>({
    queryKey: financeKeys.expenses(from?.toISOString(), to?.toISOString()),
    queryFn: () => fetchJson(`/api/finances/expenses${qs ? `?${qs}` : ''}`),
    staleTime: STALE_TIME,
  })
}

export function useExpensesByCategory(from: Date, to: Date) {
  return useQuery<{category: string; total: number}[]>({
    queryKey: financeKeys.expensesByCategory(
      from.toISOString(),
      to.toISOString()
    ),
    queryFn: () =>
      fetchJson(
        `/api/finances/expenses/by-category?${buildDateParams(from, to)}`
      ),
    staleTime: STALE_TIME,
  })
}

// ============================================================
// Mutations
// ============================================================

export function useCreateExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      date: string
      amount: number
      label: string
      category: string
    }) => {
      const res = await fetch('/api/finances/expenses', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Erreur lors de la création')
      return res.json() as Promise<ExpenseModel>
    },
    onSuccess: () => {
      qc.invalidateQueries({queryKey: financeKeys.all})
    },
  })
}

export function useUpdateExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string
      date?: string
      amount?: number
      label?: string
      category?: string
    }) => {
      const res = await fetch(`/api/finances/expenses/${id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Erreur lors de la mise à jour')
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({queryKey: financeKeys.all})
    },
  })
}

export function useDeleteExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/finances/expenses/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Erreur lors de la suppression')
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({queryKey: financeKeys.all})
    },
  })
}
