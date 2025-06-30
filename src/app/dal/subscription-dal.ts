import {headers} from 'next/headers'
import {cache} from 'react'

import {auth} from '@/lib/better-auth/auth'
import {
  BILLING_MODE,
  getReferenceIdByBillingMode,
} from '@/lib/helper/subscription-helper'
import {getAuthUser} from '@/services/authentication/auth-service'
import {getProjectsByOrganizationService} from '@/services/facades/project-service-facade'
import {checkSubscriptionLimitService} from '@/services/facades/subscription-service-facade'
import {
  BillingModes,
  LimitType,
  LimitTypeConst,
} from '@/services/types/domain/subscription-types'

import {getOrganizationBySlugDal} from './organization-dal'

/**
 * 🔍 Récupère les abonnements actifs via Better Auth API
 */
export const getActiveSubscriptionsDal = cache(async (referenceId: string) => {
  try {
    const subscriptions = await auth.api.listActiveSubscriptions({
      headers: await headers(),
      query: {
        referenceId,
      },
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
    const subscriptions = await getActiveSubscriptionsDal(referenceId)
    console.log('subscriptions', subscriptions)
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
    requestedAmount: number = 1
  ) => {
    // 1. Récupérer l'abonnement via Better Auth API
    const subscription =
      await getActiveSubscriptionByReferenceIdDal(referenceId)
    console.log('subscription', subscription)

    let currentUsage = 0
    switch (limitType) {
      case LimitTypeConst.PROJECTS: {
        if (BILLING_MODE !== BillingModes.ORGANIZATION) {
          console.warn(
            'checkSubscriptionLimitDal: BILLING_MODE !== BillingModes.ORGANIZATION'
          )
        }
        const projects = await getProjectsByOrganizationService(referenceId) //todo
        currentUsage = projects.length
        break
      }
      case LimitTypeConst.STORAGE:
        // const storage = await getStorageByOrganizationService(referenceId)
        // currentUsage = storage.length
        break
    }

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

export const getReferenceIdDal = cache(async (slug: string) => {
  const user = await getAuthUser()
  const organization = await getOrganizationBySlugDal(slug)
  return getReferenceIdByBillingMode(user?.id, organization?.id)
})
