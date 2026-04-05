import {NextRequest, NextResponse} from 'next/server'

import {withUserAuth} from '@/lib/api-auth'
import {getRevenueByMonthService} from '@/services/facades/finance-service-facade'

export const GET = withUserAuth(async (request: NextRequest) => {
  try {
    const {searchParams} = new URL(request.url)
    const yearParam = searchParams.get('year')
    const year = yearParam ? Number(yearParam) : new Date().getFullYear()

    if (Number.isNaN(year)) {
      return NextResponse.json(
        {error: 'Paramètre year invalide'},
        {status: 400}
      )
    }

    const data = await getRevenueByMonthService(year)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Erreur GET /api/finances/revenue-by-month:', error)
    return NextResponse.json({error: 'Erreur serveur'}, {status: 500})
  }
})
