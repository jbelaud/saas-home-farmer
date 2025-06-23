'use server'

import {headers} from 'next/headers'
import Stripe from 'stripe'

import {env} from '@/env'
import {getPlanByPriceId} from '@/lib/stripe-utils'
import {getAuthUser} from '@/services/authentication/auth-service'

const stripe = new Stripe(env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-05-28.basil',
})

export async function createEmbededCheckoutSession(priceId: string) {
  try {
    // Récupérer l'utilisateur connecté
    const user = await getAuthUser()
    if (!user) {
      return {
        success: false,
        error: 'Utilisateur non connecté',
      }
    }
    const plan = getPlanByPriceId(priceId)
    if (!plan) {
      throw new Error('Plan not found')
    }

    const headersList = await headers()
    const origin = headersList.get('origin') || ''

    // Utiliser le stripeCustomerId de l'utilisateur Better Auth
    const customer = user.stripeCustomerId || undefined

    // Créer la session avec le customer existant
    const session = await stripe.checkout.sessions.create({
      customer: customer || undefined, // Utilise le customer Better Auth existant
      //customer_email: customer ? undefined : customerEmail, //Error: Error: You may only specify one of these parameters: customer, customer_email.
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription', // Mode subscription pour les abonnements
      return_url: `${origin}/checkout/success?redirect_status=succeeded&session_id={CHECKOUT_SESSION_ID}`,
      //cancel_url: `${origin}/pricing`,
      metadata: {
        email: user.email,
        plan: plan.planCode,
        interval: plan.isYearly ? 'year' : 'month',
        userId: user.id, // Ajout de l'userId pour le webhook
        source: 'custom_checkout', // IMPORTANT : Marquer comme checkout custom
        managed_by: 'better_auth', // Indiquer que Better Auth doit gérer
      },
      payment_method_types: ['card'],
      ui_mode: 'embedded',
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
