import Stripe from 'stripe'

import {
  getUserByEmailDao,
  updateUserSafeByUidDao,
} from '@/db/repositories/user-repository'
import {logger} from '@/lib/logger'
import {
  createSubscriptionFromStripeService,
  getBillingContext,
  getSubscriptionByUserIdService,
  updateSubscriptionForWebhookService,
} from '@/services/facades/subscription-service-facade'
import {createUserFromStripeService} from '@/services/facades/user-service-facade'
import {SubscriptionPlan} from '@/services/types/domain/subscription-types'

import {stripeClient} from './stripe-client'

export async function onStripeEvent(event: Stripe.Event) {
  logger.info('[STRIPE-EVENT] Réception événement Stripe:', event.type)
  logger.debug('[STRIPE-EVENT] Détails événement:', {
    eventId: event.id,
    eventData: event.data,
  })

  try {
    switch (event.type) {
      case 'customer.subscription.created': {
        logger.info('🔧 Traitement customer.subscription.created')
        const subscription = event.data.object as Stripe.Subscription
        logger.info(
          '🔧 Traitement customer.subscription.created subscription.id',
          subscription.id
        )
        break
      }
      case 'checkout.session.completed': {
        logger.info('🔧 Traitement checkout session completed')
        const session = event.data.object as Stripe.Checkout.Session
        const isCustomCheckout = session.metadata?.source === 'custom_checkout'

        // Ici on traite le cas non couverts par better-auth

        // CAS : Checkout AS guest + Creation de compte
        if (isCustomCheckout) {
          try {
            // - le checkout as guest
            // - creation du compte
            await handleGuestCheckoutSessionCompleted(session)
          } catch (error) {
            logger.error(
              '❌ Erreur dans handleGuestCheckoutSessionCompleted:',
              error
            )
          }
        }

        // CAS : Paiement en plusieurs fois
        const isInstallmentCheckout =
          session.metadata?.source === 'installment_checkout'
        if (isInstallmentCheckout) {
          logger.info('🔧 Traitement installment checkout')
          await handleInstallmentCheckoutSessionCompleted(session)
        }

        // En cas de besoin de traiter le workflow complet
        // si oui supprimer metadata.referenceId de la session.checkout pour eviter un double traitement par better auth
        //await handleFullCheckoutSessionCompleted(event)

        break
      }

      case 'customer.subscription.updated': {
        //https://github.com/better-auth/better-auth/issues/2087
        //https://github.com/better-auth/better-auth/blob/main/packages/stripe/src/hooks.ts#L42-L43
        logger.info('🔄 [TEST] Traitement customer.subscription.updated')

        // TODO: Ici Better Auth gère automatiquement la mise à jour
        logger.info(
          '✅ [TEST] customer.subscription.updated traité par Better Auth'
        )
        break
      }

      case 'customer.subscription.deleted': {
        logger.info('🗑️ [TEST] Traitement customer.subscription.deleted')

        break
      }

      case 'invoice.paid':
        logger.info('💰 Invoice paid:', event.data.object.id)
        break

      case 'payment_intent.succeeded': {
        //1 pour les paiements unique seulement // PlanConst.LIFETIME
        logger.info(
          '✅ Payment succeeded (payment_intent.succeeded):',
          event.data.object.id
        )

        break
      }

      default:
        logger.info('📝 Autre événement Stripe:', event.type)
    }
  } catch (error) {
    logger.error('❌ Erreur dans onEvent Stripe:', error)
  }
}

/**
 * 🎯 FONCTION PRINCIPALE : Orchestration du checkout session completed
 */
async function handleGuestCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  const metadata = session.metadata || {}

  // 1️⃣ Détection du mode
  const isGuestCheckout = detectGuestCheckoutMode(metadata)

  if (!isGuestCheckout) {
    logger.info(
      '✅ Mode utilisateur connecté détecté - Better Auth va gérer automatiquement'
    )
    return // 🚀 Better Auth gère automatiquement
  }

  // 2️⃣ Validation des données
  const customerData = validateGuestCheckoutData(session, metadata)

  // 3️⃣ Création user guest
  const finalUser = await createGuestUser(customerData)

  // 4️⃣ Mise à jour subscription
  await updateSubscriptionWithUser(metadata.subscriptionId, finalUser) //metadata.subscriptionId the uuid in bd

  logger.info('🎉 Workflow guest checkout terminé avec succès!')
}

/**
 * 1️⃣ DÉTECTION : Mode guest checkout
 */
