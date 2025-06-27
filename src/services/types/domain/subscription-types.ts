import {
  SubscriptionAddModel,
  SubscriptionModel,
} from '@/db/models/subscription-model'

// Types de domaine découplés des types Drizzle - Aligned with Better Auth
export type Subscription = SubscriptionModel
export type SubscriptionPlan = 'pro' | 'lifetime'

// Constantes pour les rôles globaux
export const PlanConst = {
  PRO: 'pro' as SubscriptionPlan,
  LIFETIME: 'lifetime' as SubscriptionPlan,
} as const

// Types pour les opérations
export type CreateSubscription = Pick<
  SubscriptionAddModel,
  'referenceId' | 'plan' | 'status'
> & {
  periodStart?: Date
  periodEnd?: Date
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  cancelAtPeriodEnd?: boolean
  seats?: number
  trialStart?: Date
  trialEnd?: Date
}

export type UpdateSubscription = {
  id: string
} & Partial<Omit<SubscriptionAddModel, 'id'>>

// DTO = Data Transfer Object pour la présentation
export type SubscriptionDTO = {
  id: string
  plan: string
  referenceId: string
  status: string
  periodStart?: Date
  periodEnd?: Date
  seats?: number
  trialStart?: Date
  trialEnd?: Date
}

export enum StripeWebhooks {
  Completed = 'checkout.session.completed',
  PaymentSuccess = 'payment_intent.succeeded',
  PaymentFailed = 'payment_intent.payment_failed',
  SubscriptionDeleted = 'customer.subscription.deleted',
  SubscriptionUpdated = 'customer.subscription.updated',
}

// Billing Configuration

// Billing modes
export const BillingModes = {
  USER: 'user',
  ORGANIZATION: 'organization',
} as const

export type BillingMode = (typeof BillingModes)[keyof typeof BillingModes]
