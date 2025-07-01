import {
  createSubscriptionDao,
  getActiveSubscriptionsByStripeCustomerIdDao,
  getActiveSubscriptionsByUserIdDao,
  getSubscriptionByIdDao,
  getSubscriptionByUserIdDao,
  initSubscriptionDao,
  isActivePlanExistDao,
  isPlanAndStripeSubscriptionExistDao,
  isPlanExistDao,
  updateSubscriptionDao,
} from '@/db/repositories/subscription-repository'
import {
  getUserByEmailDao,
  getUserByIdDao,
  updateUserSafeByUidDao,
} from '@/db/repositories/user-repository'
import {BILLING_MODE} from '@/lib/helper/subscription-helper'
import {logger} from '@/lib/logger'
import {freeStripePlan} from '@/lib/stripe/stripe-plans'
import {
  canReadSubscription,
  canUpdateSubscription,
} from '@/services/authorization/subscription-authorization'
import {
  BillingModes,
  type CreateSubscription,
  type LimitType,
  LimitTypeConst,
  PlanConst,
  type Subscription,
  type SubscriptionPlan,
  type UpdateSubscription,
} from '@/services/types/domain/subscription-types'
import {
  createSubscriptionServiceSchema,
  updateSubscriptionServiceSchema,
} from '@/services/validation/subscription-validation'

import {getAuthUser} from './authentication/auth-service'
import {AuthorizationError} from './errors/authorization-error'
import {ValidationError} from './errors/validation-error'
import {getUserOrganizationsService} from './organization-service'
import {OrganizationRoleConst} from './types/domain/organization-types'
import {User} from './types/domain/user-types'

export const createSubscriptionService = async (params: CreateSubscription) => {
  const parsed = createSubscriptionServiceSchema.safeParse(params)
  if (!parsed.success) {
    throw new ValidationError(parsed.error.message)
  }

  const subscription = await createSubscriptionDao(parsed.data)
  return subscription
}

export const getSubscriptionByIdService = async (id: string) => {
  const canRead = await canReadSubscription(id)
  if (!canRead) {
    throw new AuthorizationError('Accès non autorisé')
  }

  const subscription = await getSubscriptionByIdDao(id)
  return subscription
}

export const updateSubscriptionService = async (params: UpdateSubscription) => {
  const parsed = updateSubscriptionServiceSchema.safeParse(params)
  if (!parsed.success) {
    throw new ValidationError(parsed.error.message)
  }

  const canUpdate = await canUpdateSubscription(params.id)
  if (!canUpdate) {
    throw new AuthorizationError('Accès non autorisé')
  }

  return updateSubscriptionDao(params.id, parsed.data)
}

export const isPlanExistService = async (
  referenceId: string,
  plan: SubscriptionPlan,
  seats: number,
  checkActiveOnly = true
): Promise<boolean> => {
  try {
    if (checkActiveOnly) {
      return isActivePlanExistDao(referenceId, plan, seats)
    }
    return isPlanExistDao(referenceId, plan, seats)
  } catch (error) {
    console.error('Error checking plan existence:', error)
    throw new Error('Failed to check plan existence')
  }
}

// Simplified for Better Auth - no more dual workflow
export const createSubscriptionFromStripeService = async (
  email: string,
  plan: SubscriptionPlan,
  yearly: boolean = false,
  stripeSubscriptionId?: string,
  stripeCustomerId?: string,
  seats: number = 1,
  endDate?: Date | null
) => {
  const user = await getUserByEmailDao(email)
  if (!user) {
    throw new Error('User not found')
  }

  // Vérifier si l'abonnement existe déjà
  const planExists = await isPlanExistService(user.id, plan, seats, true)
  if (planExists) {
    console.warn('⚠️ User already has an active subscription')
    //throw new Error(`User already has an active ${plan} subscription`)
  }
  const planAndStripeSubscriptionExist =
    await isPlanAndStripeSubscriptionExistDao(
      user.organizations?.[0]?.organizationId || user.id,
      plan
    )
  if (planAndStripeSubscriptionExist) {
    console.warn(
      "⚠️You're already subscribed to a plan with a stripe subscription"
    )
  }

  const currentDate = new Date()
  // let endDate: Date | null = null

  // Better Auth approach: calculate end date based on plan type
  // Lifetime plans don't have end dates, recurring plans do
  if (!endDate && plan !== PlanConst.LIFETIME) {
    endDate = new Date()
    if (yearly) {
      endDate.setFullYear(endDate.getFullYear() + 1)
    } else {
      endDate.setMonth(endDate.getMonth() + 1)
    }
  }

  if (!user.stripeCustomerId) {
    const res = await updateUserSafeByUidDao(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        stripeCustomerId: stripeCustomerId || user.stripeCustomerId,
      },
      user.id
    )
    console.log('🔧 updateUser stripeCustomerId ', res)
  }

  const subscription = await createSubscriptionDao({
    referenceId: user.id,
    plan,
    status: 'active',
    periodStart: currentDate,
    periodEnd: endDate,
    stripeCustomerId: stripeCustomerId || user.stripeCustomerId,
    stripeSubscriptionId: stripeSubscriptionId || '',
    seats,
  })

  return subscription
}

