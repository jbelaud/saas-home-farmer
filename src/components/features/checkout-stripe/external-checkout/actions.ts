'use server'

import {headers} from 'next/headers'

import {getPlanByPriceId, stripeClient} from '@/lib/stripe/stripe-utils'
import {getAuthUser} from '@/services/authentication/auth-service'

export async function createCheckoutSession(
  priceId: string,
  seats: number = 1,
  guest: boolean = false
) {
  // Récupérer l'utilisateur connecté (optionnel si guest)
  const user = await getAuthUser()

  // Vérifier si le checkout est possible selon le contexte
  if (!guest && !user) {
    throw new Error(
      'Utilisateur non connecté - utilisez le mode guest ou connectez-vous'
    )
  }

  const plan = getPlanByPriceId(priceId)
  if (!plan) {
    throw new Error('Plan not found')
  }

  const headersList = await headers()
  const origin = headersList.get('origin') || ''

  try {
    // Logique différente selon guest ou user connecté
    let customerId: string | undefined
    let customerEmail: string | undefined
    let baseMetadata: Record<string, string>

    if (guest || !user) {
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
      }
    } else {
      // Mode User connecté : créer ou récupérer le customer
      customerId = user.stripeCustomerId || undefined

      if (!customerId) {
        const customer = await stripeClient.customers.create({
          email: user.email,
          metadata: {
            userId: user.id,
            managed_by: 'better_auth',
          },
        })
        customerId = customer.id
      }

      baseMetadata = {
        source: 'custom_checkout',
        isReccuring: plan.isReccuring ? 'true' : 'false',
        seats: seats.toString(),
        email: user.email ?? '',
        plan: plan.planCode,
        interval: plan.isYearly ? 'year' : 'month',
        userId: user.id,
        customerEmail: user.email ?? '', // Ajout pour le webhook
      }
    }

    const isReccuring = plan.isReccuring

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

    console.log('🔧 External Checkout Session créée:', {
      mode: guest || !user ? 'guest' : 'user_connecté',
      customer: customerId,
      customerEmail: customerEmail,
      metadata: baseMetadata,
      url: session.url,
    })

    return {
      success: true,
      url: session.url,
      sessionId: session.id,
    }
  } catch (error) {
    console.error('Stripe error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}
