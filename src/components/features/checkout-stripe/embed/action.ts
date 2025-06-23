'use server'

import {headers} from 'next/headers'
import Stripe from 'stripe'

import {getPlanByPriceId} from '@/lib/stripe-utils'
import {getAuthUser} from '@/services/authentication/auth-service'

const stripeSecretKey =
  process.env.NODE_ENV === 'production'
    ? process.env.STRIPE_SECRET_KEY
    : process.env.STRIPE_SECRET_KEY

const stripe = new Stripe(stripeSecretKey || '', {
  apiVersion: '2025-05-28.basil',
})

export async function createCheckoutSession(
  priceId: string,
  customerEmail: string
) {
  try {
    const plan = getPlanByPriceId(priceId)
    if (!plan) {
      throw new Error('Plan not found')
    }
    const user = await getAuthUser()
    if (!user) {
      throw new Error('User not found')
    }
    // Utiliser le stripeCustomerId de l'utilisateur Better Auth
    const customer = user.stripeCustomerId || undefined
    const headersList = await headers()
    const origin = headersList.get('origin') || ''

    // Récupérer le prix pour déterminer s'il est récurrent
    const price = await stripe.prices.retrieve(priceId)
    const isRecurring = price.type === 'recurring'
    const interval = price.recurring?.interval || 'month'

    const session = await stripe.checkout.sessions.create({
      customer: customer || undefined, // Utilise le customer Better Auth existant
      customer_email: customer ? undefined : customerEmail, //Error: Error: You may only specify one of these parameters: customer, customer_email.
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: isRecurring ? 'subscription' : 'payment',
      return_url: `${origin}/checkout/success?redirect_status=succeeded`,
      payment_method_types: ['card'],
      ui_mode: 'embedded',

      metadata: {
        plan: plan?.planCode,
        interval,
        email: customerEmail,
      },
    })

    return {
      success: true,
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

export async function createCheckoutSessionWithUser(
  priceId: string,
  planName: string,
  isYearly: boolean = false
) {
  try {
    // Récupérer l'utilisateur connecté
    const user = await getAuthUser()
    if (!user) {
      return {
        success: false,
        error: 'Utilisateur non connecté',
      }
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
        plan: planName,
        interval: isYearly ? 'year' : 'month',
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

// export async function createStripePrice(
//   amount: number,
//   currency: string = 'eur',
//   features: string[] = [],
//   originalPrice?: number
// ) {
//   try {
//     // Créer d'abord un produit avec métadonnées
//     const product = await stripe.products.create({
//       name: 'CodeMail Pro Bundle',
//       description: 'Lifetime Access to CodeMail Pro Bundle',
//       metadata: {
//         features: JSON.stringify(features),
//         original_price: originalPrice?.toString() || (amount * 2).toString(),
//       },
//     })

//     // Créer ensuite un prix pour ce produit
//     const price = await stripe.prices.create({
//       unit_amount: amount * 100,
//       currency,
//       product: product.id,
//     })

//     return {
//       success: true,
//       priceId: price.id,
//       productId: product.id,
//     }
//   } catch (error) {
//     console.error('Error creating Stripe price:', error)
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : 'Unknown error occurred',
//     }
//   }
// }

// Fonction utilitaire pour récupérer un price
// export async function getStripePrice(priceId: string) {
//   try {
//     const price = await stripe.prices.retrieve(priceId)
//     return {
//       success: true,
//       price,
//     }
//   } catch (error) {
//     console.error('Error retrieving Stripe price:', error)
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : 'Unknown error occurred',
//     }
//   }
// }
