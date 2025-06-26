'use server'

import {headers} from 'next/headers'

import {logger} from '@/lib/logger'
import {getPlanByPriceId, stripeClient} from '@/lib/stripe/stripe-utils'
import {getAuthUser} from '@/services/authentication/auth-service'
import {initSubscriptionService} from '@/services/facades/subscription-service-facade'

export async function createEmbededCheckoutSession(
  priceId: string,
  seats: number = 1,
  guest: boolean = false
) {
  logger.info('[EMBED-CHECKOUT] Création session checkout embedded démarrée')
  logger.debug('[EMBED-CHECKOUT] Paramètres reçus:', {priceId, seats, guest})

  try {
    // Récupérer l'utilisateur connecté (optionnel si guest)
    const user = await getAuthUser()
    logger.debug('[EMBED-CHECKOUT] Utilisateur récupéré:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
    })

    // Vérifier si le checkout est possible selon le contexte
    if (!guest && !user) {
      logger.error(
        '[EMBED-CHECKOUT] ❌ Échec: utilisateur non connecté en mode non-guest'
      )
      return {
        success: false,
        error:
          'Utilisateur non connecté - utilisez le mode guest ou connectez-vous',
      }
    }

    const plan = getPlanByPriceId(priceId)
    if (!plan) {
      logger.error('[EMBED-CHECKOUT] ❌ Plan non trouvé pour priceId:', priceId)
      throw new Error('Plan not found')
    }
    logger.debug('[EMBED-CHECKOUT] Plan récupéré:', {
      planCode: plan.planCode,
      isReccuring: plan.isReccuring,
    })

    const isReccuring = plan.isReccuring
    const headersList = await headers()
    const origin = headersList.get('origin') || ''

    // 🎯 Initialiser la subscription en BDD AVANT la session checkout
    logger.info('[EMBED-CHECKOUT] 💾 Initialisation subscription en BDD')
    const subscriptionId = await initSubscriptionService({
      plan: plan.planCode,
      seats,
      referenceId: user?.id, // undefined en mode guest
      stripeCustomerId: user?.stripeCustomerId || undefined,
    })
    logger.debug('[EMBED-CHECKOUT] Subscription initialisée:', {subscriptionId})
    if (!subscriptionId) {
      logger.error(
        "[EMBED-CHECKOUT] ❌ Erreur lors de l'initialisation de la subscription"
      )
      throw new Error("Erreur lors de l'initialisation de la subscription")
    }
    // Logique différente selon guest ou user connecté
    let customer: string | undefined
    let customerEmail: string | undefined
    let baseMetadata: Record<string, string>

    if (guest || !user) {
      logger.info('[EMBED-CHECKOUT] 📋 Mode guest détecté')
      // Mode Guest : pas de customer, utilise customer_email
      customer = undefined
      customerEmail = undefined // L'utilisateur saisira son email dans le checkout
      baseMetadata = {
        source: 'custom_checkout',
        guest_checkout: 'true', // Marquer comme guest checkout
        isReccuring: isReccuring ? 'true' : 'false',
        seats: seats.toString(),
        plan: plan.planCode,
        interval: plan.isYearly ? 'year' : 'month',
        subscriptionId, // 🎯 Utilise le vrai UUID généré
      }
      logger.debug('[EMBED-CHECKOUT] Configuration guest:', baseMetadata)
    } else {
      logger.info('[EMBED-CHECKOUT] 👤 Mode utilisateur connecté détecté')
      // Mode User connecté : utilise le customer Better Auth
      customer = user.stripeCustomerId || undefined
      customerEmail = customer ? undefined : user.email // Si pas de customer Stripe, utilise l'email
      baseMetadata = {
        source: 'custom_checkout',
        isReccuring: isReccuring ? 'true' : 'false',
        seats: seats.toString(),
        email: user.email,
        plan: plan.planCode,
        interval: plan.isYearly ? 'year' : 'month',
        userId: user.id,
        customerEmail: user.email, // Ajout pour le webhook
        subscriptionId, // 🎯 Utilise le vrai UUID généré
      }
      logger.debug('[EMBED-CHECKOUT] Configuration utilisateur connecté:', {
        hasStripeCustomerId: !!customer,
        customerEmail,
        userId: user.id,
      })
    }

    logger.info('[EMBED-CHECKOUT] 🔧 Création session Stripe')
    // Créer la session avec la configuration appropriée
    const session = await stripeClient.checkout.sessions.create({
      customer: customer,
      customer_email: customerEmail,
      line_items: [
        {
          price: priceId,
          quantity: seats,
        },
      ],
      mode: isReccuring ? 'subscription' : 'payment',
      return_url: `${origin}/checkout/success?redirect_status=succeeded&session_id={CHECKOUT_SESSION_ID}`,
      metadata: baseMetadata,
      payment_method_types: ['card'],
      ui_mode: 'embedded',

      // Note: customer_creation='always' n'est disponible qu'en mode 'payment'
      // Pour les subscriptions, Stripe crée automatiquement un customer
    })

    logger.info('✅ [EMBED-CHECKOUT] Session embedded créée avec succès')
    logger.debug('[EMBED-CHECKOUT] Détails session:', {
      sessionId: session.id,
      mode: guest || !user ? 'guest' : 'user_connecté',
      customer: customer,
      customerEmail: customerEmail,
      metadata: baseMetadata,
    })

    return {
      success: true,
      sessionUrl: session.url,
      sessionId: session.id,
      clientSecret: session.client_secret,
    }
  } catch (error) {
    logger.error(
      '[EMBED-CHECKOUT] ❌ Erreur lors de la création session:',
      error
    )
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}
