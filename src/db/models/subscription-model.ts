import {relations, sql} from 'drizzle-orm'
import {
  boolean,
  decimal,
  integer,
  json,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

import {user} from './auth-model'

// Define enums pour les plans
export const planStatusEnum = pgEnum('plan_status', [
  'active',
  'inactive',
  'deprecated',
])

// Define table schema pour les plans - Compatible avec StripePlan de better auth
export const subscriptionPlan = pgTable('subscription_plan', {
  id: uuid('id')
    .default(sql`uuid_generate_v4()`)
    .primaryKey(),

  // Champs principaux du StripePlan
  name: text('name').notNull().unique(), // Correspond au 'name' de StripePlan (ex: 'pro', 'entreprise', 'lifetime')
  priceId: text('price_id').notNull(), // Correspond au 'priceId' de StripePlan
  annualDiscountPriceId: text('annual_discount_price_id'), // Correspond au 'annualDiscountPriceId' de StripePlan

  // Limites sous forme d'objet JSON - Plus flexible
  limits: json('limits'),

  // Trial sous forme d'objet JSON - Plus flexible
  freeTrial: json('free_trial'),

  // Champs étendus pour l'application
  planName: text('plan_name').notNull(), // Nom d'affichage ('Pro', 'Enterprise', 'Lifetime')
  description: text('description'), // Description du plan
  features: json('features'), // Liste des fonctionnalités (array JSON)

  // Pricing pour affichage
  price: decimal('price', {precision: 10, scale: 2}), // Prix mensuel en décimal
  yearlyPrice: decimal('yearly_price', {precision: 10, scale: 2}), // Prix annuel en décimal
  currency: text('currency').default('EUR').notNull(),

  // Méta-données du plan
  isRecurring: boolean('is_recurring').default(true).notNull(),
  status: planStatusEnum('status').default('active').notNull(),

  // Versioning pour plans legacy
  version: integer('version').default(1).notNull(),
  isLegacy: boolean('is_legacy').default(false).notNull(),

  // Ordre d'affichage
  displayOrder: integer('display_order').default(0).notNull(),

  // Audit fields
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Define table schema - Aligned with Better Auth Stripe plugin
export const subscription = pgTable(
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
  }
  // (table) => ({
  //   userPlanUnique: uniqueIndex('user_plan_unique_idx').on(
  //     table.stripeCustomerId,
  //     table.plan
  //   ),
  // })
)

// Define relations
export const subscriptionsRelations = relations(subscription, ({one}) => ({
  user: one(user, {
    fields: [subscription.stripeCustomerId],
    references: [user.stripeCustomerId],
  }),
  subscriptionPlan: one(subscriptionPlan, {
    fields: [subscription.plan],
    references: [subscriptionPlan.name], // Relation basée sur le 'name' du plan
  }),
}))

export const subscriptionPlanRelations = relations(
  subscriptionPlan,
  ({many}) => ({
    subscriptions: many(subscription),
  })
)

// Export types pour les plans
export type SubscriptionPlanModel = typeof subscriptionPlan.$inferSelect
export type SubscriptionPlanAddModel = typeof subscriptionPlan.$inferInsert

// Export types pour les subscriptions
export type SubscriptionModel = typeof subscription.$inferSelect
export type SubscriptionAddModel = typeof subscription.$inferInsert
