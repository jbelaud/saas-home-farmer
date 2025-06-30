import {logger} from 'better-auth'

import {getSubscriptionByIdDao} from '@/db/repositories/subscription-repository'

import {
  getActiveSubscriptions,
  getAuthUser,
  getSessionReferenceId,
} from '../authentication/auth-service'
import {getProjectsByOrganizationService} from '../project-service'
import {checkSubscriptionLimitService} from '../subscription-service'
import {LimitType, LimitTypeConst} from '../types/domain/subscription-types'
import {userCan, userCanOnResource} from './authorization-service'
import {ActionsConst, SubjectsConst} from './casl-abilities'

export const canReadSubscription = async (
  resourceId?: string
): Promise<boolean> => {
  const authUser = await getAuthUser()

  // Si pas d'ID de ressource spécifique, vérifier la permission générale
  if (!resourceId) {
    return userCan(authUser, ActionsConst.READ, SubjectsConst.SUBSCRIPTION)
  }

  // Vérification précoce : si l'utilisateur n'a pas la permission générale, pas besoin d'aller plus loin
  if (!userCan(authUser, ActionsConst.READ, SubjectsConst.SUBSCRIPTION)) {
    return false
  }

  // Récupérer la subscription pour vérifier la propriété
  const subscription = await getSubscriptionByIdDao(resourceId)
  if (!subscription) return false

  // Utiliser CASL pour vérifier les permissions avec condition de propriété
  // Utilise referenceId (userId Better Auth) au lieu de stripeCustomerId
  return userCanOnResource(
    authUser,
    ActionsConst.READ,
    SubjectsConst.SUBSCRIPTION,
    {
      id: subscription.id,
      userId: subscription.referenceId,
    }
  )
}

export const canUpdateSubscription = async (
  resourceId: string
): Promise<boolean> => {
  const authUser = await getAuthUser()

  // Vérification précoce : si l'utilisateur n'a pas la permission générale, pas besoin d'aller plus loin
  if (!userCan(authUser, ActionsConst.UPDATE, SubjectsConst.SUBSCRIPTION)) {
    return false
  }

  // Récupérer la subscription pour vérifier la propriété
  const subscription = await getSubscriptionByIdDao(resourceId)
  if (!subscription) return false

  // Utiliser CASL pour vérifier les permissions avec condition de propriété
  // Utilise referenceId (userId Better Auth) au lieu de stripeCustomerId
  return userCanOnResource(
    authUser,
    ActionsConst.UPDATE,
    SubjectsConst.SUBSCRIPTION,
    {
      id: subscription.id,
      userId: subscription.referenceId,
    }
  )
}

/**
 * 🎯 Vérification des limites d'abonnement (DAL → Service)
 */
export const checkSubscriptionLimit = async (
  limitType: LimitType,
  requestedAmount: number = 1
) => {
  const referenceId = await getSessionReferenceId()
  if (!referenceId) {
    throw new Error('No referenceId found')
  }
  // 1. Récupérer l'abonnement via Better Auth API
  const subscription = await getActiveSubscriptions(referenceId)
  if (!subscription) {
    throw new Error('No subscription found')
  }
  if (subscription.length > 1) {
    logger.warn('Multiple subscriptions found for referenceId', {referenceId})
  }
  let currentUsage = 0
  switch (limitType) {
    case LimitTypeConst.PROJECTS: {
      const projects = await getProjectsByOrganizationService(referenceId) //todo
      currentUsage = projects.length
      break
    }
    case LimitTypeConst.STORAGE:
      throw new Error('Not implemented')

    default:
      throw new Error('Invalid limit type')
  }

  // 2. Appeler le service pour la logique métier
  return checkSubscriptionLimitService(
    subscription[0],
    limitType,
    currentUsage,
    requestedAmount
  )
}