export const getSubscriptionByUserIdService = async (userId: string) => {
  const user = await getUserByIdDao(userId)
  if (!user) {
    throw new Error('User not found')
  }

  // Utilise referenceId (userId) pour la recherche car c'est l'identifiant Better Auth
  const subscription = await getSubscriptionByUserIdDao(userId)
  return subscription
}

export const getActiveSubscriptionsByUserIdService = async (userId: string) => {
  // Vérifier si l'utilisateur existe
  const user = await getUserByIdDao(userId)
  if (!user) {
    throw new Error('User not found')
  }

  // Utilise referenceId (userId) pour la recherche car c'est l'identifiant Better Auth
  const subscriptions = await getActiveSubscriptionsByUserIdDao(userId)

  if (subscriptions.length === 0) {
    return subscriptions
  }
  // Vérifier les permissions
  const canRead = await canReadSubscription(subscriptions[0].id)

  if (!canRead) {
    throw new AuthorizationError('Accès non autorisé')
  }
  return subscriptions
}

export const getActiveSubscriptionsByUserEmailService = async (
  email: string
) => {
  // Récupérer l'utilisateur par email
  const user = await getUserByEmailDao(email)
  if (!user) {
    throw new Error('User not found')
  }

  // Utiliser le service existant avec l'ID
  return getActiveSubscriptionsByUserIdService(user.id)
}

// Nouvelles fonctions pour les cas où on a besoin d'utiliser stripeCustomerId
export const getActiveSubscriptionsByStripeCustomerIdService = async (
  stripeCustomerId: string
) => {
  const subscriptions =
    await getActiveSubscriptionsByStripeCustomerIdDao(stripeCustomerId)
  return subscriptions
}

export const initSubscriptionService = async (params: {
  plan: SubscriptionPlan
  seats: number
  referenceId?: string
  stripeCustomerId?: string
}): Promise<string> => {
  // Validation des paramètres
  if (!params.plan) {
    throw new ValidationError('Plan is required')
  }
  if (!params.seats || params.seats < 1) {
    throw new ValidationError('Seats must be at least 1')
  }
  if (params.referenceId) {
    const planExists = await isPlanExistService(
      params.referenceId,
      params.plan,
      params.seats,
      true
    )

    if (planExists) {
      throw new ValidationError("You're already subscribed to this plan")
    }
    // Vérifier si l'utilisateur a déjà un abonnement avec ce stripe subscription
    // on veut eviter decraser une soucription si elle na pas etait cancel dans stripe portal
    const planAndStripeSubscriptionExist =
      await isPlanAndStripeSubscriptionExistDao(params.referenceId, params.plan)
    if (planAndStripeSubscriptionExist) {
      throw new ValidationError(
        "You're already subscribed to a plan with a stripe subscription"
      )
    }
  }

  let existingSubscription
  if (params.referenceId) {
    const subscriptions = await getSubscriptionByUserIdDao(params.referenceId)
    existingSubscription = subscriptions.find(
      (sub) => sub.status === 'active' || sub.status === 'trialing'
    )
  }
  if (existingSubscription) {
    return existingSubscription.id
  }
  // Créer la subscription en statut 'incomplete'
  const subscriptionId = await initSubscriptionDao(params)

  return subscriptionId
}

/**
 * Service spécialisé pour la mise à jour des subscriptions depuis les webhooks
 * Pas de vérification d'autorisation car les webhooks sont des sources trusted
 */
export const updateSubscriptionForWebhookService = async (params: {
  subscriptionId: string
  referenceId: string
  stripeCustomerId?: string
}): Promise<Subscription> => {
  // Validation simple des paramètres
  if (!params.subscriptionId) {
    throw new ValidationError('SubscriptionId is required')
  }
  if (!params.referenceId) {
    throw new ValidationError('ReferenceId is required')
  }

  // Vérifier que la subscription existe
  const existingSubscription = await getSubscriptionByIdDao(
    params.subscriptionId
  )
  if (!existingSubscription) {
    throw new ValidationError(
      `Subscription with id ${params.subscriptionId} not found`
    )
  }

  // Préparation des données à mettre à jour
  const updateData: Partial<Parameters<typeof updateSubscriptionDao>[1]> = {
    referenceId: params.referenceId,
  }

  // Ajouter stripeCustomerId si fourni
  if (params.stripeCustomerId) {
    updateData.stripeCustomerId = params.stripeCustomerId
  }

  // Mise à jour directe sans autorisation (webhook trusted)
  const updatedSubscription = await updateSubscriptionDao(
    params.subscriptionId,
    updateData
  )

  if (!updatedSubscription) {
    throw new Error('Failed to update subscription')
  }

  return updatedSubscription
}

/**
 * 🎯 Détermine le referenceId pour les subscriptions selon le mode de facturation
 */
