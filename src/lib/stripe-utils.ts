import {StripePlan} from '@better-auth/stripe'

import {env} from '@/env'
import {
  PlanConst,
  SubscriptionPlan,
} from '@/services/types/domain/subscription-types'

type Plan = {
  priceId: string
  planCode: SubscriptionPlan
  planName: string
  isYearly: boolean
}

/**
 * Les plans Stripe sont définie ici pour Better auth et le reste de l'app
 */
export const betterAuthPlans: StripePlan[] = [
  {
    name: PlanConst.PRO, // the name of the plan, it'll be automatically lower cased when stored in the database
    priceId: env.STRIPE_PRICE_ID_PRO_MONTHLY, // the price ID from stripe
    annualDiscountPriceId: env.STRIPE_PRICE_ID_PRO_YEARLY, // (optional) the price ID for annual billing with a discount
    limits: {
      projects: 1,
      storage: 10,
    },
  },
  {
    name: PlanConst.LIFETIME,
    priceId: env.STRIPE_PRICE_ID_LIFETIME,
    limits: {
      projects: 20,
      storage: 50,
    },
    freeTrial: {
      days: 14,
    },
  },
]

// Plans for App
export const planProMontly: Plan = {
  priceId: betterAuthPlans[0].priceId ?? '',
  planCode: betterAuthPlans[0].name as SubscriptionPlan,
  planName: 'Pro',
  isYearly: false,
}

export const planProYearly: Plan = {
  priceId: betterAuthPlans[0].annualDiscountPriceId ?? '',
  planCode: betterAuthPlans[0].name as SubscriptionPlan,
  planName: 'Pro Yearly',
  isYearly: true,
}

export const planLifetime: Plan = {
  priceId: betterAuthPlans[1].priceId ?? '',
  planCode: betterAuthPlans[1].name as SubscriptionPlan,
  planName: 'Lifetime',
  isYearly: false,
}

export const plans = [planProMontly, planProYearly, planLifetime]

export function getPlanByPriceId(priceId?: string) {
  if (!priceId) {
    return
  }
  console.log('getPlanByPriceId plans', plans)
  return plans.find((plan) => plan.priceId === priceId)
}