function detectGuestCheckoutMode(metadata: Record<string, string>): boolean {
  logger.info('🔍 Analyse du type de checkout...')

  const referenceId = metadata.referenceId
  const guestCheckoutFlag = metadata.guest_checkout === 'true'

  const isGuestByReferenceId = referenceId === 'guest'
  const isGuestByFlag = guestCheckoutFlag
  const isGuestCheckout = isGuestByReferenceId || isGuestByFlag

  if (isGuestCheckout) {
    logger.info('📋 Mode guest détecté - traitement custom nécessaire')
  }

  return isGuestCheckout
}

/**
 * 2️⃣ VALIDATION : Données guest checkout
 */
function validateGuestCheckoutData(
  session: Stripe.Checkout.Session,
  metadata: Record<string, string>
): {
  customerEmail: string
  customerName?: string
  stripeCustomerId?: string
  subscriptionId: string
} {
  logger.info('🔍 Validation des informations pour création user guest...')

  // Récupération des informations
  const customerEmail =
    metadata.customerEmail ?? session.customer_details?.email
  const customerName = session.customer_details?.name || undefined
  const stripeCustomerId = session.customer as string
  const subscriptionId = metadata.subscriptionId

  // Validations critiques
  if (!customerEmail) {
    logger.error('❌ Impossible de créer user guest : email manquant')
    throw new Error('Email manquant pour guest checkout')
  }

  if (!subscriptionId) {
    logger.error(
      '❌ Impossible de mettre à jour subscription : subscriptionId manquant'
    )
    throw new Error('SubscriptionId manquant pour guest checkout')
  }

  // Warning pour customer manquant (non bloquant)
  if (!stripeCustomerId) {
    logger.warn('⚠️ Customer Stripe manquant - sera créé automatiquement')
  }

  logger.info(
    '✅ Validation réussie - informations suffisantes pour créer user guest'
  )

  return {
    customerEmail,
    customerName,
    stripeCustomerId,
    subscriptionId,
  }
}

/**
 * 3️⃣ CRÉATION : User guest (Stripe + BDD)
 */
async function createGuestUser(customerData: {
  customerEmail: string
  customerName?: string
  stripeCustomerId?: string
}): Promise<{
  id: string
  email: string
  stripeCustomerId: string
}> {
  logger.info('🔧 Création du user guest...')

  // 3.1 Gérer customer Stripe
  const finalStripeCustomerId = await ensureStripeCustomer(customerData)

  // 3.2 Gérer user BDD
  const finalUser = await ensureDatabaseUser(
    customerData.customerEmail,
    customerData.customerName,
    finalStripeCustomerId
  )

  return finalUser
}

/**
 * 3.1 STRIPE CUSTOMER : Créer ou utiliser existant
 */
async function ensureStripeCustomer(customerData: {
  customerEmail: string
  customerName?: string
  stripeCustomerId?: string
}): Promise<string> {
  if (customerData.stripeCustomerId) {
    logger.info(
      '✅ Customer Stripe existant utilisé:',
      customerData.stripeCustomerId
    )
    return customerData.stripeCustomerId
  }

  logger.info('🔧 Création customer Stripe pour guest...')
  const stripeCustomer = await stripeClient.customers.create({
    email: customerData.customerEmail,
    name: customerData.customerName || undefined,
    metadata: {
      managed_by: 'webhook_guest_checkout',
      source: 'guest_checkout_webhook',
    },
  })

  logger.info('✅ Customer Stripe créé:', stripeCustomer.id)
  return stripeCustomer.id
}

/**
 * 3.2 DATABASE USER : Créer ou mettre à jour existant
 */
async function ensureDatabaseUser(
  email: string,
  name: string | undefined,
  stripeCustomerId: string
): Promise<{
  id: string
  email: string
  stripeCustomerId: string
}> {
  logger.info('🔍 Vérification utilisateur existant...')

  const existingUser = await getUserByEmailDao(email)

  if (existingUser) {
    // Mettre à jour stripeCustomerId si nécessaire
    if (existingUser.stripeCustomerId !== stripeCustomerId) {
      logger.warn(
        '⚠️ Mismatch stripeCustomerId détecté - mise à jour nécessaire'
      )
      await updateUserSafeByUidDao(
        {
          email: existingUser.email,
          name: existingUser.name,
          stripeCustomerId,
        },
        existingUser.id
      )
    }

    return {
      id: existingUser.id,
      email: existingUser.email,
      stripeCustomerId,
    }
  }

  // Créer nouvel utilisateur
  logger.info('🔧 Création nouvel utilisateur guest en BDD...')
  const userCreationResult = await createUserFromStripeService({
    email,
    stripeCustomerId,
    name: name || email?.split('@')[0] || 'Guest User',
  })

  if (!userCreationResult?.user) {
    throw new Error('Échec de la création utilisateur en BDD')
  }

  // Gestion des types de retour complexes
  const newUser =
    'user' in userCreationResult.user
      ? userCreationResult.user.user
      : userCreationResult.user

  return {
    id: newUser.id,
    email: newUser.email,
    stripeCustomerId,
  }
}

