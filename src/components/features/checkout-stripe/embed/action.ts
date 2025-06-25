'use server'

import {headers} from 'next/headers'

import {getPlanByPriceId, stripeClient} from '@/lib/stripe/stripe-utils'
import {getAuthUser} from '@/services/authentication/auth-service'

export async function createEmbededCheckoutSession(
  priceId: string,
  seats: number = 1,
  guest: boolean = false
) {
  try {
    // Récupérer l'utilisateur connecté (optionnel si guest)
    const user = await getAuthUser()

    // Vérifier si le checkout est possible selon le contexte
    if (!guest && !user) {
      return {
        success: false,
        error:
          'Utilisateur non connecté - utilisez le mode guest ou connectez-vous',
      }
    }

    const plan = getPlanByPriceId(priceId)
    if (!plan) {
      throw new Error('Plan not found')
    }

    const isReccuring = plan.isReccuring
    const headersList = await headers()
    const origin = headersList.get('origin') || ''

    // Logique différente selon guest ou user connecté
    let customer: string | undefined
    let customerEmail: string | undefined
    let baseMetadata: Record<string, string>

    if (guest || !user) {
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
      }
    } else {
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
      }
    }

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

    console.log('🔧 Session créée:', {
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
    console.error('Stripe error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}
