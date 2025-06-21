import {getSubscriptionByIdDao} from '@/db/repositories/subscription-repository'

import {getAuthUser} from '../authentication/auth-service'
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
  return userCanOnResource(
    authUser,
    ActionsConst.READ,
    SubjectsConst.SUBSCRIPTION,
    {
      id: subscription.id,
      userId: subscription.stripeCustomerId,
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
  return userCanOnResource(
    authUser,
    ActionsConst.UPDATE,
    SubjectsConst.SUBSCRIPTION,
    {
      id: subscription.id,
      userId: subscription.stripeCustomerId,
    }
  )
}
