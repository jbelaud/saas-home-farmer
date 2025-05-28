import {getSubscriptionByIdDao} from '@/db/repositories/subscription-repository'

import {getAuthUser} from '../authentication/auth-utils'
import {permissionAcces} from './authorization-service'
import {GrantActionEnum, ResourceEnum} from './rbac-config'

export const canReadSubscription = async (resourceUid?: string) => {
  const authUser = await getAuthUser()

  // Pour les utilisateurs non connectés, on vérifie directement les permissions
  if (!authUser) {
    const permission = permissionAcces(
      undefined,
      ResourceEnum.SUBSCRIPTIONS,
      GrantActionEnum.READ
    )

    return permission?.granted ?? false
  }

  if (!resourceUid) {
    const permission = permissionAcces(
      authUser,
      ResourceEnum.SUBSCRIPTIONS,
      GrantActionEnum.READ
    )

    return permission?.granted ?? false
  }

  const subscription = await getSubscriptionByIdDao(resourceUid)

  const permission = permissionAcces(
    authUser,
    ResourceEnum.SUBSCRIPTIONS,
    GrantActionEnum.READ,
    subscription?.userId
  )

  if (!permission?.granted) return false
  return true
}

export const canUpdateSubscription = async (resourceUid: string) => {
  const authUser = await getAuthUser()

  // Pour les utilisateurs non connectés, on vérifie directement les permissions
  if (!authUser) {
    const permission = permissionAcces(
      undefined,
      ResourceEnum.SUBSCRIPTIONS,
      GrantActionEnum.UPDATE
    )
    return permission?.granted ?? false
  }

  const subscription = await getSubscriptionByIdDao(resourceUid)

  const permission = permissionAcces(
    authUser,
    ResourceEnum.SUBSCRIPTIONS,
    GrantActionEnum.UPDATE,
    subscription?.userId
  )

  if (!permission?.granted) return false
  return true
}
