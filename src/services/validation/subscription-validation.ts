import {z} from 'zod'

export const baseSubscriptionServiceSchema = z.object({
  userId: z.string().uuid({
    message: "L'ID de l'utilisateur n'est pas valide.",
  }),
})

export const createSubscriptionServiceSchema =
  baseSubscriptionServiceSchema.extend({
    plan: z.enum(['CODEMAIL_FREE', 'CODEMAIL_PRO', 'CODEMAIL_LIFETIME'], {
      message:
        'Le plan doit être CODEMAIL_FREE, CODEMAIL_PRO ou CODEMAIL_LIFETIME.',
    }),
    subscriptionType: z.enum(['subscription', 'payment'], {
      message: 'Le type doit être subscription ou payment.',
    }),
    quantity: z
      .number()
      .min(1, {
        message: 'La quantité doit être supérieure à 0.',
      })
      .default(1),
    currentPeriodStart: z.date().default(() => new Date()),
    currentPeriodEnd: z.date().default(() => {
      const date = new Date()
      date.setMonth(date.getMonth() + 1)
      return date
    }),
  })

export const updateSubscriptionServiceSchema =
  baseSubscriptionServiceSchema.extend({
    id: z.string().uuid(),
    plan: z
      .enum(['CODEMAIL_FREE', 'CODEMAIL_PRO', 'CODEMAIL_LIFETIME'])
      .optional(),
    status: z
      .enum(['active', 'grace_period', 'canceled', 'expired'])
      .optional(),
  })
