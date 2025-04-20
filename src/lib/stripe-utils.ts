import {SubscriptionPlan} from '@/services/types/domain/subscription-types'

export const STRIPE_CODEMAIL_PRICE_ID_MONTHLY =
  process.env.STRIPE_CODEMAIL_PRICE_ID_MONTHLY ?? ''
export const STRIPE_CODEMAIL_PRICE_ID_YEARLY =
  process.env.STRIPE_CODEMAIL_PRICE_ID_YEARLY ?? ''
export const STRIPE_CODEMAIL_PRICE_ID_LIFETIME =
  process.env.STRIPE_CODEMAIL_PRICE_ID_LIFETIME ?? ''

type Plan = {
  priceId: string
  planCode: SubscriptionPlan
  planName: string
}
export const planProMontly: Plan = {
  priceId: STRIPE_CODEMAIL_PRICE_ID_MONTHLY,
  planCode: 'CODEMAIL_PRO',
  planName: 'Pro',
}

export const planProYearly: Plan = {
  priceId: STRIPE_CODEMAIL_PRICE_ID_YEARLY,
  planCode: 'CODEMAIL_PRO',
  planName: 'Pro',
}

export const planLifetime: Plan = {
  priceId: STRIPE_CODEMAIL_PRICE_ID_LIFETIME,
  planCode: 'CODEMAIL_LIFETIME',
  planName: 'Lifetime',
}

export const plans = [planProMontly, planProYearly, planLifetime]

export function getPlanByPriceId(priceId?: string) {
  if (!priceId) {
    return
  }
  console.log('getPlanByPriceId plans', plans)
  return plans.find((plan) => plan.priceId === priceId)
}
