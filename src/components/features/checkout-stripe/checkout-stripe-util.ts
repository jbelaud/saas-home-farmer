import {logger} from '@/lib/logger'
import type {SubscriptionPlan} from '@/services/types/domain/subscription-types'
import type {User} from '@/services/types/domain/user-types'

// Types communs pour tous les modes de checkout
export type CheckoutMode = 'guest' | 'authenticated'

export type CustomerInfo = {
  customerId?: string
  customerEmail?: string
  user?: User
}

export type SubscriptionData = {
  subscriptionId: string
  plan: {
    planCode: SubscriptionPlan
    isReccuring: boolean
    isYearly: boolean
  }
  seats: number
}

export type CheckoutResult = {
  success: boolean
  error?: string
  // Pour external checkout
  url?: string | null
  sessionId?: string
  // Pour embed checkout
  sessionUrl?: string | null
  clientSecret?: string | null
}

export type CheckoutParams = {
  priceId: string
  seats: number
  guest: boolean
}

// Types spécifiques pour les fonctions communes
export type ValidationResult = {
  user: User | undefined
  plan: {
    planCode: SubscriptionPlan
    isReccuring: boolean
    isYearly: boolean
  }
  mode: CheckoutMode
}

export type MetadataConfig = {
  mode: CheckoutMode
  subscriptionData: SubscriptionData
  customerInfo: CustomerInfo
  checkoutType: 'external' | 'embed'
}

// 🛠️ Fonctions utilitaires communes

/**
 * Validation du mode de checkout - fonction commune réutilisable
 */
export function validateCheckoutMode(
  guest: boolean,
  user: User | undefined,
  context: string
): CheckoutMode {
  const isGuestCheckout = guest && !user
  const isUserCheckout = !guest && !!user

  // Vérifier que le mode est valide
  if (!isGuestCheckout && !isUserCheckout) {
    if (guest && user) {
      logger.error(
        `[${context}] ❌ Échec: impossible mode guest avec utilisateur connecté`
      )
      throw new Error(
        'Mode guest impossible avec utilisateur connecté - utilisez guest=false'
      )
    } else {
      logger.error(
        `[${context}] ❌ Échec: utilisateur non connecté en mode non-guest`
      )
      throw new Error(
        'Utilisateur non connecté - utilisez le mode guest ou connectez-vous'
      )
    }
  }

  return isGuestCheckout ? 'guest' : 'authenticated'
}

/**
 * Création des metadata communes
 */
export function createBaseMetadata(
  mode: CheckoutMode,
  subscriptionData: SubscriptionData,
  customerInfo: CustomerInfo,
  checkoutType: 'external' | 'embed'
): Record<string, string> {
  const baseMetadata = {
    subscriptionId: subscriptionData.subscriptionId,
    source: 'custom_checkout',
    checkoutType,
    isReccuring: subscriptionData.plan.isReccuring ? 'true' : 'false',
    seats: subscriptionData.seats.toString(),
    plan: subscriptionData.plan.planCode,
    interval: subscriptionData.plan.isYearly ? 'year' : 'month',
  }

  if (mode === 'guest') {
    logger.debug(`[${checkoutType.toUpperCase()}-CHECKOUT] Configuration guest`)
    return {
      ...baseMetadata,
      guest_checkout: 'true',
    }
  }

  // Mode authenticated
  if (!customerInfo.user) {
    throw new Error('User required for metadata creation')
  }

  logger.debug(
    `[${checkoutType.toUpperCase()}-CHECKOUT] Configuration utilisateur connecté:`,
    {
      customerId: customerInfo.customerId,
      customerEmail: customerInfo.customerEmail,
      userId: customerInfo.user.id,
      email: customerInfo.user.email,
    }
  )

  return {
    ...baseMetadata,
    email: customerInfo.user.email ?? '',
    userId: customerInfo.user.id,
    customerEmail: customerInfo.user.email ?? '',
  }
}
