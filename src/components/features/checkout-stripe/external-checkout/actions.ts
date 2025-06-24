'use server'

import {headers} from 'next/headers'

import {getPlanByPriceId, stripeClient} from '@/lib/stripe/stripe-utils'
import {getAuthUser} from '@/services/authentication/auth-service'

export async function createCheckoutSession(
  priceId: string,
  seats: number = 1
) {
  const user = await getAuthUser()
  if (!user) {
    throw new Error('User not found')
  }
  const plan = getPlanByPriceId(priceId)
  if (!plan) {
    throw new Error('Plan not found')
  }

  const headersList = await headers()
  const origin = headersList.get('origin') || ''

  try {
    // Créer ou récupérer le customer Stripe
    let customerId = user.stripeCustomerId

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

    const isReccuring = plan.isReccuring

    // Créer la session checkout avec le customer
    const session = await stripeClient.checkout.sessions.create({
      customer: customerId, // ✅ Customer spécifié
      line_items: [
        {
          price: priceId,
          quantity: seats,
        },
      ],
      mode: isReccuring ? 'subscription' : 'payment', // Mode subscription pour les abonnements
      success_url: `${origin}/checkout/success?redirect_status=succeeded&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
      metadata: {
        seats,
        email: user.email,
        plan: plan.planCode,
        interval: plan.isYearly ? 'year' : 'month',
        userId: user.id,
        source: 'custom_checkout', // IMPORTANT : Marquer comme checkout custom
        managed_by: 'better_auth', // Indiquer que Better Auth doit gérer
      },
      payment_method_types: ['card'],
    })

    console.log('Checkout Session:', session.url)
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
