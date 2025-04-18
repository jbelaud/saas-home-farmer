import {
  SubscriptionModel,
  SubscriptionAddModel,
} from '@/db/models/subscription-model'
import {User} from './user-types'

// Base types from models
export type Subscription = SubscriptionModel
export type AddSubscription = SubscriptionAddModel
export type CreateSubscription = AddSubscription
export type UpdateSubscription = {
  id: string
} & Partial<Omit<Subscription, 'id'>>

// Extended types with relations
export type SubscriptionDetail = Subscription & {
  user?: User | null // Relation avec `users`
}

// Pagination response type
export type PaginatedSubscriptions = {
  data: SubscriptionDetail[]
  pagination: {
    rowCount: number
    pageSize: number
    page: number
    pageCount: number
  }
}
export type SubscriptionPlan = Subscription['plan']
export type CodeMailSubscriptionPlan = SubscriptionPlan
export type SubscriptionStatus = Subscription['status']

export type SubscriptionType = 'payment' | 'subscription' // Aligné avec Stripe.Checkout.Session.Mode
export enum StripeWebhooks {
  Completed = 'checkout.session.completed',
  PaymentSuccess = 'payment_intent.succeeded',
  PaymentFailed = 'payment_intent.payment_failed',
  SubscriptionDeleted = 'customer.subscription.deleted',
  SubscriptionUpdated = 'customer.subscription.updated',
}
