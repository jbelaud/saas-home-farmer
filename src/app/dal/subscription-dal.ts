import {cache} from 'react'

import {
  getActiveSubscriptions,
  getSessionReferenceId,
} from '@/services/authentication/auth-service'
import {checkSubscriptionLimit} from '@/services/authorization/subscription-authorization'
import {
  getPlanByCodeService,
  getPlanByPriceIdService,
  isYearlyPriceService,
} from '@/services/facades/subscription-service-facade'
import {
  LimitType,
  Plan,
  PlanConst,
} from '@/services/types/domain/subscription-types'

export const getActiveSubscriptionsDal = cache(async () => {
  const referenceId = await getSessionReferenceId()
  if (!referenceId) {
    throw new Error('No referenceId found')
  }
  const subscriptions = await getActiveSubscriptions(referenceId)
  return subscriptions
})

export const checkSubscriptionLimitDal = cache(
  async (limitType: LimitType, requestedAmount: number = 1) => {
    return checkSubscriptionLimit(limitType, requestedAmount)
  }
)

export const getPlanByPriceId = cache(async (priceId: string) => {
  return getPlanByPriceIdService(priceId)
})

export const isYearlyPrice = cache(async (priceId?: string | null) => {
  if (!priceId) {
    return false
  }
  return isYearlyPriceService(priceId)
})

// ========================================
// SERVICES HELPER POUR LES PLANS SPÉCIFIQUES
// ========================================

/**
 * Obtenir le plan PRO
 */
export const getProPlanService = async (): Promise<Plan | undefined> => {
  return getPlanByCodeService(PlanConst.PRO)
}

/**
 * Obtenir le plan FREE
 */
export const getFreePlanService = async (): Promise<Plan | undefined> => {
  return getPlanByCodeService(PlanConst.FREE)
}

/**
 * Obtenir le plan ENTREPRISE
 */
export const getEntreprisePlanService = async (): Promise<Plan | undefined> => {
  return getPlanByCodeService(PlanConst.ENTREPRISE)
}

/**
 * Obtenir le plan LIFETIME
 */
export const getLifetimePlanService = async (): Promise<Plan | undefined> => {
  return getPlanByCodeService(PlanConst.LIFETIME)
}
