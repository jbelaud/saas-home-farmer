import 'server-only'

import {getSubscriptionRecapInfo} from '@/components/features/checkout-stripe/actions'
import {env} from '@/env'

export const priceProMonthly = await getSubscriptionRecapInfo(
  env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY
)
export const priceProYearly = await getSubscriptionRecapInfo(
  env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_YEARLY
)
export const priceLifetime = await getSubscriptionRecapInfo(
  env.NEXT_PUBLIC_STRIPE_PRICE_ID_LIFETIME
)
export const priceEntrepriseMonthly = await getSubscriptionRecapInfo(
  env.NEXT_PUBLIC_STRIPE_PRICE_ID_ENTREPRISE_MONTHLY
)
export const priceEntrepriseYearly = await getSubscriptionRecapInfo(
  env.NEXT_PUBLIC_STRIPE_PRICE_ID_ENTREPRISE_YEARLY
)
