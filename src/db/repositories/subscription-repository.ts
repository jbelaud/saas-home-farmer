import {and, desc, eq, not, or} from 'drizzle-orm'

import db from '../models/db'
import type {
  SubscriptionAddModel,
  SubscriptionModel,
} from '../models/subscription-model'
import {subscription} from '../models/subscription-model'

export const createSubscriptionDao = async (values: SubscriptionAddModel) => {
  const [row] = await db.insert(subscription).values(values).returning()
  return row
}

export const getSubscriptionByIdDao = async (id: string) => {
  const [row] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.id, id))
  return row
}

export const updateSubscriptionDao = async (
  id: string,
  values: Partial<SubscriptionAddModel>
) => {
  const [row] = await db
    .update(subscription)
    .set({
      ...values,
      updatedAt: new Date(),
    })
    .where(eq(subscription.id, id))
    .returning()
  return row
}

export const isPlanExistDao = async (
  referenceId: string,
  plan: SubscriptionModel['plan'],
  seats: number
): Promise<boolean> => {
  const [row] = await db
    .select({id: subscription.id})
    .from(subscription)
    .where(
      and(
        eq(subscription.referenceId, referenceId),
        eq(subscription.plan, plan),
        eq(subscription.seats, seats)
      )
    )
    .limit(1)

  return Boolean(row)
}

export const isPlanAndStripeSubscriptionExistDao = async (
  referenceId: string,
  plan: SubscriptionModel['plan']
): Promise<boolean> => {
  const [row] = await db
    .select({id: subscription.id})
    .from(subscription)
    .where(
      and(
        eq(subscription.referenceId, referenceId),
        eq(subscription.plan, plan),

        or(
          eq(subscription.status, 'active'),
          eq(subscription.status, 'trialing')
        ),
        not(eq(subscription.stripeSubscriptionId, ''))
      )
    )
    .limit(1)

  return Boolean(row)
}

export const isActivePlanExistDao = async (
  referenceId: string,
  plan: SubscriptionModel['plan'],
  seats: number
): Promise<boolean> => {
  const [row] = await db
    .select({id: subscription.id})
    .from(subscription)
    .where(
      and(
        eq(subscription.referenceId, referenceId),
        eq(subscription.plan, plan),
        eq(subscription.seats, seats),
        or(
          eq(subscription.status, 'active'),
          eq(subscription.status, 'trialing')
        )
      )
    )
    .limit(1)

  return Boolean(row)
}

export const getActiveSubscriptionsByStripeCustomerIdDao = async (
  stripeCustomerId: string
) => {
  const rows = await db
    .select()
    .from(subscription)
    .where(
      and(
        eq(subscription.stripeCustomerId, stripeCustomerId),
        or(
          eq(subscription.status, 'active'),
          eq(subscription.status, 'trialing')
        )
      )
    )
    .orderBy(desc(subscription.createdAt))

  return rows
}

// Fonctions de commodité qui utilisent userId (referenceId) au lieu de stripeCustomerId
export const getSubscriptionByUserIdDao = async (userId: string) => {
  const row = await db
    .select()
    .from(subscription)
    .where(eq(subscription.referenceId, userId))
  return row
}

export const getActiveSubscriptionsByUserIdDao = async (userId: string) => {
  const rows = await db
    .select()
    .from(subscription)
    .where(
      and(
        eq(subscription.referenceId, userId),
        or(
          eq(subscription.status, 'active'),
          eq(subscription.status, 'trialing')
        )
      )
    )
    .orderBy(desc(subscription.createdAt))

  return rows
}

export const initSubscriptionDao = async (params: {
  plan: SubscriptionModel['plan']
  seats: number
  referenceId?: string
  stripeCustomerId?: string
}): Promise<string> => {
  const [row] = await db
    .insert(subscription)
    .values({
      plan: params.plan,
      seats: params.seats,
      referenceId: params.referenceId || 'guest', // Guest mode si pas d'utilisateur
      stripeCustomerId: params.stripeCustomerId,
      status: 'incomplete',
      periodStart: new Date(),
      // periodEnd laissé undefined (sera rempli après paiement)
      // stripeSubscriptionId laissé undefined (sera rempli par webhook)
    })
    .returning({id: subscription.id})

  return row.id
}
