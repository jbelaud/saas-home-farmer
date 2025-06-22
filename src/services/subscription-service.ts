import {
  createSubscriptionDao,
  getActiveSubscriptionsByStripeCustomerIdDao,
  getActiveSubscriptionsByUserIdDao,
  getSubscriptionByIdDao,
  getSubscriptionByUserIdDao,
  isActivePlanExistDao,
  isPlanExistDao,
  updateSubscriptionDao,
} from '@/db/repositories/subscription-repository'
import {
  getUserByEmailDao,
  getUserByIdDao,
} from '@/db/repositories/user-repository'
import {
  canReadSubscription,
  canUpdateSubscription,
} from '@/services/authorization/subscription-authorization'
import type {
  CreateSubscription,
  SubscriptionPlan,
  UpdateSubscription,
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
  email: string,
  plan: SubscriptionPlan,
  checkActiveOnly = false
): Promise<boolean> => {
  const user = await getUserByEmailDao(email)
  if (!user) {
    return false
  }
  try {
    // Utilise stripeCustomerId si disponible, sinon userId
    const customerId = user.stripeCustomerId || user.id

    if (checkActiveOnly) {
      return isActivePlanExistDao(customerId, plan)
    }
    return isPlanExistDao(customerId, plan)
  } catch (error) {
    console.error('Error checking plan existence:', error)
    throw new Error('Failed to check plan existence')
  }
}

// Simplified for Better Auth - no more dual workflow
export const createSubscriptionFromStripeService = async (
  email: string,
  plan: SubscriptionPlan,
  yearly: boolean = false
) => {
  const user = await getUserByEmailDao(email)
  if (!user) {
    throw new Error('User not found')
  }

  // Vérifier si l'abonnement existe déjà
  const planExists = await isPlanExistService(email, plan, true)
  if (planExists) {
    throw new Error(`User already has an active ${plan} subscription`)
  }

  const currentDate = new Date()
  let endDate: Date | null = null

  // Better Auth approach: calculate end date based on plan type
  // Lifetime plans don't have end dates, recurring plans do
  if (plan !== 'CODEMAIL_LIFETIME') {
    endDate = new Date()
    if (yearly) {
      endDate.setFullYear(endDate.getFullYear() + 1)
    } else {
      endDate.setMonth(endDate.getMonth() + 1)
    }
  }

  const subscription = await createSubscriptionDao({
    referenceId: user.id,
    plan,
    status: 'active',
    periodStart: currentDate,
    periodEnd: endDate,
    stripeCustomerId: user.stripeCustomerId,
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
