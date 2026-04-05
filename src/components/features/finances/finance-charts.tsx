'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import type {MonthlyFinanceData} from '@/services/finance-service'

type Props = {
  data: MonthlyFinanceData[]
  year: number
}

function formatEur(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: {value: number; name: string; color: string}[]
  label?: string
}) {
  if (!active || !payload) return null
  return (
    <div className="rounded-lg border bg-white p-3 shadow-md">
      <p className="mb-1 text-sm font-bold text-stone-700 capitalize">
        {label}
      </p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-sm" style={{color: entry.color}}>
          {entry.name === 'revenue' ? 'Revenus' : 'Dépenses'} :{' '}
          {formatEur(entry.value)}
        </p>
      ))}
    </div>
  )
}

export function FinanceCharts({data, year}: Props) {
  return (
    <Card className="border-none bg-white shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold text-stone-800">
          Revenus vs Dépenses — {year}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full md:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{top: 5, right: 5, left: -10, bottom: 5}}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis
                dataKey="monthLabel"
                tick={{fontSize: 11}}
                tickFormatter={(v: string) => v.slice(0, 3)}
                stroke="#a8a29e"
              />
              <YAxis
                tick={{fontSize: 11}}
                tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                stroke="#a8a29e"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value: string) =>
                  value === 'revenue' ? 'Revenus' : 'Dépenses'
                }
              />
              <Bar
                dataKey="revenue"
                fill="#059669"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
              <Bar
                dataKey="expenses"
                fill="#dc2626"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
