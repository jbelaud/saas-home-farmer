import {relations, sql} from 'drizzle-orm'
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

import {user} from './auth-model'

// Define table schema - Aligned with Better Auth Stripe plugin
export const subscriptions = pgTable(
  'subscription',
  {
    // Better Auth required fields
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

    // Optional audit fields
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
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
