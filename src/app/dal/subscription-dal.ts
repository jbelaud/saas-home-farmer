import {cache} from 'react'

import {checkSubscriptionLimit} from '@/services/authorization/subscription-authorization'
import {LimitType} from '@/services/types/domain/subscription-types'

export const checkSubscriptionLimitDal = cache(
  async (limitType: LimitType, requestedAmount: number = 1) => {
    return checkSubscriptionLimit(limitType, requestedAmount)
  }
)
