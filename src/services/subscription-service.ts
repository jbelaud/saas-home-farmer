import {ValidationError} from './errors/validation-error'
import {AuthorizationError} from './errors/authorization-error'
import {
  createSubscriptionDao,
  getSubscriptionByIdDao,
  getSubscriptionByUserIdDao,
  updateSubscriptionDao,
  isPlanExistDao,
  isActivePlanExistDao,
  getActiveSubscriptionsByUserIdDao,
} from '@/db/repositories/subscription-repository'
import {
  getUserByEmailDao,
  getUserByIdDao,
} from '@/db/repositories/user-repository'
import {
  createSubscriptionServiceSchema,
  updateSubscriptionServiceSchema,
} from '@/services/validation/subscription-validation'

import {
  canReadSubscription,
  canUpdateSubscription,
} from '@/services/authorization/subscription-authorization'
import type {
  CreateSubscription,
  SubscriptionPlan,
  UpdateSubscription,
  SubscriptionType,
} from '@/services/types/domain/subscription-types'

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
  // if (!subscription) {
  //   throw new Error('Subscription not found')
  // }

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
    if (checkActiveOnly) {
      return isActivePlanExistDao(user.id, plan)
    }
    return isPlanExistDao(user.id, plan)
  } catch (error) {
    console.error('Error checking plan existence:', error)
    throw new Error('Failed to check plan existence')
  }
}

export const createSubscriptionFromStripeService = async (
  email: string,
  plan: SubscriptionPlan,
  yearly: boolean,
  mode: SubscriptionType = 'payment'
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

  // Déterminer la date de fin en fonction du mode de paiement
  if (mode === 'payment') {
    // C'est un paiement unique, donc pas de date de fin

    endDate = null
  } else if (mode === 'subscription') {
    // C'est un abonnement, on calcule la date de fin
    endDate = new Date()
    if (yearly) {
      endDate.setFullYear(endDate.getFullYear() + 1)
    } else {
      endDate.setMonth(endDate.getMonth() + 1)
    }
  }

  const subscription = await createSubscriptionDao({
    userId: user.id,
    plan,
    status: 'active',
    subscriptionType: mode,
    // Dates principales
    startDate: currentDate,
    endDate, // null pour paiement unique, date pour abonnement

    // Période de facturation
    currentPeriodStart: currentDate,
    currentPeriodEnd: endDate || currentDate,

    // Pour les abonnements Stripe
    // stripeSubscriptionId: 'sub_xxx',
    // priceId: 'price_xxx',
    // paymentMethodId: 'pm_xxx',

    // ...(mode === 'subscription' && {
    //   stripeSubscriptionId: 'sub_xxx',
    //   priceId: 'price_xxx',
    // }),

    quantity: 1,
    metadata: {
      mode,
      yearly,
    },
  })

  return subscription
}

export const getSubscriptionByUserIdService = async (userId: string) => {
  const user = await getUserByIdDao(userId)
  if (!user) {
    throw new Error('User not found')
  }

  const subscription = await getSubscriptionByUserIdDao(userId)
  // if (!subscription) {
  //   throw new Error('Subscription not found')
  // }

  return subscription
}

export const getActiveSubscriptionsByUserIdService = async (userId: string) => {
  try {
    // Vérifier si l'utilisateur existe
    const user = await getUserByIdDao(userId)
    if (!user) {
      throw new Error('User not found')
    }

    // Récupérer les abonnements actifs
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
  } catch (error) {
    console.error('Error getting active subscriptions:', error)
    throw error
  }
}

export const getActiveSubscriptionsByUserEmailService = async (
  email: string
) => {
  try {
    // Récupérer l'utilisateur par email
    const user = await getUserByEmailDao(email)
    if (!user) {
      throw new Error('User not found')
    }

    // Utiliser le service existant avec l'ID
    return getActiveSubscriptionsByUserIdService(user.id)
  } catch (error) {
    console.error('Error getting active subscriptions by email:', error)
    throw error
  }
}
