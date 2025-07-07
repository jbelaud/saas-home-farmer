import {cache} from 'react'

import {
  getActiveSubscriptions,
  getSessionReferenceId,
} from '@/services/authentication/auth-service'
import {checkSubscriptionLimit} from '@/services/authorization/subscription-authorization'
import {
  getPlanByCodeService,
  getPlanByPriceIdService,
  getPlansWithPaginationService,
  getSubscriptionsWithPaginationService,
  isYearlyPriceService,
} from '@/services/facades/subscription-service-facade'
import {Pagination} from '@/services/types/common-type'
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
export const getProPlan = async (): Promise<Plan | undefined> => {
  return getPlanByCodeService(PlanConst.PRO)
}

/**
 * Obtenir le plan FREE
 */
export const getFreePlan = async (): Promise<Plan | undefined> => {
  return getPlanByCodeService(PlanConst.FREE)
}

/**
 * Obtenir le plan ENTREPRISE
 */
export const getEntreprisePlan = async (): Promise<Plan | undefined> => {
  return getPlanByCodeService(PlanConst.ENTREPRISE)
}

/**
 * Obtenir le plan LIFETIME
 */
export const getLifetimePlan = async (): Promise<Plan | undefined> => {
  return getPlanByCodeService(PlanConst.LIFETIME)
}

// ========================================
// DAL POUR LA GESTION ADMIN DES PLANS
// ========================================

/**
 * Obtenir tous les plans avec pagination pour l'admin
 */
export const getPlansWithPaginationDal = cache(
  async (pagination: Pagination, search?: string) => {
    return getPlansWithPaginationService(pagination, search)
  }
)

/**
 * Obtenir les permissions admin pour les plans
 */
export const getPlanAdminPermissionsDal = cache(async () => {
  // Retourne les permissions disponibles pour l'admin
  return {
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    canView: true,
  }
})

// ========================================
// DAL POUR LA GESTION ADMIN DES SUBSCRIPTIONS
// ========================================

/**
 * Obtenir toutes les subscriptions avec pagination pour l'admin
 */
export const getSubscriptionsWithPaginationDal = cache(
  async (pagination: Pagination, search?: string) => {
    return getSubscriptionsWithPaginationService(pagination, search)
  }
)

/**
 * Obtenir les permissions admin pour les subscriptions
 */
export const getSubscriptionAdminPermissionsDal = cache(async () => {
  // Retourne les permissions disponibles pour l'admin
  return {
    canView: true,
    canCancel: true,
    canReactivate: true,
  }
})
