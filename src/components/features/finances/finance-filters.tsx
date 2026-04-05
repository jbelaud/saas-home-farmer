'use client'

import {Filter} from 'lucide-react'
import {useCallback} from 'react'

import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {Card, CardContent} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type FinanceFilterState = {
  dateRange: {from: Date; to: Date}
  paymentTypes: string[]
  clientStatuses: string[]
  amountRange: {min: number; max: number}
}

type Props = {
  filters: FinanceFilterState
  onFiltersChange: (filters: FinanceFilterState) => void
  year: number
}

const DATE_PRESETS = [
  {label: 'Ce mois', value: 'this-month'},
  {label: 'Ce trimestre', value: 'this-quarter'},
  {label: 'Cette année', value: 'this-year'},
] as const

function getDateRange(preset: string, year: number): {from: Date; to: Date} {
  const now = new Date()
  switch (preset) {
    case 'this-month':
      return {
        from: new Date(now.getFullYear(), now.getMonth(), 1),
        to: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59),
      }
    case 'this-quarter': {
      const q = Math.floor(now.getMonth() / 3)
      return {
        from: new Date(now.getFullYear(), q * 3, 1),
        to: new Date(now.getFullYear(), q * 3 + 3, 0, 23, 59, 59),
      }
    }
    case 'this-year':
    default:
      return {
        from: new Date(year, 0, 1),
        to: new Date(year, 11, 31, 23, 59, 59),
      }
  }
}

const PAYMENT_TYPE_OPTIONS = [
  {label: 'Mensuel', value: 'monthly'},
  {label: 'Trimestriel', value: 'quarterly'},
  {label: 'Annuel', value: 'annual'},
]

const STATUS_OPTIONS = [
  {label: 'Actif', value: 'active'},
  {label: 'Inactif', value: 'churned'},
]

export function FinanceFilters({filters, onFiltersChange, year}: Props) {
  const handleDatePreset = useCallback(
    (preset: string) => {
      const range = getDateRange(preset, year)
      onFiltersChange({...filters, dateRange: range})
    },
    [filters, onFiltersChange, year]
  )

  const togglePaymentType = useCallback(
    (value: string) => {
      const current = filters.paymentTypes
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
      onFiltersChange({...filters, paymentTypes: next})
    },
    [filters, onFiltersChange]
  )

  const toggleStatus = useCallback(
    (value: string) => {
      const current = filters.clientStatuses
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
      onFiltersChange({...filters, clientStatuses: next})
    },
    [filters, onFiltersChange]
  )

  const clearFilters = useCallback(() => {
    onFiltersChange({
      dateRange: {
        from: new Date(year, 0, 1),
        to: new Date(year, 11, 31, 23, 59, 59),
      },
      paymentTypes: [],
      clientStatuses: [],
      amountRange: {min: 0, max: 10000},
    })
  }, [onFiltersChange, year])

  const hasActiveFilters =
    filters.paymentTypes.length > 0 || filters.clientStatuses.length > 0

  return (
    <Card className="border-none bg-white shadow-sm">
      <CardContent className="flex flex-wrap items-center gap-3 p-3">
        <Filter className="h-4 w-4 text-stone-400" />

        {/* Date range preset */}
        <Select onValueChange={handleDatePreset} defaultValue="this-year">
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue placeholder="Période" />
          </SelectTrigger>
          <SelectContent>
            {DATE_PRESETS.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Payment type toggle badges */}
        <div className="flex flex-wrap gap-1.5">
          {PAYMENT_TYPE_OPTIONS.map((opt) => {
            const isActive = filters.paymentTypes.includes(opt.value)
            return (
              <Badge
                key={opt.value}
                variant={isActive ? 'default' : 'outline'}
                className={`cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-stone-100'
                }`}
                onClick={() => togglePaymentType(opt.value)}
              >
                {opt.label}
              </Badge>
            )
          })}
        </div>

        {/* Status toggle badges */}
        <div className="flex flex-wrap gap-1.5">
          {STATUS_OPTIONS.map((opt) => {
            const isActive = filters.clientStatuses.includes(opt.value)
            return (
              <Badge
                key={opt.value}
                variant={isActive ? 'default' : 'outline'}
                className={`cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-stone-100'
                }`}
                onClick={() => toggleStatus(opt.value)}
              >
                {opt.label}
              </Badge>
            )
          })}
        </div>

        {/* Clear */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-stone-500"
            onClick={clearFilters}
          >
            Effacer
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
