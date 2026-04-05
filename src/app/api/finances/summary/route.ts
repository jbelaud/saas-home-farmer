import {NextRequest, NextResponse} from 'next/server'

import {getFinanceSummaryService} from '@/services/facades/finance-service-facade'

export async function GET(request: NextRequest) {
  try {
    const {searchParams} = new URL(request.url)
    const fromParam = searchParams.get('from')
    const toParam = searchParams.get('to')

    const now = new Date()
    const from = fromParam
      ? new Date(fromParam)
      : new Date(now.getFullYear(), 0, 1)
    const to = toParam ? new Date(toParam) : now

    const summary = await getFinanceSummaryService(from, to)
    return NextResponse.json(summary)
  } catch (error) {
    console.error('Erreur GET /api/finances/summary:', error)
    return NextResponse.json({error: 'Erreur serveur'}, {status: 500})
  }
}
