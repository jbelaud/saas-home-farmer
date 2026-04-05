'use client'

import {
  BarChart3,
  Euro,
  Minus,
  Percent,
  Sprout,
  TrendingUp,
  Users,
} from 'lucide-react'

import {Card, CardContent} from '@/components/ui/card'
import type {FinanceSummary} from '@/services/finance-service'

type Props = {
  summary: FinanceSummary
}

function formatEur(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatEurDecimal(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

const kpiConfig = [
  {
    key: 'mrr' as const,
    label: 'MRR',
    icon: Euro,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    format: formatEur,
  },
  {
    key: 'arr' as const,
    label: 'ARR',
    icon: TrendingUp,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    format: formatEur,
  },
  {
    key: 'revenueYtd' as const,
    label: 'CA encaissé',
    icon: BarChart3,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    format: formatEurDecimal,
  },
  {
    key: 'expensesYtd' as const,
    label: 'Dépenses',
    icon: Minus,
    color: 'text-red-600',
    bg: 'bg-red-50',
    format: formatEurDecimal,
  },
  {
    key: 'netMarginPercent' as const,
    label: 'Marge nette',
    icon: Percent,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    format: (v: number) => `${v.toFixed(1)} %`,
  },
  {
    key: 'activeClientCount' as const,
    label: 'Clients actifs',
    icon: Users,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    format: (v: number) => String(v),
  },
  {
    key: 'arpc' as const,
    label: 'ARPC',
    icon: Euro,
    color: 'text-stone-600',
    bg: 'bg-stone-100',
    format: formatEur,
  },
  {
    key: 'avgSurfaceM2' as const,
    label: 'Surface moy.',
    icon: Sprout,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    format: (v: number) => `${Math.round(v)} m²`,
  },
]

export function FinanceKpiCards({summary}: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {kpiConfig.map((kpi) => {
        const Icon = kpi.icon
        const value = summary[kpi.key]
        return (
          <Card key={kpi.key} className="border-none bg-white shadow-sm">
            <CardContent className="p-3">
              <div className="mb-1 flex items-center gap-1.5">
                <div className={`rounded-md p-1 ${kpi.bg}`}>
                  <Icon className={`h-3.5 w-3.5 ${kpi.color}`} />
                </div>
                <p className="text-muted-foreground text-[10px] font-bold uppercase">
                  {kpi.label}
                </p>
              </div>
              <p className="text-lg font-bold text-stone-900">
                {kpi.format(value)}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
