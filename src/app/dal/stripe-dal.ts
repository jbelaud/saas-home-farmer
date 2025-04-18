import 'server-only'

import {z} from 'zod'

import {getSubscriptionRecapInfo} from '@/components/features/checkout-stripe/actions'
import {
  STRIPE_CODEMAIL_PRICE_ID_LIFETIME,
  STRIPE_CODEMAIL_PRICE_ID_MONTHLY,
  STRIPE_CODEMAIL_PRICE_ID_YEARLY,
} from '@/lib/stripe-utils'

const userIdSchema = z.object({
  id: z.string(),
})

export const priceProMonthly = await getSubscriptionRecapInfo(
  STRIPE_CODEMAIL_PRICE_ID_MONTHLY
)
export const priceProYearly = await getSubscriptionRecapInfo(
  STRIPE_CODEMAIL_PRICE_ID_YEARLY
)
export const priceLifetime = await getSubscriptionRecapInfo(
  STRIPE_CODEMAIL_PRICE_ID_LIFETIME
)