/**
 * 4️⃣ MISE À JOUR : Subscription avec user créé
 */
async function updateSubscriptionWithUser(
  subscriptionId: string,
  user: {
    id: string
    email: string
    stripeCustomerId: string
  }
): Promise<void> {
  logger.info('🔄 Mise à jour du referenceId dans la subscription...')

  try {
    // 🎯 Utiliser la config BILLING_MODE pour déterminer le bon referenceId
    const {referenceId} = await getBillingContext(user.id)

    const updatedSubscription = await updateSubscriptionForWebhookService({
      subscriptionId,
      referenceId,
      stripeCustomerId: user.stripeCustomerId,
    })

    logger.info('✅ Subscription mise à jour avec succès:', {
      subscriptionId: updatedSubscription.id,
      newReferenceId: updatedSubscription.referenceId,
      stripeCustomerId: updatedSubscription.stripeCustomerId,
    })
  } catch (error) {
    logger.error('❌ Erreur lors de la mise à jour de la subscription:', error)
    // Ne pas throw car l'utilisateur est créé, juste log l'erreur
  }
}

/**
 * 🎯 FONCTION PRINCIPALE : Orchestration du checkout session completed
 * gestion complete sans passer par better-auth
 * (supprimer les metadata.referenceId pour ne pas passer par betterauth)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function handleFullCheckoutSessionCompleted(event: Stripe.Event) {
  logger.info('🔧 Traitement checkout session completed')
  const session = event.data.object as Stripe.Checkout.Session
  const metadata = session.metadata || {}
  const seats = metadata.seats ? parseInt(metadata.seats) : 1

  // Récupérer les infos nécessaires
  const customerEmail =
    metadata.customerEmail ?? session.customer_details?.email
  const stripeCustomerId = session.customer ?? undefined
  const plan = metadata.plan as SubscriptionPlan
  const isRecurring = metadata.isRecurring === 'true'
  const isYearly = metadata.interval === 'year'
  // const priceId = metadata.priceId as string
  // const payment_intent = session.payment_intent as string
  const subscriptionId = session.subscription as string
  const subscriptionUUID = metadata.subscriptionId

  logger.info('🔧 session', session)
  logger.debug('🔧 metadata:', metadata)
  logger.debug('🔧 customerEmail', customerEmail)
  logger.debug('🔧 stripeCustomerId', stripeCustomerId)
  logger.debug('🔧 plan', plan)
  logger.debug('🔧 isYearly', isYearly)
  logger.debug('🔧 subscription', subscriptionId)
  logger.debug('🔧 isRecurring', isRecurring)
  logger.debug('🔧 subscriptionUUID', subscriptionUUID)

  // Détecter le type de traitement nécessaire
  const isGuestCheckout = !customerEmail || metadata.guest_checkout === 'true'
  const isInstallmentCheckout = metadata.source === 'installment_checkout'
  const isCustomCheckout = metadata.source === 'custom_checkout'

  logger.debug('🔧 Type de checkout détecté:', {
    isGuestCheckout,
    isInstallmentCheckout,
    isCustomCheckout,
    source: metadata.source,
  })

  // ÉTAPE 1: Gestion de l'utilisateur (guest ou existant)
  let finalCustomerId = stripeCustomerId as string
  let finalCustomerEmail = customerEmail

  if (isGuestCheckout) {
    logger.debug('📋 Traitement utilisateur guest')
    const email = session.customer_details?.email ?? ''
    const name = session.customer_details?.name ?? ''

    finalCustomerEmail = email

    // Créer customer Stripe si nécessaire
    if (!finalCustomerId) {
      const customer = await stripeClient.customers.create({
        email: email,
        metadata: {
          managed_by: 'webhook_guest_checkout',
        },
      })
      finalCustomerId = customer.id
    }

    // Gestion de l'utilisateur en base
    const user = await getUserByEmailDao(email)
    if (user) {
      logger.debug('🔧 Utilisateur existant trouvé')
      if (finalCustomerId && user.stripeCustomerId !== finalCustomerId) {
        logger.warn('⚠️ Mismatch stripeCustomerId détecté')
        const subscription = await getSubscriptionByUserIdService(user.id)
        if (!subscription) {
          await updateUserSafeByUidDao(
            {
              email: user.email,
              name: user.name,
              stripeCustomerId: finalCustomerId,
            },
            user.id
          )
        }
      }
    } else {
      await createUserFromStripeService({
        email,
        stripeCustomerId: finalCustomerId,
        name: name ?? email?.split('@')[0] ?? '',
      })
      logger.info('✅ Nouvel utilisateur créé pour guest checkout', email)
    }
  }

  // ÉTAPE 2: Gestion de la subscription UNIQUEMENT pour vos cas spécifiques
  if (
    isInstallmentCheckout &&
    finalCustomerEmail &&
    plan &&
    metadata.schedule_id
  ) {
    logger.debug('🗓️ Traitement subscription échéancier')

    try {
      const numberOfPayments = parseInt(metadata.number_of_payments || '1')
      const currentDate = new Date()
      const endDate = new Date(currentDate)
      endDate.setMonth(endDate.getMonth() + numberOfPayments)

      if (subscriptionUUID) {
        await updateSubscriptionForWebhookService({
          subscriptionId: subscriptionUUID,
          referenceId: finalCustomerId,
          stripeCustomerId: finalCustomerId,
        })
      } else {
        await createSubscriptionFromStripeService(
          finalCustomerEmail,
          plan,
          isYearly,
          subscriptionId,
          finalCustomerId,
          seats,
          endDate
        )
      }

      logger.info(
        '✅ Subscription échéancier créée avec succès',
        finalCustomerEmail
      )
    } catch (error) {
      logger.error('❌ Erreur création subscription échéancier:', error)
    }
  } else if (isCustomCheckout && finalCustomerEmail && plan) {
    logger.debug('🔧 Traitement subscription custom')

    try {
      if (subscriptionUUID) {
        // 🎯 Déterminer le bon referenceId selon BILLING_MODE
        const authenticatedUser = await getUserByEmailDao(finalCustomerEmail)
        if (authenticatedUser) {
          const {referenceId} = await getBillingContext(authenticatedUser.id)

          await updateSubscriptionForWebhookService({
            subscriptionId: subscriptionUUID,
            referenceId,
            stripeCustomerId: finalCustomerId,
          })
        }
      } else {
        await createSubscriptionFromStripeService(
          finalCustomerEmail,
          plan,
          isYearly,
          subscriptionId,
          finalCustomerId,
          seats
        )
        logger.info('✅ Custom subscription créée avec succès')
      }
    } catch (error) {
      logger.error('❌ Erreur création custom subscription:', error)
    }
  } else if (
    isGuestCheckout &&
    !isInstallmentCheckout &&
    !isCustomCheckout &&
    finalCustomerEmail &&
    plan
  ) {
    logger.info('📋 Traitement subscription guest simple')

    await createSubscriptionFromStripeService(
      finalCustomerEmail,
      plan,
      isYearly,
      subscriptionId,
      finalCustomerId
    )
    logger.info('✅ Subscription guest simple créée avec succès')
  } else {
    logger.debug(
      "📋 Checkout Better Auth natif - traité automatiquement par l'API Better Auth"
    )
  }
}

// ===================================
// 🎯 INSTALLMENT CHECKOUT : FONCTIONS SPÉCIALISÉES
// ===================================

/**
 * 🎯 FONCTION PRINCIPALE : Gestion des installment checkouts
 */
