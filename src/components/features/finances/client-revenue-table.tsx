'use client'

import {ArrowUpDown, Plus} from 'lucide-react'
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
import type {ClientFinancialRow} from '@/services/finance-service'

type Props = {
  clients: ClientFinancialRow[]
  onAddExpense: () => void
}

type SortKey =
  | 'name'
  | 'surfaceM2'
  | 'monthlyAmount'
  | 'totalPaid'
  | 'lastVisitDate'
type SortDir = 'asc' | 'desc'

function formatEur(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(date: Date | string | null): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d)
}

const paymentTypeLabels: Record<string, string> = {
  monthly: 'Mensuel',
  quarterly: 'Trimestriel',
  annual: 'Annuel',
}

const paymentTypeBadgeColors: Record<string, string> = {
  monthly: 'bg-blue-50 text-blue-700 border-blue-200',
  quarterly: 'bg-amber-50 text-amber-700 border-amber-200',
  annual: 'bg-emerald-50 text-emerald-700 border-emerald-200',
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

export function ClientRevenueTable({clients, onAddExpense}: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sorted = useMemo(() => {
    const arr = [...clients]
    arr.sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'name':
          cmp = `${a.lastName} ${a.firstName}`.localeCompare(
            `${b.lastName} ${b.firstName}`,
            'fr'
          )
          break
        case 'surfaceM2':
          cmp = (a.surfaceM2 ?? 0) - (b.surfaceM2 ?? 0)
          break
        case 'monthlyAmount':
          cmp = (a.monthlyAmount ?? 0) - (b.monthlyAmount ?? 0)
          break
        case 'totalPaid':
          cmp = a.totalPaid - b.totalPaid
          break
        case 'lastVisitDate': {
          const da = a.lastVisitDate ? new Date(a.lastVisitDate).getTime() : 0
          const db = b.lastVisitDate ? new Date(b.lastVisitDate).getTime() : 0
          cmp = da - db
          break
        }
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
    return arr
  }, [clients, sortKey, sortDir])

  return (
    <Card className="border-none bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold text-stone-800">
          Clients — Détail revenus
        </CardTitle>
        <Button size="sm" variant="outline" onClick={onAddExpense}>
          <Plus className="mr-1 h-4 w-4" />
          Dépense
        </Button>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        {sorted.length === 0 ? (
          <div className="py-12 text-center text-stone-400">
            Aucun client trouvé pour les filtres sélectionnés.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <SortButton label="Client" field="name" onSort={handleSort} />
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  <SortButton
                    label="Surface"
                    field="surfaceM2"
                    onSort={handleSort}
                  />
                </TableHead>
                <TableHead>
                  <SortButton
                    label="Mensuel"
                    field="monthlyAmount"
                    onSort={handleSort}
                  />
                </TableHead>
                <TableHead className="hidden sm:table-cell">Paiement</TableHead>
                <TableHead>
                  <SortButton
                    label="Encaissé"
                    field="totalPaid"
                    onSort={handleSort}
                  />
                </TableHead>
                <TableHead className="hidden md:table-cell">Statut</TableHead>
                <TableHead className="hidden lg:table-cell">
                  <SortButton
                    label="Dernière visite"
                    field="lastVisitDate"
                    onSort={handleSort}
                  />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">
                    {client.lastName} {client.firstName}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {client.surfaceM2 ? `${client.surfaceM2} m²` : '—'}
                  </TableCell>
                  <TableCell>
                    {client.monthlyAmount
                      ? formatEur(client.monthlyAmount)
                      : '—'}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {client.paymentType ? (
                      <Badge
                        variant="outline"
                        className={
                          paymentTypeBadgeColors[client.paymentType] ?? ''
                        }
                      >
                        {paymentTypeLabels[client.paymentType] ??
                          client.paymentType}
                      </Badge>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatEur(client.totalPaid)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge
                      variant="outline"
                      className={
                        client.isActive
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-red-200 bg-red-50 text-red-700'
                      }
                    >
                      {client.isActive ? 'Actif' : 'Inactif'}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {formatDate(client.lastVisitDate)}
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
