'use server'

import {headers} from 'next/headers'

import {logger} from '@/lib/logger'
import {stripeClient} from '@/lib/stripe/stripe-client'
import {getPlanByPriceId, isYearlyPrice} from '@/lib/stripe/stripe-utils'
import {getAuthUser} from '@/services/authentication/auth-service'
import {initSubscriptionService} from '@/services/facades/subscription-service-facade'
import {getBillingContext} from '@/services/subscription-service'

// Types communs importés
import type {
  CheckoutMode,
  CustomerInfo,
  SubscriptionData,
} from '../checkout-stripe-util'
import {
  createCheckoutMetadata,
  validateCheckoutMode,
  validateInstallmentsPlan,
} from '../checkout-stripe-util'
// Import des types locaux du dossier installments
import {InstallmentPlan, InstallmentPlans, InstallmentType} from './types'
import {createInstallmentSubscriptionSchedule} from './utils'

// Types pour les objets Stripe retournés (utilisation d'any car types Stripe complexes)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ScheduleResult = any

export type InstallmentCheckoutResult = {
  success: boolean
  sessionUrl?: string
  sessionId?: string
  clientSecret?: string
  installmentPlan?: InstallmentPlan
  scheduleId?: string
  error?: string
}

// 🎯 Fonction principale refactorisée
export async function createInstallmentCheckoutSession(
  priceId: string,
  installmentType: InstallmentType,
  seats: number = 1,
  guest: boolean = false
): Promise<InstallmentCheckoutResult> {
  logger.info(
    '[INSTALLMENT-CHECKOUT] Création session checkout par échéances démarrée'
  )
  logger.debug('[INSTALLMENT-CHECKOUT] Paramètres reçus:', {
    priceId,
    installmentType,
    seats,
    guest,
  })

  try {
    // Récupérer l'utilisateur connecté (optionnel si guest)
    const user = await getAuthUser()
    logger.debug('[INSTALLMENT-CHECKOUT] Utilisateur récupéré:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
    })

    // Valider le plan
    const plan = getPlanByPriceId(priceId)
    if (!plan) {
      logger.error(
        '[INSTALLMENT-CHECKOUT] ❌ Plan non trouvé pour priceId:',
        priceId
      )
      return {
        success: false,
        error: 'Plan non trouvé',
      }
    }
    logger.debug('[INSTALLMENT-CHECKOUT] Plan récupéré:', {
      planCode: plan.planCode,
      isReccuring: plan.isReccuring,
    })

    // 1️⃣ Validation du mode
    const mode = validateCheckoutMode(guest, user, 'INSTALLMENT-CHECKOUT')

    // 2️⃣ Validation plan compatibilité échéancier
    validateInstallmentsPlan(plan)

    // 3️⃣ Validation type échéancier
    const installmentPlan = validateInstallmentType(installmentType)

    // 4️⃣ Gestion customer
    const customerInfo = await initInstallmentCustomer(mode, user)

    // 5️⃣ Initialisation subscription
    const subscriptionId = await initSubscription(
      customerInfo,
      plan.planCode,
      seats
    )
    const isYearly = isYearlyPrice(plan.priceId)
    // 6️⃣ Préparation des données
    const subscriptionData: SubscriptionData = {
      subscriptionId,
      plan,
      seats,
      isYearly,
    }

    // 7️⃣ Calculs montants
    const priceDetails = await getStripePrice(priceId, seats)

    // 8️⃣ Création metadata
    const metadata = createInstallmentMetadata(
      subscriptionData,
      customerInfo,
      installmentType
    )

    // 9️⃣ Création Subscription Schedule
    if (!customerInfo.customerId) {
      throw new Error(
        'Customer ID is required for installment schedule creation'
      )
    }
    const scheduleResult = await createInstallmentSchedule(
      customerInfo.customerId,
      priceId,
      priceDetails,
      installmentPlan,
      metadata
    )

    // 🔟 Création session checkout
    const session = await createInstallmentSession(
      customerInfo.customerId,
      scheduleResult,
      installmentPlan,
      metadata
    )

    return {
      success: true,
      sessionUrl: session.url || undefined,
      sessionId: session.id,
      clientSecret: session.client_secret || undefined,
      installmentPlan: installmentPlan,
      scheduleId: scheduleResult.schedule.id,
    }
  } catch (error) {
    logger.error(
      '[INSTALLMENT-CHECKOUT] ❌ Erreur lors de la création session par échéances:',
      error
    )
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }
  }
}

