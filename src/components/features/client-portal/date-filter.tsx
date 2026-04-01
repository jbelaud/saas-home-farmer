'use client'

import {ChevronLeft, ChevronRight, Filter} from 'lucide-react'
import {usePathname, useRouter, useSearchParams} from 'next/navigation'
import {useCallback} from 'react'

const MONTHS = [
  'Tous',
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
]

type DateFilterProps = {
  availableYears: number[]
}

export function DateFilter({availableYears}: DateFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentYear = searchParams.get('year')
    ? Number(searchParams.get('year'))
    : null
  const currentMonth = searchParams.get('month')
    ? Number(searchParams.get('month'))
    : null

  const updateFilter = useCallback(
    (year: number | null, month: number | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (year) {
        params.set('year', String(year))
      } else {
        params.delete('year')
      }
      if (month) {
        params.set('month', String(month))
      } else {
        params.delete('month')
      }
      router.push(`${pathname}?${params.toString()}`, {scroll: false})
    },
    [router, pathname, searchParams]
  )

  const handleYearChange = (direction: 'prev' | 'next') => {
    const sortedYears = [...availableYears].sort((a, b) => b - a)
    if (sortedYears.length === 0) return

    if (!currentYear) {
      updateFilter(sortedYears[0], currentMonth)
      return
    }

    const idx = sortedYears.indexOf(currentYear)
    if (direction === 'prev' && idx < sortedYears.length - 1) {
      updateFilter(sortedYears[idx + 1], currentMonth)
    } else if (direction === 'next' && idx > 0) {
      updateFilter(sortedYears[idx - 1], currentMonth)
    }
  }

  const handleMonthSelect = (monthIndex: number) => {
    if (monthIndex === 0) {
      updateFilter(currentYear, null)
    } else {
      if (!currentYear) {
        updateFilter(new Date().getFullYear(), monthIndex)
      } else {
        updateFilter(currentYear, monthIndex)
      }
    }
  }

  const handleClearFilters = () => {
    updateFilter(null, null)
  }

  const hasFilters = currentYear !== null || currentMonth !== null

  return (
    <div className="space-y-3">
      {/* Year selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-stone-400" />
          <span className="text-sm font-medium text-stone-600">Filtrer</span>
        </div>
        {hasFilters && (
          <button
            onClick={handleClearFilters}
            className="text-xs font-medium text-emerald-700 hover:underline"
          >
            Tout afficher
          </button>
        )}
      </div>

      {/* Year navigation */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => handleYearChange('prev')}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 text-stone-500 transition-colors hover:bg-stone-100 active:bg-stone-200"
          disabled={
            currentYear !== null && currentYear <= Math.min(...availableYears)
          }
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="min-w-[80px] text-center text-lg font-bold text-stone-900">
          {currentYear ?? 'Toutes'}
        </span>
        <button
          onClick={() => handleYearChange('next')}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 text-stone-500 transition-colors hover:bg-stone-100 active:bg-stone-200"
          disabled={
            currentYear !== null && currentYear >= Math.max(...availableYears)
          }
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Month pills — only visible when a year is selected */}
      {currentYear && (
        <div className="flex flex-wrap gap-2">
          {MONTHS.map((label, idx) => {
            const isActive =
              idx === 0 ? currentMonth === null : currentMonth === idx
            return (
              <button
                key={idx}
                onClick={() => handleMonthSelect(idx)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'border border-stone-200 bg-white text-stone-600 hover:border-stone-400'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
