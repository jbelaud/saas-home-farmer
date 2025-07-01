import z from 'zod'

import {SubscriptionPlan} from '@/services/types/domain/subscription-types'

export type Plan = {
  priceId: string
  planCode: SubscriptionPlan
  planName: string
  annualDiscountPriceId?: string
  price?: number // les prix peuvent etre calculé depuis 'getSubscriptionRecapInfo' mais pour plus de souplesse on peut les definir en dur
  yearlyPrice?: number
  isReccuring: boolean
  features: string[]
  freeTrial?: number
  limits?: {
    users?: number
    projects?: number
    storage?: number
  }
}
export const StripeCheckoutConst = {
  EMBEDED_FORM: 'EmbededForm',
  EXTERNAL_FORM: 'ExternalForm',
  REACT_STRIPE_FORM: 'ReactStripeForm',
  PAYMENT_LINK: 'PaymentLink',
} as const

export type StripeCheckoutType =
  (typeof StripeCheckoutConst)[keyof typeof StripeCheckoutConst]

export const StripeCheckoutTypeSchema = z.enum(
  [
    StripeCheckoutConst.EMBEDED_FORM,
    StripeCheckoutConst.EXTERNAL_FORM,
    StripeCheckoutConst.REACT_STRIPE_FORM,
    StripeCheckoutConst.PAYMENT_LINK,
  ] satisfies [StripeCheckoutType, ...StripeCheckoutType[]],
  {
    message: 'Type de checkout Stripe non supporté.',
  }
)
