import {cache} from 'react'

import {
  getActiveSubscriptions,
  getSessionReferenceId,
} from '@/services/authentication/auth-service'
import {checkSubscriptionLimit} from '@/services/authorization/subscription-authorization'
import {LimitType} from '@/services/types/domain/subscription-types'

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
