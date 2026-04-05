import {NextRequest, NextResponse} from 'next/server'

import {withUserAuth} from '@/lib/api-auth'
import {getExpensesByCategoryService} from '@/services/facades/finance-service-facade'

export const GET = withUserAuth(async (request: NextRequest) => {
  try {
    const {searchParams} = new URL(request.url)
    const fromParam = searchParams.get('from')
    const toParam = searchParams.get('to')

    const now = new Date()
    const from = fromParam
      ? new Date(fromParam)
      : new Date(now.getFullYear(), 0, 1)
    const to = toParam ? new Date(toParam) : now

    const data = await getExpensesByCategoryService(from, to)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Erreur GET /api/finances/expenses/by-category:', error)
    return NextResponse.json({error: 'Erreur serveur'}, {status: 500})
  }
})
