import {headers} from 'next/headers'
import {cache} from 'react'

import {auth} from '@/lib/better-auth/auth'
import {checkSubscriptionLimitService} from '@/services/facades/subscription-service-facade'
import {LimitType} from '@/services/types/domain/subscription-types'

/**
 * 🔍 Récupère les abonnements actifs via Better Auth API
 */
export const getActiveSubscriptionsDal = cache(async () => {
  try {
    const subscriptions = await auth.api.listActiveSubscriptions({
      headers: await headers(),
    })
    return subscriptions
  } catch (error) {
    console.error('Error fetching active subscriptions:', error)
    return []
  }
})

/**
 * 🎯 Récupère l'abonnement actif pour un referenceId spécifique
 */
export const getActiveSubscriptionByReferenceIdDal = cache(
  async (referenceId: string) => {
    const subscriptions = await getActiveSubscriptionsDal()
    return subscriptions.find((sub) => sub.referenceId === referenceId) || null
  }
)

/**
 * 🎯 Vérification des limites d'abonnement (DAL → Service)
 */
export const checkSubscriptionLimitDal = cache(
  async (
    referenceId: string,
    limitType: LimitType,
    currentUsage: number,
    requestedAmount: number = 1
  ) => {
    // 1. Récupérer l'abonnement via Better Auth API
    const subscription =
      await getActiveSubscriptionByReferenceIdDal(referenceId)

    // 2. Appeler le service pour la logique métier
    return checkSubscriptionLimitService(
      subscription,
      limitType,
      currentUsage,
      requestedAmount
    )
  }
)

/**
 * 📊 Récupère l'usage des abonnements (avec limites Better Auth)
 */
export const getSubscriptionUsageDal = cache(async (referenceId: string) => {
  const subscription = await getActiveSubscriptionByReferenceIdDal(referenceId)

  if (!subscription) {
    return {
      hasSubscription: false,
      subscription: null,
      limits: {},
      seats: 0,
    }
  }

  return {
    hasSubscription: true,
    subscription,
    limits: subscription.limits || {},
    seats: subscription.seats || 0,
  }
})
