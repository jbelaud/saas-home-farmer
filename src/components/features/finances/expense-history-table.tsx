'use client'

import {ArrowUpDown, Pencil, Trash2} from 'lucide-react'
import {useMemo, useState} from 'react'

import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type {ExpenseModel} from '@/db/models/farmer-model'

type Props = {
  expenses: ExpenseModel[]
  isLoading: boolean
  onEdit: (expense: ExpenseModel) => void
  onDelete: (id: string) => void
}

type SortKey = 'date' | 'label' | 'category' | 'amount'
type SortDir = 'asc' | 'desc'

const CATEGORY_LABELS: Record<string, string> = {
  seeds: 'Semences',
  seedlings: 'Plants',
  tools: 'Outils',
  transport: 'Transport',
  platform_fees: 'Frais plateforme',
  marketing: 'Marketing',
  other: 'Autre',
}

const CATEGORY_COLORS: Record<string, string> = {
  seeds: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  seedlings: 'bg-green-50 text-green-700 border-green-200',
  tools: 'bg-blue-50 text-blue-700 border-blue-200',
  transport: 'bg-amber-50 text-amber-700 border-amber-200',
  platform_fees: 'bg-purple-50 text-purple-700 border-purple-200',
  marketing: 'bg-pink-50 text-pink-700 border-pink-200',
  other: 'bg-stone-100 text-stone-600 border-stone-200',
}

function formatEur(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d)
}

function SortButton({
  label,
  field,
  onSort,
}: {
  label: string
  field: SortKey
  onSort: (key: SortKey) => void
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 text-xs font-bold uppercase"
      onClick={() => onSort(field)}
    >
      {label}
      <ArrowUpDown className="ml-1 h-3 w-3" />
    </Button>
  )
}

export function ExpenseHistoryTable({
  expenses,
  isLoading,
  onEdit,
  onDelete,
}: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sorted = useMemo(() => {
    const arr = [...expenses]
    arr.sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'date': {
          const da = new Date(a.date).getTime()
          const db = new Date(b.date).getTime()
          cmp = da - db
          break
        }
        case 'label':
          cmp = a.label.localeCompare(b.label, 'fr')
          break
        case 'category':
          cmp = a.category.localeCompare(b.category, 'fr')
          break
        case 'amount':
          cmp = a.amount - b.amount
          break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
    return arr
  }, [expenses, sortKey, sortDir])

  const totalExpenses = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  )

  if (isLoading) {
    return (
      <Card className="border-none bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold text-stone-800">
            Historique des dépenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center text-stone-400">Chargement...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-none bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold text-stone-800">
          Historique des dépenses
        </CardTitle>
        <span className="text-sm font-semibold text-red-600">
          Total : {formatEur(totalExpenses)}
        </span>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        {sorted.length === 0 ? (
          <div className="py-12 text-center text-stone-400">
            Aucune dépense enregistrée pour cette période.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <SortButton label="Date" field="date" onSort={handleSort} />
                </TableHead>
                <TableHead>
                  <SortButton
                    label="Libellé"
                    field="label"
                    onSort={handleSort}
                  />
                </TableHead>
                <TableHead className="hidden sm:table-cell">
                  <SortButton
                    label="Catégorie"
                    field="category"
                    onSort={handleSort}
                  />
                </TableHead>
                <TableHead>
                  <SortButton
                    label="Montant"
                    field="amount"
                    onSort={handleSort}
                  />
                </TableHead>
                <TableHead className="w-[80px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="text-sm text-stone-600">
                    {formatDate(expense.date)}
                  </TableCell>
                  <TableCell className="font-medium">{expense.label}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge
                      variant="outline"
                      className={CATEGORY_COLORS[expense.category] ?? ''}
                    >
                      {CATEGORY_LABELS[expense.category] ?? expense.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-red-600">
                    {formatEur(expense.amount)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEdit(expense)}
                      >
                        <Pencil className="h-3.5 w-3.5 text-stone-400" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onDelete(expense.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-400" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
