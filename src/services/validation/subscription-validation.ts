import {z} from 'zod'

export const baseSubscriptionServiceSchema = z.object({
  referenceId: z.string({
    message: 'Le referenceId est requis.',
  }),
})

export const createSubscriptionServiceSchema =
  baseSubscriptionServiceSchema.extend({
    plan: z.string({
      message: 'Le plan est requis.',
    }),
    status: z.string().default('active'),
    quantity: z
      .number()
      .min(1, {
        message: 'La quantité doit être supérieure à 0.',
      })
      .default(1)
      .optional(),
    periodStart: z
      .date()
      .default(() => new Date())
      .optional(),
    periodEnd: z.date().optional(),
    stripeCustomerId: z.string().optional(),
    stripeSubscriptionId: z.string().optional(),
    cancelAtPeriodEnd: z.boolean().optional(),
    seats: z.number().optional(),
    trialStart: z.date().optional(),
    trialEnd: z.date().optional(),
  })

export const updateSubscriptionServiceSchema =
  baseSubscriptionServiceSchema.extend({
    id: z.string().uuid(),
    plan: z.string().optional(),
    status: z.string().optional(),
    quantity: z.number().min(1).optional(),
    periodStart: z.date().optional(),
    periodEnd: z.date().optional(),
    stripeCustomerId: z.string().optional(),
    stripeSubscriptionId: z.string().optional(),
    cancelAtPeriodEnd: z.boolean().optional(),
    seats: z.number().optional(),
    trialStart: z.date().optional(),
    trialEnd: z.date().optional(),
  })
