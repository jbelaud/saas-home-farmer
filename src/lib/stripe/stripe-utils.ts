import {StripePlan} from '@better-auth/stripe'
import Stripe from 'stripe'

import {env} from '@/env'
import {
  PlanConst,
  SubscriptionPlan,
} from '@/services/types/domain/subscription-types'

import {Plan} from './stripe-types'

export const stripeClient = new Stripe(env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

/**
 * Les plans Stripe sont définie ici pour Better auth et le reste de l'app
 */
export const betterAuthPlans: StripePlan[] = [
  {
    name: PlanConst.PRO, // the name of the plan, it'll be automatically lower cased when stored in the database
    priceId: env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY, // the price ID from stripe
    annualDiscountPriceId: env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_YEARLY, // (optional) the price ID for annual billing with a discount
    limits: {
      projects: 1,
      storage: 10,
    },
  },
  {
    name: PlanConst.LIFETIME,
    priceId: env.NEXT_PUBLIC_STRIPE_PRICE_ID_LIFETIME,
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
  isReccuring: true,
  features: [
    'Introduction Course / Components',
    'PRO: Complete Email Integration Guide',
    'PRO: All  Features Access',
    'PRO: Code Review Sessions',
  ],
}

export const planProYearly: Plan = {
  priceId: betterAuthPlans[0].annualDiscountPriceId ?? '',
  planCode: betterAuthPlans[0].name as SubscriptionPlan,
  planName: 'Pro Yearly',
  isYearly: true,
  isReccuring: true,
  features: [
    'Introduction Course / Components',
    'PRO: Complete Email Integration Guide',
    'PRO: All  Features Access',
    'PRO: Code Review Sessions',
    'PRO: 100% Money Back Guarantee',
    'Save money with yearly billing',
  ],
}

export const planLifetime: Plan = {
  priceId: betterAuthPlans[1].priceId ?? '',
  planCode: betterAuthPlans[1].name as SubscriptionPlan,
  planName: 'Lifetime',
  isYearly: false,
  isReccuring: false,
  features: [
    'Introduction Course / Components',
    'PRO: Complete Email Integration Guide',
    'PRO: All  Features Access',
    'PRO: Code Review Sessions',
    'PRO: 100% Money Back Guarantee',
    'Unlimited Projects',
    'Unlimited Storage',
    'Unlimited Emails',
    'Unlimited Users',
    'Unlimited Features',
    'Unlimited Code Reviews',
    'Unlimited Support',
  ],
}

export const plans = [planProMontly, planProYearly, planLifetime]

export function getPlanByPriceId(priceId?: string) {
  if (!priceId) {
    return
  }
  return plans.find((plan) => plan.priceId === priceId)
}
