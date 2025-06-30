import {
  SubscriptionAddModel,
  SubscriptionModel,
} from '@/db/models/subscription-model'

// Types de domaine découplés des types Drizzle - Aligned with Better Auth
export type Subscription = SubscriptionModel
export type SubscriptionPlan = 'pro' | 'enterprise' | 'lifetime'

// Constantes pour les rôles globaux
export const PlanConst = {
  PRO: 'pro' as SubscriptionPlan,
  ENTREPRISE: 'enterprise' as SubscriptionPlan,
  LIFETIME: 'lifetime' as SubscriptionPlan,
} as const

// Types pour les limites d'abonnement
export type LimitType = 'projects' | 'storage'

// Constantes pour les limites
export const LimitTypeConst = {
  PROJECTS: 'projects' as LimitType,
  STORAGE: 'storage' as LimitType,
} as const

// Type pour la configuration d'une limite
export type LimitConfig = {
  key: LimitType
  label: string
  unit: string
  icon: string
  description?: string
}

// Configuration des limites disponibles
export const AVAILABLE_LIMITS: LimitConfig[] = [
  {
    key: 'projects',
    label: 'Projets',
    unit: 'projets',
    icon: '📁',
    description: 'Nombre de projets maximum',
  },
  {
    key: 'storage',
    label: 'Stockage',
    unit: 'GB',
    icon: '💾',
    description: 'Espace de stockage total',
  },
] as const

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
