'use server'

import {headers} from 'next/headers'
import Stripe from 'stripe'

import {getPlanByPriceId} from '@/lib/stripe-utils'

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
    const headersList = await headers()
    const origin = headersList.get('origin') || ''

    // Récupérer le prix pour déterminer s'il est récurrent
    const price = await stripe.prices.retrieve(priceId)
    const isRecurring = price.type === 'recurring'
    const interval = price.recurring?.interval || 'month'

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: isRecurring ? 'subscription' : 'payment',
      return_url: `${origin}/success?redirect_status=succeeded`,
      payment_method_types: ['card'],
      ui_mode: 'embedded',
      customer_email: customerEmail,
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
