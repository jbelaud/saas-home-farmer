'use server'

import {getPriceIdFromSubscriptionId} from '@/lib/stripe/stripe-utils'

export async function getPriceIdFromSubscriptionIdAction(
  subscriptionId: string
) {
  return await getPriceIdFromSubscriptionId(subscriptionId)
}
