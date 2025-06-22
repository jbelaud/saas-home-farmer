import {and, desc, eq, lte, sql} from 'drizzle-orm'

import db from '../models/db'
import type {
  SubscriptionAddModel,
  SubscriptionModel,
} from '../models/subscription-model'
import {subscriptions} from '../models/subscription-model'

export const createSubscriptionDao = async (
  subscription: SubscriptionAddModel
) => {
  const [row] = await db.insert(subscriptions).values(subscription).returning()
  return row
}

export const getSubscriptionByIdDao = async (id: string) => {
  const [row] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.id, id))
  return row
}

export const getSubscriptionByStripeCustomerIdDao = async (
  stripeCustomerId: string
) => {
  const [row] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeCustomerId, stripeCustomerId))
  return row
}

export const getActiveSubscriptionByStripeCustomerIdDao = async (
  stripeCustomerId: string
) => {
  const [row] = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.stripeCustomerId, stripeCustomerId),
        eq(subscriptions.status, 'active')
      )
    )
  return row
}

export const updateSubscriptionDao = async (
  id: string,
  subscription: Partial<SubscriptionAddModel>
) => {
  const [row] = await db
    .update(subscriptions)
    .set({
      ...subscription,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.id, id))
    .returning()
  return row
}

export const cancelSubscriptionDao = async (id: string) => {
  const [row] = await db
    .update(subscriptions)
    .set({
      status: 'canceled',
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.id, id))
    .returning()
  return row
}

export const getExpiringSubscriptionsDao = async (daysThreshold: number) => {
  const thresholdDate = new Date()
  thresholdDate.setDate(thresholdDate.getDate() + daysThreshold)

  return db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.status, 'active'),
        lte(subscriptions.periodEnd, thresholdDate)
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
      .from(subscriptions)
      .limit(pagination.limit)
      .offset(pagination.offset),
    db.select({count: sql<number>`count(*)`}).from(subscriptions),
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
      .from(subscriptions)
      .where(eq(subscriptions.plan, plan))
      .limit(pagination.limit)
      .offset(pagination.offset),
    db
      .select({count: sql<number>`count(*)`})
      .from(subscriptions)
      .where(eq(subscriptions.plan, plan)),
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
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.stripeCustomerId, stripeCustomerId),
        eq(subscriptions.plan, plan)
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
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.stripeCustomerId, stripeCustomerId),
        eq(subscriptions.plan, plan),
        eq(subscriptions.status, 'active')
      )
    )
  return row
}

export const isPlanExistDao = async (
  stripeCustomerId: string,
  plan: SubscriptionModel['plan']
): Promise<boolean> => {
  const [row] = await db
    .select({id: subscriptions.id})
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.stripeCustomerId, stripeCustomerId),
        eq(subscriptions.plan, plan)
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
    .select({id: subscriptions.id})
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.stripeCustomerId, stripeCustomerId),
        eq(subscriptions.plan, plan),
        eq(subscriptions.status, 'active')
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
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.stripeCustomerId, stripeCustomerId),
        eq(subscriptions.status, 'active')
      )
    )
    .orderBy(desc(subscriptions.createdAt))

  return rows
}

// Fonctions de commodité qui utilisent userId (referenceId) au lieu de stripeCustomerId
export const getSubscriptionByUserIdDao = async (userId: string) => {
  const [row] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.referenceId, userId))
  return row
}

export const getActiveSubscriptionsByUserIdDao = async (userId: string) => {
  const rows = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.referenceId, userId),
        eq(subscriptions.status, 'active')
      )
    )
    .orderBy(desc(subscriptions.createdAt))

  return rows
}
