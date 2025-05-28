'use server'

import {headers} from 'next/headers'
import Stripe from 'stripe'

const stripeSecretKey =
  process.env.NODE_ENV === 'production'
    ? process.env.STRIPE_SECRET_KEY
    : process.env.STRIPE_SECRET_KEY

const stripe = new Stripe(stripeSecretKey || '', {
  apiVersion: '2025-02-24.acacia',
})

export async function createPaymentLink(priceId: string) {
  const headersList = await headers()
  const origin = headersList.get('origin') || ''

  try {
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      after_completion: {
        type: 'redirect',
        redirect: {
          url: `${origin}/success?redirect_status=succeeded`,
        },
      },
    })

    console.log('Payment Link:', paymentLink.url)
    return {
      success: true,
      url: paymentLink.url,
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
//   currency: string = 'eur'
// ) {
//   try {
//     // Créer d'abord un produit
//     const product = await stripe.products.create({
//       name: 'CodeMail Pro Bundle',
//       description: 'Lifetime Access to CodeMail Pro Bundle',
//     })

//     // Créer ensuite un prix pour ce produit
//     const price = await stripe.prices.create({
//       unit_amount: amount * 100, // Convertit le montant en centimes (ex: 197€ -> 19700)
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

// // Fonction utilitaire pour récupérer un price
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
