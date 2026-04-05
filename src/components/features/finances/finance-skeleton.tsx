'use client'

import {Card, CardContent, CardHeader} from '@/components/ui/card'
import {Skeleton} from '@/components/ui/skeleton'

type Props = {
  type: 'kpi' | 'chart' | 'table'
}

function KpiSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {Array.from({length: 8}).map((_, i) => (
        <Card key={i} className="border-none bg-white shadow-sm">
          <CardContent className="p-3">
            <div className="mb-2 flex items-center gap-1.5">
              <Skeleton className="h-6 w-6 rounded-md" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-6 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ChartSkeleton() {
  return (
    <Card className="border-none bg-white shadow-sm">
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full rounded-lg md:h-[400px]" />
      </CardContent>
    </Card>
  )
}

function TableSkeleton() {
  return (
    <Card className="border-none bg-white shadow-sm">
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-48" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({length: 6}).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="hidden h-4 w-20 md:block" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function FinanceSkeleton({type}: Props) {
  switch (type) {
    case 'kpi':
      return <KpiSkeleton />
    case 'chart':
      return <ChartSkeleton />
    case 'table':
      return <TableSkeleton />
  }
}