async function handleInstallmentCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  logger.info('🗓️ Traitement installment checkout session completed')
  const metadata = session.metadata || {}
  console.log('🔧handleInstallmentCheckoutSessionCompleted  metadata', metadata)
  // 1️⃣ Validation des données installment
  const installmentData = validateInstallmentCheckoutData(session, metadata)

  // 2️⃣ Détection du mode (guest ou authenticated)
  const isGuestCheckout = detectGuestCheckoutMode(metadata)

  // 3️⃣ Gestion utilisateur selon le mode
  let finalUser
  if (isGuestCheckout) {
    finalUser = await createGuestUser({
      customerEmail: installmentData.customerEmail,
      customerName: installmentData.customerName,
      stripeCustomerId: installmentData.stripeCustomerId,
    })
  } else {
    // Mode authenticated - récupérer user existant
    finalUser = await getAuthenticatedUser(installmentData.customerEmail)
  }

  // 4️⃣ Création subscription avec périodes installment
  await createInstallmentSubscription(installmentData, finalUser)

  logger.info('🎉 Workflow installment checkout terminé avec succès!')
}

/**
 * 1️⃣ VALIDATION : Données installment checkout
 */
function validateInstallmentCheckoutData(
  session: Stripe.Checkout.Session,
  metadata: Record<string, string>
): {
  customerEmail: string
  customerName?: string
  stripeCustomerId?: string
  plan: string
  seats: number
  numberOfPayments: number
  scheduleId?: string
  stripeSubscriptionId?: string
} {
  logger.info('🔍 Validation des données installment checkout...')

  // Récupération des informations
  const customerEmail =
    metadata.customerEmail ?? session.customer_details?.email
  const customerName = session.customer_details?.name || undefined
  const stripeCustomerId = session.customer as string
  const plan = metadata.plan
  const seats = parseInt(metadata.seats || '1')
  const numberOfPayments = parseInt(metadata.number_of_payments || '1')
  const scheduleId = metadata.schedule_id
  const stripeSubscriptionId = session.subscription as string
  const isInstallmentCheckout = metadata.source === 'installment_checkout'

  // Validations critiques
  if (!customerEmail) {
    logger.error('❌ Email manquant pour installment checkout')
    throw new Error('Email manquant pour installment checkout')
  }

  if (!plan) {
    logger.error('❌ Plan manquant pour installment checkout')
    throw new Error('Plan manquant pour installment checkout')
  }

  if (!scheduleId) {
    logger.error('❌ Schedule ID manquant pour installment checkout')
    throw new Error('Schedule ID manquant pour installment checkout')
  }

  if (numberOfPayments < 2) {
    logger.error('❌ Nombre de paiements invalide pour installment')
    throw new Error('Nombre de paiements doit être >= 2')
  }

  if (!isInstallmentCheckout) {
    logger.error('❌ Installment checkout non supporté')
    throw new Error('Installment checkout non supporté')
  }

  logger.info('✅ Validation installment réussie')

  return {
    customerEmail,
    customerName,
    stripeCustomerId,
    plan,
    seats,
    numberOfPayments,
    scheduleId,
    stripeSubscriptionId,
  }
}

