import {
  createSubscriptionDao,
  getActiveSubscriptionsByStripeCustomerIdDao,
  getActiveSubscriptionsByUserIdDao,
  getSubscriptionByIdDao,
  getSubscriptionByUserIdDao,
  initSubscriptionDao,
  isActivePlanExistDao,
  isPlanExistDao,
  updateSubscriptionDao,
} from '@/db/repositories/subscription-repository'
import {
  getUserByEmailDao,
  getUserByIdDao,
  updateUserSafeByUidDao,
} from '@/db/repositories/user-repository'
import {
  canReadSubscription,
  canUpdateSubscription,
} from '@/services/authorization/subscription-authorization'
import {
  type CreateSubscription,
  PlanConst,
  type Subscription,
  type SubscriptionPlan,
  type UpdateSubscription,
} from '@/services/types/domain/subscription-types'
import {
  createSubscriptionServiceSchema,
  updateSubscriptionServiceSchema,
} from '@/services/validation/subscription-validation'

import {AuthorizationError} from './errors/authorization-error'
import {ValidationError} from './errors/validation-error'

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
