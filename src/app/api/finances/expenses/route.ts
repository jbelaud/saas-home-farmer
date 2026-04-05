import {NextRequest, NextResponse} from 'next/server'
import {z} from 'zod'

import {
  createExpenseService,
  getExpensesService,
} from '@/services/facades/finance-service-facade'

const createExpenseSchema = z.object({
  date: z.string().transform((s) => new Date(s)),
  amount: z.number().positive('Le montant doit être positif'),
  label: z.string().min(1, 'Le libellé est requis'),
  category: z.enum([
    'seeds',
    'seedlings',
    'tools',
    'transport',
    'platform_fees',
    'marketing',
    'other',
  ]),
})

export async function GET(request: NextRequest) {
  try {
    const {searchParams} = new URL(request.url)
    const fromParam = searchParams.get('from')
    const toParam = searchParams.get('to')

    const from = fromParam ? new Date(fromParam) : undefined
    const to = toParam ? new Date(toParam) : undefined

    const expenses = await getExpensesService(from, to)
    return NextResponse.json(expenses)
  } catch (error) {
    console.error('Erreur GET /api/finances/expenses:', error)
    return NextResponse.json({error: 'Erreur serveur'}, {status: 500})
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = createExpenseSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: parsed.error.issues.map((i) => ({
            field: String(i.path[0]),
            message: i.message,
          })),
        },
        {status: 400}
      )
    }

    const expense = await createExpenseService(parsed.data)
    return NextResponse.json(expense, {status: 201})
  } catch (error) {
    console.error('Erreur POST /api/finances/expenses:', error)
    return NextResponse.json({error: 'Erreur serveur'}, {status: 500})
  }
}
