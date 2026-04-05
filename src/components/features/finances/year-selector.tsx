'use client'

import {ChevronLeft, ChevronRight} from 'lucide-react'

import {Button} from '@/components/ui/button'

type Props = {
  year: number
  availableYears: number[]
  onChange: (year: number) => void
}

export function YearSelector({year, availableYears, onChange}: Props) {
  const minYear = Math.min(...availableYears, year)
  const maxYear = Math.max(...availableYears, year)

  return (
    <div className="flex items-center justify-center gap-3">
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10"
        disabled={year <= minYear}
        onClick={() => onChange(year - 1)}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <span className="min-w-[80px] text-center text-xl font-bold text-stone-900">
        {year}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10"
        disabled={year >= maxYear}
        onClick={() => onChange(year + 1)}
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  )
}
