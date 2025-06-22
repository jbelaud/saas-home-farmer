import 'server-only'

import {getSubscriptionRecapInfo} from '@/components/features/checkout-stripe/actions'
import {env} from '@/env'

export const priceProMonthly = await getSubscriptionRecapInfo(
  env.STRIPE_PRICE_ID_PRO_MONTHLY
)
export const priceProYearly = await getSubscriptionRecapInfo(
  env.STRIPE_PRICE_ID_PRO_YEARLY
)
export const priceLifetime = await getSubscriptionRecapInfo(
  env.STRIPE_PRICE_ID_LIFETIME
)