// 1️⃣ Validation du type d'échéancier
function validateInstallmentType(
  installmentType: InstallmentType
): InstallmentPlan {
  const installmentPlan = InstallmentPlans[installmentType]
  if (!installmentPlan) {
    logger.error(
      "[INSTALLMENT-CHECKOUT] ❌ Type d'échéancier invalide:",
      installmentType
    )
    throw new Error("Type d'échéancier non valide")
  }
  logger.debug('[INSTALLMENT-CHECKOUT] Plan échéancier récupéré:', {
    type: installmentType,
    numberOfPayments: installmentPlan.numberOfPayments,
  })
  return installmentPlan
}

// 2️⃣ Gestion du customer selon le mode
async function initInstallmentCustomer(
  mode: CheckoutMode,
  user: CustomerInfo['user']
): Promise<CustomerInfo> {
  if (mode === 'guest') {
    logger.info(
      '[INSTALLMENT-CHECKOUT] 📋 Mode guest détecté - création customer temporaire'
    )

    // Mode Guest : créer un customer temporaire, Stripe collectera l'email
    const customer = await stripeClient.customers.create({
      metadata: {
        managed_by: 'webhook_guest_checkout',
        source: 'installment_checkout',
      },
    })

    logger.debug('[INSTALLMENT-CHECKOUT] Customer guest créé:', {
      customerId: customer.id,
    })

    return {
      customerId: customer.id,
      customerEmail: undefined,
      user: undefined,
    }
  }

  // Mode authenticated
  if (!user) {
    throw new Error('User required for authenticated checkout')
  }

  logger.info('[INSTALLMENT-CHECKOUT] 👤 Mode utilisateur connecté détecté')

  let customerId = user.stripeCustomerId

  // Créer un customer Stripe si nécessaire
  if (!customerId) {
    logger.info(
      '[INSTALLMENT-CHECKOUT] 🔧 Création customer Stripe pour utilisateur'
    )
    const customer = await stripeClient.customers.create({
      email: user.email ?? '',
      metadata: {
        userId: user.id,
        source: 'installment_checkout',
      },
    })
    customerId = customer.id
    logger.debug('[INSTALLMENT-CHECKOUT] Customer Stripe créé:', {customerId})
  }

  return {
    customerId,
    customerEmail: user.email,
    user,
  }
}

// 3️⃣ Initialisation de la subscription
async function initSubscription(
  customerInfo: CustomerInfo,
  planCode: SubscriptionData['plan']['planCode'],
  seats: number
): Promise<string> {
  logger.info('[INSTALLMENT-CHECKOUT] 💾 Initialisation subscription en BDD')

  let referenceId: string | undefined

  // Déterminer referenceId seulement si pas en mode guest
  if (customerInfo.user) {
    const context = await getBillingContext()
    referenceId = context.referenceId
  } else {
    // Mode guest : referenceId sera undefined
    referenceId = undefined
  }

  const subscriptionId = await initSubscriptionService({
    plan: planCode,
    seats,
    referenceId, // 🎯 Utilise le bon referenceId selon la config BILLING_MODE
    stripeCustomerId: customerInfo.customerId,
  })

  logger.debug('[INSTALLMENT-CHECKOUT] Subscription initialisée:', {
    subscriptionId,
  })

  if (!subscriptionId) {
    logger.error(
      "[INSTALLMENT-CHECKOUT] ❌ Erreur lors de l'initialisation de la subscription"
    )
    throw new Error("Erreur lors de l'initialisation de la subscription")
  }

  return subscriptionId
}

