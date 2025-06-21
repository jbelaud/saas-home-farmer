import {relations, sql} from 'drizzle-orm'
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

import {user} from './auth-model'

// Define enums for type safety
export const subscriptionPlanEnum = pgEnum('subscription_plan', [
  'CODEMAIL_FREE',
  'CODEMAIL_PRO',
  'CODEMAIL_LIFETIME',
])

export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'active',
  'grace_period',
  'canceled',
  'expired',
])

export const subscriptionTypeEnum = pgEnum('subscription_types', [
  'subscription',
  'payment',
])

// Define table schema
export const subscriptions = pgTable(
  'subscription',
  {
    // Champs better-auth
    id: uuid('id')
      .default(sql`uuid_generate_v4()`)
      .primaryKey(),
    plan: text('plan').notNull(),
    referenceId: text('reference_id').notNull(), // userId
    stripeCustomerId: text('stripe_customer_id'),
    stripeSubscriptionId: text('stripe_subscription_id'),
    status: text('status').notNull(),
    periodStart: timestamp('period_start'),
    periodEnd: timestamp('period_end'),
    cancelAtPeriodEnd: boolean('cancel_at_period_end'),
    seats: integer('seats'),
    trialStart: timestamp('trial_start'),
    trialEnd: timestamp('trial_end'),

    // Vos champs métier conservés
    subscriptionType: subscriptionTypeEnum('subscription_type').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
    canceledAt: timestamp('canceled_at'),
    lastBillingDate: timestamp('last_billing_date'),
    nextBillingDate: timestamp('next_billing_date'),
    priceId: text('price_id'),
    paymentMethodId: text('payment_method_id'),
    metadata: jsonb('metadata'),
  },
  (table) => ({
    userPlanUnique: uniqueIndex('user_plan_unique_idx').on(
      table.stripeCustomerId,
      table.plan
    ),
  })
)

// Define relations if needed
export const subscriptionsRelations = relations(subscriptions, ({one}) => ({
  user: one(user, {
    fields: [subscriptions.stripeCustomerId],
    references: [user.stripeCustomerId],
  }),
}))

// Export types
export type SubscriptionModel = typeof subscriptions.$inferSelect
export type SubscriptionAddModel = typeof subscriptions.$inferInsert
export type SubscriptionTypeModel =
  (typeof subscriptionTypeEnum.enumValues)[number]
