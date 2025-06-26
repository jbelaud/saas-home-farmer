'use server'

import {headers} from 'next/headers'

import {logger} from '@/lib/logger'
import {getPlanByPriceId, stripeClient} from '@/lib/stripe/stripe-utils'
import {getAuthUser} from '@/services/authentication/auth-service'

export async function createCheckoutSession(
  priceId: string,
  seats: number = 1,
  guest: boolean = false
) {
  logger.info('[EXTERNAL-CHECKOUT] Création session checkout externe démarrée')
  logger.debug('[EXTERNAL-CHECKOUT] Paramètres reçus:', {priceId, seats, guest})

  // Récupérer l'utilisateur connecté (optionnel si guest)
  const user = await getAuthUser()
  logger.debug('[EXTERNAL-CHECKOUT] Utilisateur récupéré:', {
    hasUser: !!user,
    userId: user?.id,
    userEmail: user?.email,
  })

  // Vérifier si le checkout est possible selon le contexte
  if (!guest && !user) {
    logger.error(
      '[EXTERNAL-CHECKOUT] ❌ Échec: utilisateur non connecté en mode non-guest'
    )
    throw new Error(
      'Utilisateur non connecté - utilisez le mode guest ou connectez-vous'
    )
  }

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

  const headersList = await headers()
  const origin = headersList.get('origin') || ''

  try {
    // Logique différente selon guest ou user connecté
    let customerId: string | undefined
    let customerEmail: string | undefined
    let baseMetadata: Record<string, string>

    if (guest || !user) {
      logger.info('[EXTERNAL-CHECKOUT] 📋 Mode guest détecté')
      // Mode Guest : pas de customer, utilise customer_email
      customerId = undefined
      customerEmail = undefined // L'utilisateur saisira son email dans le checkout
      baseMetadata = {
        source: 'custom_checkout',
        guest_checkout: 'true', // Marquer comme guest checkout
        isReccuring: plan.isReccuring ? 'true' : 'false',
        seats: seats.toString(),
        plan: plan.planCode,
        interval: plan.isYearly ? 'year' : 'month',
        subscriptionId: 'uuid-de-votre-bdd',
      }
      logger.debug('[EXTERNAL-CHECKOUT] Configuration guest:', baseMetadata)
    } else {
      logger.info('[EXTERNAL-CHECKOUT] 👤 Mode utilisateur connecté détecté')
      // Mode User connecté : créer ou récupérer le customer
      customerId = user.stripeCustomerId || undefined

      if (!customerId) {
        logger.info('[EXTERNAL-CHECKOUT] 🔧 Création customer Stripe')
        const customer = await stripeClient.customers.create({
          email: user.email,
          metadata: {
            userId: user.id,
            managed_by: 'better_auth',
          },
        })
        customerId = customer.id
        logger.debug('[EXTERNAL-CHECKOUT] Customer Stripe créé:', {customerId})
      }

      baseMetadata = {
        subscriptionId: 'uuid-de-votre-bdd',
        source: 'custom_checkout',
        isReccuring: plan.isReccuring ? 'true' : 'false',
        seats: seats.toString(),
        email: user.email ?? '',
        plan: plan.planCode,
        interval: plan.isYearly ? 'year' : 'month',
        userId: user.id,
        customerEmail: user.email ?? '', // Ajout pour le webhook
      }
      logger.debug('[EXTERNAL-CHECKOUT] Configuration utilisateur connecté:', {
        customerId,
        userId: user.id,
        email: user.email,
      })
    }

    const isReccuring = plan.isReccuring

    logger.info('[EXTERNAL-CHECKOUT] 🔧 Création session Stripe')
    // Créer la session checkout avec la configuration appropriée
    const session = await stripeClient.checkout.sessions.create({
      customer: customerId,
      customer_email: customerEmail,
      line_items: [
        {
          price: priceId,
          quantity: seats,
        },
      ],
      mode: isReccuring ? 'subscription' : 'payment',
      success_url: `${origin}/checkout/success?redirect_status=succeeded&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
      metadata: baseMetadata,
      payment_method_types: ['card'],
    })

    logger.info('✅ [EXTERNAL-CHECKOUT] Session externe créée avec succès')
    logger.debug('[EXTERNAL-CHECKOUT] Détails session:', {
      sessionId: session.id,
      mode: guest || !user ? 'guest' : 'user_connecté',
      customer: customerId,
      customerEmail: customerEmail,
      url: session.url,
    })

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