export async function getBillingReferenceId(
  userId?: string,
  organizationId?: string
): Promise<string> {
  // Si organizationId explicite fourni, l'utiliser en mode organization
  if (organizationId && BILLING_MODE === BillingModes.ORGANIZATION) {
    return organizationId
  }

  // Mode USER : utilise toujours l'userId
  if (BILLING_MODE === BillingModes.USER) {
    const user = userId ? {id: userId} : await getAuthUser()
    if (!user?.id) {
      throw new Error('User ID required for user billing mode')
    }
    return user.id
  }

  // Mode ORGANIZATION : récupère l'org par défaut de l'user
  if (BILLING_MODE === BillingModes.ORGANIZATION) {
    const user = userId ? {id: userId} : await getAuthUser()
    if (!user?.id) {
      throw new Error('User ID required to get organization')
    }

    // Récupérer la première organisation de l'utilisateur (ou celle créée automatiquement)
    const organizations = await getUserOrganizationsService(user.id)
    const defaultOrg =
      organizations.find((org) => org.role === OrganizationRoleConst.owner) ||
      organizations[0] // Cherche d'abord le rôle owner, sinon prend la première org

    if (!defaultOrg) {
      console.warn(
        'No organization found for user : referenceId is user.id',
        user.id
      )
      return user.id
    }

    return defaultOrg.organizationId
  }

  throw new Error(`Invalid billing mode: ${BILLING_MODE}`)
}

/**
 * 🏢 Récupère le contexte de facturation complet
 */
export async function getBillingContext(
  userId?: string,
  organizationId?: string
) {
  const referenceId = await getBillingReferenceId(userId, organizationId)

  return {
    referenceId,
    billingMode: BILLING_MODE,
    isUserBilling: BILLING_MODE === BillingModes.USER,
    isOrganizationBilling: BILLING_MODE === BillingModes.ORGANIZATION,
  }
}

/**
 * 🎫 Validation des permissions pour la gestion de subscription
 */
export async function canManageSubscription(
  referenceId: string,
  user?: User
): Promise<boolean> {
  const authUser = user || (await getAuthUser())
  if (!authUser?.id) return false

  // Mode USER : seul le propriétaire peut gérer
  if (BILLING_MODE === BillingModes.USER) {
    return authUser.id === referenceId
  }

  // Mode ORGANIZATION : vérifier les permissions dans l'org
  if (BILLING_MODE === BillingModes.ORGANIZATION) {
    const organizations = await getUserOrganizationsService(authUser.id)
    const userOrg = organizations.find(
      (org) => org.organizationId === referenceId
    )

    // User doit être OWNER ou ADMIN pour gérer les subscriptions
    return userOrg?.role === 'owner' || userOrg?.role === 'admin'
  }

  return false
}

/**
 * 📊 Helper pour affichage UI
 */
export function getBillingDisplayInfo() {
  return {
    mode: BILLING_MODE,
    isUserBilling: BILLING_MODE === BillingModes.USER,
    isOrganizationBilling: BILLING_MODE === BillingModes.ORGANIZATION,
    billingEntity:
      BILLING_MODE === BillingModes.USER ? 'utilisateur' : 'organisation',
    seatLabel: BILLING_MODE === BillingModes.USER ? 'utilisateur' : 'membres',
  }
}

export type SubscriptionLimit = {
  allowed: boolean
  limit: number
  usage: number
  remaining: number
  hasSubscription: boolean
  limitType: LimitType
  plan: string
}

export const perSeatMultiplier = false //todo env

/**
 * 🎯 Vérification générique des limites d'abonnement (logique métier pure)
 */
export const checkSubscriptionLimitService = (
  subscription: {
    limits?: Record<string, number>
    seats?: number
    plan?: string
  } | null,
  limitType: LimitType,
  currentUsage: number,
  requestedAmount: number = 1
): SubscriptionLimit => {
  if (!subscription) {
    logger.warn('[checkSubscriptionLimitService] no subscription')
    return {
      allowed: false,
      limit: 0,
      usage: currentUsage,
      remaining: 0,
      hasSubscription: false,
      limitType,
      plan: freeStripePlan.name,
    }
  }

  // 🎯 Logique spécifique selon le type de limite
  let effectiveLimit: number

  if (limitType === LimitTypeConst.USERS) {
    // Pour les utilisateurs : utiliser le nombre de sièges
    effectiveLimit = subscription.seats || 0
  } else {
    // Pour les autres ressources : utiliser la limite fixe du plan
    if (perSeatMultiplier) {
      //si les limites sont multiplier par nombres de seat
      effectiveLimit =
        (subscription.limits?.[limitType] || 1) * (subscription.seats || 1)
    } else {
      console.log('subscription.limits', subscription)
      effectiveLimit = subscription.limits?.[limitType] || 0
    }
  }

  const remaining = Math.max(0, effectiveLimit - currentUsage)

  return {
    allowed: currentUsage + requestedAmount <= effectiveLimit,
    limit: effectiveLimit,
    usage: currentUsage,
    remaining,
    hasSubscription: true,
    limitType,
    plan: subscription.plan || freeStripePlan.name,
  }
}
