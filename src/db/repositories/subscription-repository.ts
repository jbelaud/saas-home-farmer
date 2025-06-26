import {and, desc, eq, lte, sql} from 'drizzle-orm'

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

export const getSubscriptionByStripeCustomerIdDao = async (
  stripeCustomerId: string
) => {
  const [row] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.stripeCustomerId, stripeCustomerId))
  return row
}

export const getActiveSubscriptionByStripeCustomerIdDao = async (
  stripeCustomerId: string
) => {
  const [row] = await db
    .select()
    .from(subscription)
    .where(
      and(
        eq(subscription.stripeCustomerId, stripeCustomerId),
        eq(subscription.status, 'active')
      )
    )
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

export const cancelSubscriptionDao = async (id: string) => {
  const [row] = await db
    .update(subscription)
    .set({
      status: 'canceled',
      updatedAt: new Date(),
    })
    .where(eq(subscription.id, id))
    .returning()
  return row
}

export const getExpiringSubscriptionsDao = async (daysThreshold: number) => {
  const thresholdDate = new Date()
  thresholdDate.setDate(thresholdDate.getDate() + daysThreshold)

  return db
    .select()
    .from(subscription)
    .where(
      and(
        eq(subscription.status, 'active'),
        lte(subscription.periodEnd, thresholdDate)
      )
    )
}

export const getSubscriptionsWithPaginationDao = async (pagination: {
  limit: number
  offset: number
}) => {
  const [rows, [{count}]] = await Promise.all([
    db
      .select()
      .from(subscription)
      .limit(pagination.limit)
      .offset(pagination.offset),
    db.select({count: sql<number>`count(*)`}).from(subscription),
  ])

  const page = Math.floor(pagination.offset / pagination.limit) + 1
  const totalPages = Math.ceil(count / pagination.limit)

  return {
    data: rows,
    pagination: {
      total: count,
      page: page,
      limit: pagination.limit,
      totalPages: totalPages,
    },
  }
}

export const getSubscriptionsByPlanDao = async (
  plan: SubscriptionModel['plan'],
  pagination: {limit: number; offset: number}
) => {
  const [rows, [{count}]] = await Promise.all([
    db
      .select()
      .from(subscription)
      .where(eq(subscription.plan, plan))
      .limit(pagination.limit)
      .offset(pagination.offset),
    db
      .select({count: sql<number>`count(*)`})
      .from(subscription)
      .where(eq(subscription.plan, plan)),
  ])

  const page = Math.floor(pagination.offset / pagination.limit) + 1
  const totalPages = Math.ceil(count / pagination.limit)

  return {
    data: rows,
    pagination: {
      total: count,
      page: page,
      limit: pagination.limit,
      totalPages: totalPages,
    },
  }
}

export const getSubscriptionByStripeCustomerIdAndPlanDao = async (
  stripeCustomerId: string,
  plan: SubscriptionModel['plan']
) => {
  const [row] = await db
    .select()
    .from(subscription)
    .where(
      and(
        eq(subscription.stripeCustomerId, stripeCustomerId),
        eq(subscription.plan, plan)
      )
    )
  return row
}

export const getActiveSubscriptionByStripeCustomerIdAndPlanDao = async (
  stripeCustomerId: string,
  plan: SubscriptionModel['plan']
) => {
  const [row] = await db
    .select()
    .from(subscription)
    .where(
      and(
        eq(subscription.stripeCustomerId, stripeCustomerId),
        eq(subscription.plan, plan),
        eq(subscription.status, 'active')
      )
    )
  return row
}

export const isPlanExistDao = async (
  stripeCustomerId: string,
  plan: SubscriptionModel['plan']
): Promise<boolean> => {
  const [row] = await db
    .select({id: subscription.id})
    .from(subscription)
    .where(
      and(
        eq(subscription.stripeCustomerId, stripeCustomerId),
        eq(subscription.plan, plan)
      )
    )
    .limit(1)

  return Boolean(row)
}

export const isActivePlanExistDao = async (
  stripeCustomerId: string,
  plan: SubscriptionModel['plan']
): Promise<boolean> => {
  const [row] = await db
    .select({id: subscription.id})
    .from(subscription)
    .where(
      and(
        eq(subscription.stripeCustomerId, stripeCustomerId),
        eq(subscription.plan, plan),
        eq(subscription.status, 'active')
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
        eq(subscription.status, 'active')
      )
    )
    .orderBy(desc(subscription.createdAt))

  return rows
}

// Fonctions de commodité qui utilisent userId (referenceId) au lieu de stripeCustomerId
export const getSubscriptionByUserIdDao = async (userId: string) => {
  const [row] = await db
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
        eq(subscription.status, 'active')
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
