import {relations, sql} from 'drizzle-orm'
import {
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
    id: uuid('id')
      .default(sql`uuid_generate_v4()`)
      .primaryKey(),
    userId: uuid('user_id').notNull(),

    // Plan and Status
    plan: subscriptionPlanEnum('plan').default('CODEMAIL_FREE').notNull(),
    status: subscriptionStatusEnum('status').default('active').notNull(),
    subscriptionType: subscriptionTypeEnum('subscription_type').notNull(),
    // Main dates
    startDate: timestamp('start_date', {mode: 'date'}).defaultNow().notNull(),
    endDate: timestamp('end_date', {mode: 'date'}),
    createdAt: timestamp('created_at', {mode: 'date'}).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', {mode: 'date'}).defaultNow().notNull(),
    canceledAt: timestamp('canceled_at', {mode: 'date'}),
    trialEndsAt: timestamp('trial_ends_at', {mode: 'date'}),

    // Billing period
    currentPeriodStart: timestamp('current_period_start', {
      mode: 'date',
    }).notNull(),
    currentPeriodEnd: timestamp('current_period_end', {mode: 'date'}).notNull(),
    lastBillingDate: timestamp('last_billing_date', {mode: 'date'}),
    nextBillingDate: timestamp('next_billing_date', {mode: 'date'}),

    // Stripe information
    stripeSubscriptionId: text('stripe_subscription_id'),
    priceId: text('price_id'),
    paymentMethodId: text('payment_method_id'),

    // Others
    quantity: integer('quantity').default(1),
    metadata: jsonb('metadata'),
  },
  (table) => ({
    userPlanUnique: uniqueIndex('user_plan_unique_idx').on(
      table.userId,
      table.plan
    ),
  })
)

// Define relations if needed
export const subscriptionsRelations = relations(subscriptions, ({one}) => ({
  user: one(user, {
    fields: [subscriptions.userId],
    references: [user.id],
  }),
}))

// Export types
export type SubscriptionModel = typeof subscriptions.$inferSelect
export type SubscriptionAddModel = typeof subscriptions.$inferInsert
export type SubscriptionTypeModel =
  (typeof subscriptionTypeEnum.enumValues)[number]
