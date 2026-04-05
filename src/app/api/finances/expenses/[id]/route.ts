import {NextRequest, NextResponse} from 'next/server'
import {z} from 'zod'

import {withDynamicUserAuth} from '@/lib/api-auth'
import {
  deleteExpenseService,
  updateExpenseService,
} from '@/services/facades/finance-service-facade'

const updateExpenseSchema = z.object({
  date: z
    .string()
    .transform((s) => new Date(s))
    .optional(),
  amount: z.number().positive('Le montant doit être positif').optional(),
  label: z.string().min(1, 'Le libellé est requis').optional(),
  category: z
    .enum([
      'seeds',
      'seedlings',
      'tools',
      'transport',
      'platform_fees',
      'marketing',
      'other',
    ])
    .optional(),
})

export const PUT = withDynamicUserAuth(
  async (
    request: NextRequest,
    _authUser,
    {params}: {params: Promise<Record<string, string>>}
  ) => {
    try {
      const {id} = await params
      const body = await request.json()
      const parsed = updateExpenseSchema.safeParse(body)

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

      await updateExpenseService(id, parsed.data)
      return NextResponse.json({success: true})
    } catch (error) {
      const {id} = await params
      console.error(`Erreur PUT /api/finances/expenses/${id}:`, error)
      if (error instanceof Error && error.message === 'Dépense introuvable') {
        return NextResponse.json({error: 'Dépense introuvable'}, {status: 404})
      }
      return NextResponse.json({error: 'Erreur serveur'}, {status: 500})
    }
  }
)

export const DELETE = withDynamicUserAuth(
  async (
    _request: NextRequest,
    _authUser,
    {params}: {params: Promise<Record<string, string>>}
  ) => {
    try {
      const {id} = await params
      await deleteExpenseService(id)
      return NextResponse.json({success: true})
    } catch (error) {
      const {id} = await params
      console.error(`Erreur DELETE /api/finances/expenses/${id}:`, error)
      if (error instanceof Error && error.message === 'Dépense introuvable') {
        return NextResponse.json({error: 'Dépense introuvable'}, {status: 404})
      }
      return NextResponse.json({error: 'Erreur serveur'}, {status: 500})
    }
  }
)