/**
 * 2️⃣ UTILISATEUR AUTHENTIFIÉ : Récupérer user existant
 */
async function getAuthenticatedUser(email: string): Promise<{
  id: string
  email: string
  stripeCustomerId: string
}> {
  logger.info('🔍 Récupération utilisateur authentifié...')

  const existingUser = await getUserByEmailDao(email)
  if (!existingUser) {
    throw new Error(`Utilisateur authentifié non trouvé: ${email}`)
  }

  return {
    id: existingUser.id,
    email: existingUser.email,
    stripeCustomerId: existingUser.stripeCustomerId || '',
  }
}

/**
 * 3️⃣ CRÉATION SUBSCRIPTION : Avec périodes installment
 */
async function createInstallmentSubscription(
  installmentData: {
    customerEmail: string
    plan: string
    seats: number
    numberOfPayments: number
    stripeSubscriptionId?: string
  },
  user: {
    id: string
    email: string
    stripeCustomerId: string
  }
): Promise<void> {
  logger.info('🗓️ Création subscription installment...')

  try {
    // Calculer la date de fin basée sur le nombre de paiements
    const currentDate = new Date()
    const endDate = new Date(currentDate)
    endDate.setMonth(endDate.getMonth() + installmentData.numberOfPayments)

    // Utiliser le service de création subscription existant

    await createSubscriptionFromStripeService(
      installmentData.customerEmail,
      installmentData.plan as SubscriptionPlan, // Cast vers SubscriptionPlan
      false, // yearly = false pour installments
      installmentData.stripeSubscriptionId || '',
      user.stripeCustomerId,
      installmentData.seats,
      endDate
    )

    logger.info('✅ Subscription installment créée avec succès:', {
      userEmail: installmentData.customerEmail,
      plan: installmentData.plan,
      seats: installmentData.seats,
      numberOfPayments: installmentData.numberOfPayments,
      endDate: endDate.toISOString(),
    })
  } catch (error) {
    logger.error(
      '❌ Erreur lors de la création subscription installment:',
      error
    )
    throw error
  }
}
