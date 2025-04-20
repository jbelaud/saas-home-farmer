'use server'

import Stripe from 'stripe'

const stripeSecretKey =
  process.env.NODE_ENV === 'production'
    ? process.env.STRIPE_SECRET_KEY
    : process.env.STRIPE_SECRET_KEY

const stripe = new Stripe(stripeSecretKey || '', {
  apiVersion: '2025-02-24.acacia',
})

export async function createCheckoutSession(priceId: string) {
  try {
    // const headersList = await headers()
    // const origin = headersList.get('origin') || ''

    // Récupérer le prix pour obtenir le montant
    const price = await stripe.prices.retrieve(priceId)

    // Créer un PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: price.unit_amount || 0,
      currency: price.currency,
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
    }
  } catch (error) {
    console.error('Stripe error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}