// 4️⃣ Récupération des détails du prix
async function getStripePrice(
  priceId: string,
  seats: number
): Promise<{totalAmount: number; currency: string}> {
  const price = await stripeClient.prices.retrieve(priceId)

  if (!price || !price.unit_amount) {
    logger.error(
      '[INSTALLMENT-CHECKOUT] ❌ Prix non trouvé ou invalide pour priceId:',
      priceId
    )
    throw new Error('Prix non trouvé')
  }

  const totalAmount = price.unit_amount * seats // en centimes

  logger.debug('[INSTALLMENT-CHECKOUT] Calculs montants:', {
    unitAmount: price.unit_amount,
    totalAmount,
    seats,
  })

  return {
    totalAmount,
    currency: price.currency,
  }
}

// 5️⃣ Création des metadata spécifiques Installments
function createInstallmentMetadata(
  subscriptionData: SubscriptionData,
  customerInfo: CustomerInfo,
  installmentType: InstallmentType
): Record<string, string> {
  const mode = customerInfo.user ? 'authenticated' : 'guest'

  // Utilise la fonction commune avec checkoutType 'installments'
  const baseMetadata = createCheckoutMetadata(
    mode,
    subscriptionData,
    customerInfo,
    'installments'
  )

  // Ajouter metadata spécifiques aux échéanciers
  return {
    ...baseMetadata,
    installment_type: installmentType,
    payment_type: 'installment',
  }
}

// 6️⃣ Création du Subscription Schedule
async function createInstallmentSchedule(
  customerId: string,
  priceId: string,
  priceDetails: {totalAmount: number; currency: string},
  installmentPlan: InstallmentPlan,
  metadata: Record<string, string>
): Promise<ScheduleResult> {
  logger.info('[INSTALLMENT-CHECKOUT] 🗓️ Création du Subscription Schedule')

  const scheduleResult = await createInstallmentSubscriptionSchedule(
    customerId,
    priceId,
    priceDetails.totalAmount,
    installmentPlan.numberOfPayments,
    1, // seats toujours 1 pour schedule
    metadata
  )

  logger.debug('[INSTALLMENT-CHECKOUT] Schedule créé:', {
    scheduleId: scheduleResult.schedule.id,
    installmentPriceId: scheduleResult.installmentPrice.id,
  })

  return scheduleResult
}

// 7️⃣ Création de la session checkout Stripe
async function createInstallmentSession(
  customerId: string,
  scheduleResult: ScheduleResult,
  installmentPlan: InstallmentPlan,
  metadata: Record<string, string>
): Promise<{url: string | null; id: string; client_secret: string | null}> {
  logger.info('[INSTALLMENT-CHECKOUT] 🔧 Création session checkout Stripe')

  const headersList = await headers()
  const origin = headersList.get('origin') || ''

  const session = await stripeClient.checkout.sessions.create({
    customer: customerId,
    line_items: [
      {
        price: scheduleResult.installmentPrice.id,
        quantity: 1, // Toujours 1 pour les échéanciers
      },
    ],
    mode: 'subscription',
    success_url: `${origin}/checkout/success?redirect_status=succeeded&session_id={CHECKOUT_SESSION_ID}&installment_schedule=${scheduleResult.schedule.id}`,
    cancel_url: `${origin}/pricing`,
    metadata: {
      ...metadata,
      number_of_payments: installmentPlan.numberOfPayments.toString(),
      schedule_id: scheduleResult.schedule.id,
    },
    payment_method_types: ['card'],
  })

  logger.info(
    '✅ [INSTALLMENT-CHECKOUT] Session par échéances créée avec succès'
  )
  logger.debug('[INSTALLMENT-CHECKOUT] Détails session:', {
    sessionId: session.id,
    customerId,
    scheduleId: scheduleResult.schedule.id,
  })

  return session
}
