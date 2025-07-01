import {StripePlan} from '@better-auth/stripe'

import {env} from '@/env'
import {
  PlanConst,
  SubscriptionPlan,
} from '@/services/types/domain/subscription-types'

import {Plan} from './stripe-types'

/**
 * Les plans Stripe sont définie ici pour Better auth et le reste de l'app
 */
export const betterAuthPlans: StripePlan[] = [
  {
    name: PlanConst.PRO, // the name of the plan, it'll be automatically lower cased when stored in the database
    priceId: env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY, // the price ID from stripe
    annualDiscountPriceId: env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_YEARLY, // (optional) the price ID for annual billing with a discount
    limits: {
      projects: 2,
      storage: 10,
    },
  },
  {
    name: PlanConst.ENTREPRISE, // the name of the plan, it'll be automatically lower cased when stored in the database
    priceId: env.NEXT_PUBLIC_STRIPE_PRICE_ID_ENTREPRISE_MONTHLY, // the price ID from stripe
    annualDiscountPriceId: env.NEXT_PUBLIC_STRIPE_PRICE_ID_ENTREPRISE_YEARLY, // (optional) the price ID for annual billing with a discount
    limits: {
      projects: 3,
      storage: 50,
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

// A fake plan with free limit
export const freeStripePlan: StripePlan = {
  name: 'free',
  priceId: 'free',
  limits: {
    projects: 1,
    storage: 1,
  },
}

// Plans extended to App
export const planProMontly: Plan = {
  priceId: betterAuthPlans[0].priceId ?? '',
  planCode: betterAuthPlans[0].name as SubscriptionPlan,
  limits: betterAuthPlans[0].limits,
  annualDiscountPriceId: betterAuthPlans[0].annualDiscountPriceId,
  planName: 'Pro',
  //isYearly: false,
  isReccuring: true,
  features: [
    "Jusqu'à 5 utilisateurs",
    `${betterAuthPlans[0].limits?.projects} projets`,
    `${betterAuthPlans[0].limits?.storage} GB stockage`,
    'Support prioritaire',
    'Intégrations avancées',
  ],
}

export const planEntrepriseMontly: Plan = {
  priceId: betterAuthPlans[1].priceId ?? '',
  planCode: betterAuthPlans[1].name as SubscriptionPlan,
  limits: betterAuthPlans[1].limits,
  annualDiscountPriceId: betterAuthPlans[1].annualDiscountPriceId,
  planName: 'Entreprise',
  //isYearly: false,
  isReccuring: true,
  features: [
    'Utilisateurs illimités',
    `${betterAuthPlans[1].limits?.projects} projets`,
    `${betterAuthPlans[1].limits?.storage} GB stockage`,
    'Support 24/7',
    'SSO & sécurité avancée',
  ],
}

export const planProYearly: Plan = {
  priceId: betterAuthPlans[0].annualDiscountPriceId ?? '',
  planCode: betterAuthPlans[0].name as SubscriptionPlan,
  planName: 'Pro Yearly',
  //isYearly: true,
  isReccuring: true,
  limits: betterAuthPlans[0].limits,
  features: [
    "Jusqu'à 5 utilisateurs",
    `${betterAuthPlans[0].limits?.projects} projets`,
    `${betterAuthPlans[0].limits?.storage} GB stockage`,
    'Support prioritaire',
    'Intégrations avancées',
  ],
}

export const planEntrepriseYearly: Plan = {
  priceId: betterAuthPlans[1].annualDiscountPriceId ?? '',
  planCode: betterAuthPlans[1].name as SubscriptionPlan,
  planName: 'Entreprise Yearly',
  //isYearly: false,
  isReccuring: true,
  limits: betterAuthPlans[1].limits,
  features: [
    'Utilisateurs illimités',
    `${betterAuthPlans[1].limits?.projects} projets`,
    `${betterAuthPlans[1].limits?.storage} GB stockage`,
    'Support 24/7',
    'SSO & sécurité avancée',
  ],
}

export const planLifetime: Plan = {
  priceId: betterAuthPlans[2].priceId ?? '',
  planCode: betterAuthPlans[2].name as SubscriptionPlan,
  planName: 'Lifetime',
  //isYearly: false,
  isReccuring: false,
  limits: betterAuthPlans[2].limits,
  features: [
    'Introduction Course / Components',
    'PRO: Complete Email Integration Guide',
    'PRO: All  Features Access',
    'PRO: Code Review Sessions',
    'PRO: 100% Money Back Guarantee',
    `${betterAuthPlans[2].limits?.projects} projets`,
    `${betterAuthPlans[2].limits?.storage} GB stockage`,
  ],
}

export const planFree: Plan = {
  priceId: freeStripePlan.priceId ?? '',
  planCode: freeStripePlan.name as SubscriptionPlan,
  planName: 'Free',
  //isYearly: false,
  isReccuring: true,
  limits: freeStripePlan.limits,
  features: [
    '1 utilisateur',
    `${freeStripePlan.limits?.projects} projets`,
    `${freeStripePlan.limits?.storage} GB stockage`,
    'Support communautaire',
  ],
}

export function isYearlyPrice(priceId?: string): boolean {
  if (!priceId) {
    return false
  }
  return betterAuthPlans.some((plan) => plan.annualDiscountPriceId === priceId)
}

export const plans = [
  planProMontly,
  planProYearly,
  planLifetime,
  planFree,
  planEntrepriseMontly,
  planEntrepriseYearly,
]

export function getPlanByPriceId(priceId?: string) {
  if (!priceId) {
    return
  }
  return plans.find((plan) => plan.priceId === priceId)
}
