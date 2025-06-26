'use server'

import Stripe from 'stripe'

import {logger} from '@/lib/logger'
import {getPlanByPriceId, stripeClient} from '@/lib/stripe/stripe-utils'
import {getAuthUser} from '@/services/authentication/auth-service'
import {createSubscriptionFromStripeService} from '@/services/facades/subscription-service-facade'
import {createUserFromStripeService} from '@/services/facades/user-service-facade'

export async function createCheckoutSession(
  priceId: string,
  seats: number = 1,
  guest: boolean = false,
  email?: string
) {
  logger.info('[REACT-STRIPE] Création session checkout démarrée')
  logger.debug('[REACT-STRIPE] Paramètres reçus:', {
    priceId,
    seats,
    guest,
    email,
  })

  // Récupérer l'utilisateur connecté (optionnel si guest)
  const user = await getAuthUser()
  logger.debug('[REACT-STRIPE] Utilisateur récupéré:', {
    hasUser: !!user,
    userId: user?.id,
    userEmail: user?.email,
  })

  // Vérifier si le checkout est possible selon le contexte
  if (!guest && !user) {
    logger.error(
      '[REACT-STRIPE] ❌ Échec: utilisateur non connecté en mode non-guest'
    )
    return {
      success: false,
      error:
        'Utilisateur non connecté - utilisez le mode guest ou connectez-vous',
    }
  }

  if (guest && !email) {
    logger.error('[REACT-STRIPE] ❌ Échec: email requis pour le mode guest')
    return {
      success: false,
      error: 'Email requis pour le mode guest',
    }
  }

  const plan = getPlanByPriceId(priceId)
  if (!plan) {
    logger.error('[REACT-STRIPE] ❌ Plan non trouvé pour priceId:', priceId)
    throw new Error('Plan not found')
  }
  logger.debug('[REACT-STRIPE] Plan récupéré:', {
    planCode: plan.planCode,
    isReccuring: plan.isReccuring,
  })

  try {
    // Logique différente selon guest ou user connecté
    let customerId: string | undefined
    let customerEmail: string | undefined
    let baseMetadata: Record<string, string>

    if (guest || !user) {
      logger.info('[REACT-STRIPE] 📋 Mode guest détecté')
      // Mode Guest : créer un customer avec l'email fourni
      customerEmail = email // Email fourni par le formulaire guest

      const customer = await stripeClient.customers.create({
        email: email,
        metadata: {
          managed_by: 'webhook_guest_checkout',
          source: 'react_stripe_elements',
        },
      })
      customerId = customer.id
      logger.debug('[REACT-STRIPE] Customer guest créé:', {customerId})

      baseMetadata = {
        source: 'react_stripe_elements',
        guest_checkout: 'true', // Marquer comme guest checkout
        isReccuring: plan.isReccuring ? 'true' : 'false',
        seats: seats.toString(),
        plan: plan.planCode,
        interval: plan.isYearly ? 'year' : 'month',
        email: email || '', // Ajout de l'email dans les metadata
      }
    } else {
      logger.info('[REACT-STRIPE] 👤 Mode utilisateur connecté détecté')
      // Mode User connecté : utiliser ou créer le customer
      customerId = user.stripeCustomerId || undefined

      if (!customerId) {
        logger.info(
          '[REACT-STRIPE] 🔧 Création customer Stripe pour utilisateur'
        )
        const customer = await stripeClient.customers.create({
          email: user.email ?? '',
          metadata: {
            userId: user.id,
          },
        })
        customerId = customer.id
        logger.debug('[REACT-STRIPE] Customer Stripe créé:', {customerId})
      }

      baseMetadata = {
        source: 'react_stripe_elements',
        isReccuring: plan.isReccuring ? 'true' : 'false',
        seats: seats.toString(),
        email: user.email ?? '',
        plan: plan.planCode,
        interval: plan.isYearly ? 'year' : 'month',
        userId: user.id,
        customerEmail: user.email ?? '', // Ajout pour le webhook
      }
      logger.debug('[REACT-STRIPE] Configuration utilisateur connecté:', {
        customerId,
        userId: user.id,
        email: user.email,
      })
    }

    // Récupérer le prix pour connaître le montant
    const price = await stripeClient.prices.retrieve(priceId)
    if (!price || !price.unit_amount) {
      logger.error('[REACT-STRIPE] ❌ Prix non trouvé pour priceId:', priceId)
      throw new Error('Price not found')
    }
    const amount = price.unit_amount * seats * 100
    logger.debug('[REACT-STRIPE] Calculs montants:', {
      unitAmount: price.unit_amount,
      amount,
      seats,
    })

    logger.info('[REACT-STRIPE] 🔧 Création Setup Intent Stripe')
    // Créer un Setup Intent pour configurer le mode de paiement
    const setupIntent = await stripeClient.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
      usage: 'off_session',
      metadata: {
        ...baseMetadata,
        priceId: priceId,
        amount: amount.toString(),
        currency: price.currency,
      },
    })

    // Sauvegarder les informations de l'abonnement en attente dans les métadonnées
    if (!setupIntent.client_secret) {
      logger.error(
        '[REACT-STRIPE] ❌ Client secret manquant pour le setup intent'
      )
      throw new Error('Client secret manquant pour le setup intent')
    }

    logger.info('✅ [REACT-STRIPE] Setup Intent créé avec succès')
    logger.debug('[REACT-STRIPE] Détails Setup Intent:', {
      setupIntentId: setupIntent.id,
      mode: guest || !user ? 'guest' : 'user_connecté',
      customer: customerId,
      customerEmail: customerEmail || email,
      metadata: baseMetadata,
    })

    return {
      success: true,
      clientSecret: setupIntent.client_secret,
      setupIntentId: setupIntent.id,
      customerId: customerId,
      priceId: priceId,
      amount: amount,
      unit_amount: price.unit_amount,
      currency: price.currency,
      seats: seats,
    }
  } catch (error) {
    logger.error(
      '[REACT-STRIPE] ❌ Erreur lors de la création session checkout:',
      error
    )
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

export async function confirmSubscription(setupIntentId: string) {
  logger.info("[REACT-STRIPE] Confirmation de l'abonnement démarrée")
  logger.debug('[REACT-STRIPE] Setup Intent ID:', setupIntentId)

  try {
    // Récupérer le Setup Intent pour obtenir le payment method ET les métadonnées
    const setupIntent = await stripeClient.setupIntents.retrieve(setupIntentId)
    logger.debug('[REACT-STRIPE] Setup Intent récupéré:', setupIntent)
    const metadata = setupIntent.metadata
    logger.debug('[REACT-STRIPE] Métadonnées Setup Intent:', metadata)

    const seats = metadata?.seats ? parseInt(metadata.seats) : 1
    const isReccuring = metadata?.isReccuring
      ? metadata.isReccuring === 'true'
      : false
    const isGuestCheckout = metadata?.guest_checkout === 'true'

    if (setupIntent.status !== 'succeeded') {
      logger.error('[REACT-STRIPE] ❌ Setup Intent non confirmé')
      throw new Error('Setup Intent non confirmé')
    }

    // Récupérer le priceId depuis les métadonnées du SetupIntent
    const priceId = setupIntent.metadata?.priceId
    if (!priceId) {
      logger.error(
        '[REACT-STRIPE] ❌ PriceId manquant dans les métadonnées du SetupIntent'
      )
      throw new Error('PriceId manquant dans les métadonnées du SetupIntent')
    }

    const customerId = setupIntent.customer as string
    const paymentMethodId = setupIntent.payment_method as string

    let stripeSubscription: Stripe.Subscription | null = null
    let customerEmail: string = ''

    // Gestion différente selon guest ou user connecté
    if (isGuestCheckout) {
      logger.info('[REACT-STRIPE] 📋 Mode guest détecté pour confirmation')
      // Mode Guest : récupérer l'email du customer ou demander à l'utilisateur
      const customer = await stripeClient.customers.retrieve(customerId)
      if (customer.deleted) {
        logger.error('[REACT-STRIPE] ❌ Customer supprimé')
        throw new Error('Customer supprimé')
      }
      customerEmail = customer.email || ''

      if (!customerEmail) {
        logger.error(
          "[REACT-STRIPE] ❌ Email requis pour finaliser l'abonnement guest"
        )
        throw new Error("Email requis pour finaliser l'abonnement guest")
      }

      // Créer l'utilisateur guest en base de données
      await createUserFromStripeService({
        email: customerEmail,
        stripeCustomerId: customerId,
        name: customerEmail.split('@')[0],
      })
      logger.info('✅ [REACT-STRIPE] Utilisateur guest créé:', customerEmail)
    } else {
      logger.info(
        '[REACT-STRIPE] 👤 Mode utilisateur connecté détecté pour confirmation'
      )
      // Mode User connecté : vérifier l'authentification
      const user = await getAuthUser()
      if (!user) {
        logger.error(
          '[REACT-STRIPE] ❌ Utilisateur non connecté pour confirmation'
        )
        return {
          success: false,
          error: 'Utilisateur non connecté',
        }
      }
      customerEmail = user.email ?? ''
    }

    if (isReccuring) {
      logger.info('[REACT-STRIPE] 🔧 Création abonnement Stripe')
      // Créer l'abonnement Stripe avec le payment method confirmé
      stripeSubscription = await stripeClient.subscriptions.create({
        customer: customerId,
        items: [
          {
            price: priceId,
            quantity: seats,
          },
        ],
        default_payment_method: paymentMethodId,
        metadata: {
          subscriptionId: 'uuid-de-votre-bdd',
          email: customerEmail,
          source: 'react_stripe_elements',
          ...(isGuestCheckout
            ? {guest_checkout: 'true'}
            : {managed_by: 'better_auth'}),
        },
      })
      logger.debug('[REACT-STRIPE] Abonnement Stripe créé:', {
        subscriptionId: stripeSubscription.id,
        status: stripeSubscription.status,
      })
    }

    // Récupérer les informations du plan depuis le priceId
    const plan = getPlanByPriceId(priceId)
    if (!plan) {
      logger.error(
        '[REACT-STRIPE] ❌ Plan non trouvé pour ce priceId:',
        priceId
      )
      throw new Error('Plan non trouvé pour ce priceId')
    }

    // Créer l'abonnement en base via le service
    await createSubscriptionFromStripeService(
      customerEmail,
      plan.planCode,
      plan.isYearly,
      stripeSubscription?.id ?? '',
      customerId,
      seats
    )

    logger.info('✅ [REACT-STRIPE] Abonnement confirmé avec succès')
    logger.debug('[REACT-STRIPE] Détails abonnement:', {
      mode: isGuestCheckout ? 'guest' : 'user_connecté',
      customerEmail,
      subscriptionId: stripeSubscription?.id,
    })

    return {
      success: true,
      subscriptionId: stripeSubscription?.id ?? '',
      status: stripeSubscription?.status ?? '',
    }
  } catch (error) {
    logger.error(
      "[REACT-STRIPE] ❌ Erreur lors de la confirmation de l'abonnement:",
      error
    )
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}
