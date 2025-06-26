'use server'

import {headers} from 'next/headers'

import {logger} from '@/lib/logger'
import {getPlanByPriceId, stripeClient} from '@/lib/stripe/stripe-utils'
import {getAuthUser} from '@/services/authentication/auth-service'
import {initSubscriptionService} from '@/services/facades/subscription-service-facade'
import type {SubscriptionPlan} from '@/services/types/domain/subscription-types'
import type {User} from '@/services/types/domain/user-types'

// Types pour la clarté
type CheckoutMode = 'guest' | 'authenticated'

type CustomerInfo = {
  customerId?: string
  customerEmail?: string
  user?: User
}

type SubscriptionData = {
  subscriptionId: string
  plan: {
    planCode: string
    isReccuring: boolean
    isYearly: boolean
  }
  seats: number
}

// 🎯 Fonction principale refactorisée
export async function createCheckoutSession(
  priceId: string,
  seats: number = 1,
  guest: boolean = false
) {
  logger.info('[EXTERNAL-CHECKOUT] Création session checkout externe démarrée')
  logger.debug('[EXTERNAL-CHECKOUT] Paramètres reçus:', {priceId, seats, guest})

  try {
    // Récupérer l'utilisateur connecté (optionnel si guest)
    const user = await getAuthUser()
    logger.debug('[EXTERNAL-CHECKOUT] Utilisateur récupéré:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
    })

    // Valider le plan
    const plan = getPlanByPriceId(priceId)
    if (!plan) {
      logger.error(
        '[EXTERNAL-CHECKOUT] ❌ Plan non trouvé pour priceId:',
        priceId
      )
      throw new Error('Plan not found')
    }
    logger.debug('[EXTERNAL-CHECKOUT] Plan récupéré:', {
      planCode: plan.planCode,
      isReccuring: plan.isReccuring,
    })

    // 1️⃣ Validation du mode
    const mode = checkCheckoutMode(guest, user)

    // 2️⃣ Gestion customer
    const customerInfo = await initUserCustomer(mode, user)

    // 3️⃣ Initialisation subscription
    const subscriptionId = await initSubscription(
      customerInfo,
      plan.planCode,
      seats
    )

    // 4️⃣ Préparation des données
    const subscriptionData: SubscriptionData = {
      subscriptionId,
      plan,
      seats,
    }

    // 5️⃣ Création metadata
    const metadata = createMetadata(mode, subscriptionData, customerInfo)

    // 6️⃣ Création session Stripe
    const session = await createStripeSession(
      priceId,
      subscriptionData,
      customerInfo,
      metadata
    )

    return {
      success: true,
      url: session.url,
      sessionId: session.id,
    }
  } catch (error) {
    logger.error(
      '[EXTERNAL-CHECKOUT] ❌ Erreur lors de la création session:',
      error
    )
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

// 1️⃣ Validation du mode de checkout
function checkCheckoutMode(
  guest: boolean,
  user: User | undefined
): CheckoutMode {
  const isGuestCheckout = guest && !user
  const isUserCheckout = !guest && !!user

  // Vérifier que le mode est valide
  if (!isGuestCheckout && !isUserCheckout) {
    if (guest && user) {
      logger.error(
        '[EXTERNAL-CHECKOUT] ❌ Échec: impossible mode guest avec utilisateur connecté'
      )
      throw new Error(
        'Mode guest impossible avec utilisateur connecté - utilisez guest=false'
      )
    } else {
      logger.error(
        '[EXTERNAL-CHECKOUT] ❌ Échec: utilisateur non connecté en mode non-guest'
      )
      throw new Error(
        'Utilisateur non connecté - utilisez le mode guest ou connectez-vous'
      )
    }
  }

  return isGuestCheckout ? 'guest' : 'authenticated'
}

// 2️⃣ Gestion du customer selon le mode
async function initUserCustomer(
  mode: CheckoutMode,
  user: User | undefined
): Promise<CustomerInfo> {
  if (mode === 'guest') {
    logger.info('[EXTERNAL-CHECKOUT] 📋 Mode guest détecté')
    return {
      customerId: undefined,
      customerEmail: undefined,
      user: undefined,
    }
  }

  // Mode authenticated
  if (!user) {
    throw new Error('User required for authenticated checkout')
  }

  logger.info('[EXTERNAL-CHECKOUT] 👤 Mode utilisateur connecté détecté')

  let customerId = user.stripeCustomerId || undefined

  //mode connecté on veut set le stripeCustomerId si non disponible pour etre better-auth compliant
  if (!customerId) {
    logger.info('[EXTERNAL-CHECKOUT] 🔧 Création customer Stripe')
    const customer = await stripeClient.customers.create({
      email: user.email,
      metadata: {
        userId: user.id,
        managed_by: 'custom_checkout',
      },
    })
    customerId = customer.id
    logger.debug('[EXTERNAL-CHECKOUT] Customer Stripe créé:', {customerId})
  }

  return {
    customerId,
    customerEmail: undefined,
    user,
  }
}

// 3️⃣ Initialisation de la subscription
async function initSubscription(
  customerInfo: CustomerInfo,
  planCode: SubscriptionPlan,
  seats: number
): Promise<string> {
  logger.info('[EXTERNAL-CHECKOUT] 💾 Initialisation subscription en BDD')

  const subscriptionId = await initSubscriptionService({
    plan: planCode,
    seats,
    referenceId: customerInfo.user?.id,
    stripeCustomerId: customerInfo.customerId,
  })

  logger.debug('[EXTERNAL-CHECKOUT] Subscription initialisée:', {
    subscriptionId,
  })

  if (!subscriptionId) {
    logger.error(
      "[EXTERNAL-CHECKOUT] ❌ Erreur lors de l'initialisation de la subscription"
    )
    throw new Error("Erreur lors de l'initialisation de la subscription")
  }

  return subscriptionId
}

// 4️⃣ Création des metadata selon le mode
function createMetadata(
  mode: CheckoutMode,
  subscriptionData: SubscriptionData,
  customerInfo: CustomerInfo
): Record<string, string> {
  const baseMetadata = {
    subscriptionId: subscriptionData.subscriptionId,
    source: 'custom_checkout',
    isReccuring: subscriptionData.plan.isReccuring ? 'true' : 'false',
    seats: subscriptionData.seats.toString(),
    plan: subscriptionData.plan.planCode,
    interval: subscriptionData.plan.isYearly ? 'year' : 'month',
  }

  if (mode === 'guest') {
    logger.debug('[EXTERNAL-CHECKOUT] Configuration guest')
    return {
      ...baseMetadata,
      guest_checkout: 'true',
    }
  }

  // Mode authenticated
  if (!customerInfo.user) {
    throw new Error('User required for metadata creation')
  }

  logger.debug('[EXTERNAL-CHECKOUT] Configuration utilisateur connecté:', {
    customerId: customerInfo.customerId,
    userId: customerInfo.user.id,
    email: customerInfo.user.email,
  })

  return {
    ...baseMetadata,
    email: customerInfo.user.email ?? '',
    userId: customerInfo.user.id,
    customerEmail: customerInfo.user.email ?? '',
  }
}

// 5️⃣ Création de la session Stripe
async function createStripeSession(
  priceId: string,
  subscriptionData: SubscriptionData,
  customerInfo: CustomerInfo,
  metadata: Record<string, string>
): Promise<{url: string | null; id: string}> {
  logger.info('[EXTERNAL-CHECKOUT] 🔧 Création session Stripe')

  const headersList = await headers()
  const origin = headersList.get('origin') || ''

  const session = await stripeClient.checkout.sessions.create({
    customer: customerInfo.customerId,
    customer_email: customerInfo.customerEmail,
    line_items: [
      {
        price: priceId,
        quantity: subscriptionData.seats,
      },
    ],
    mode: subscriptionData.plan.isReccuring ? 'subscription' : 'payment',
    success_url: `${origin}/checkout/success?redirect_status=succeeded&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pricing`,
    metadata,
    payment_method_types: ['card'],
  })

  logger.info('✅ [EXTERNAL-CHECKOUT] Session externe créée avec succès')
  logger.debug('[EXTERNAL-CHECKOUT] Détails session:', {
    sessionId: session.id,
    mode: customerInfo.customerId ? 'authenticated' : 'guest',
    customer: customerInfo.customerId,
    customerEmail: customerInfo.customerEmail,
    url: session.url,
  })

  return session
}
