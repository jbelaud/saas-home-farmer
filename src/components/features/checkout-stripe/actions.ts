'use server'

import {headers} from 'next/headers'
import Stripe from 'stripe'

const stripeSecretKey =
  process.env.NODE_ENV === 'production'
    ? process.env.STRIPE_SECRET_KEY
    : process.env.STRIPE_SECRET_KEY

const stripe = new Stripe(stripeSecretKey || '', {
  apiVersion: '2025-05-28.basil',
})
// Numéro : 4242 4242 4242 4242
// Date d'expiration : N'importe quelle date future
// CVC : N'importe quels 3 chiffres
// Code postal : N'importe quels 5 chiffres

// auth
// Numéro : 4000 0025 0000 3155
// Date d'expiration : N'importe quelle date future
// CVC : N'importe quels 3 chiffres
// Code postal : N'importe quels 5 chiffres

//refuser
// Numéro : 4000 0000 0000 0002
// Date d'expiration : N'importe quelle date future
// CVC : N'importe quels 3 chiffres
// Code postal : N'importe quels 5 chiffres
export type PriceRecap = {
  priceId?: string
  planName: string
  price: number
  originalPrice: number
  discount: number
  description: string | null
  features?: string[]
  currency: string
  interval?: string
  intervalCount?: number
}

export async function getSubscriptionRecapInfo(
  priceId: string,
  couponCode?: string
) {
  try {
    // Récupérer les détails du prix
    const price = await stripe.prices.retrieve(priceId, {
      expand: ['product'], // Inclure les détails du produit associé
    })

    // Extraire le produit depuis le prix
    const product = price.product as Stripe.Product

    // Calculer le montant initial
    const unitAmount = price.unit_amount || 0
    const originalPrice = unitAmount / 100 // Convertir les centimes en euros
    let finalPrice = originalPrice
    let discount = 0
    let warning
    // Si un code promo est fourni, récupérer et appliquer la réduction
    if (couponCode) {
      try {
        const coupon = await stripe.coupons.retrieve(couponCode)

        if (coupon.valid) {
          if (coupon.amount_off) {
            // Réduction fixe en centimes
            discount = coupon.amount_off / 100
            finalPrice = originalPrice - discount
          } else if (coupon.percent_off) {
            // Réduction en pourcentage
            discount = (originalPrice * coupon.percent_off) / 100
            finalPrice = originalPrice - discount
          }
        }
      } catch (couponError) {
        console.warn('Error retrieving coupon:', couponError)
        // Continue sans appliquer de réduction si le coupon est invalide
        warning = 'Invalid coupon code'
      }
    }

    // Construire l'objet de récapitulatif

    return {
      success: true,
      recap: {
        priceId,
        planName: product.name,
        price: finalPrice,
        originalPrice,
        discount,
        description: product.description,
        features: product.metadata.features
          ? JSON.parse(product.metadata.features)
          : undefined,
        currency: price.currency,
        interval: price.recurring?.interval,
        intervalCount: price.recurring?.interval_count,
      } as PriceRecap,
      warning,
    }
  } catch (error) {
    console.error('Error getting subscription recap:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}
export async function createCheckoutSession(priceId: string) {
  try {
    const headersList = await headers()
    const origin = headersList.get('origin') || ''

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

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      return_url: `${origin}/checkout/success`,
      payment_method_types: ['card'],
      ui_mode: 'embedded',
    })

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntent,
      session,
    }
  } catch (error) {
    console.error('Stripe error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

export async function createStripePrice(
  amount: number,
  currency: string = 'eur'
) {
  try {
    // Créer d'abord un produit
    const product = await stripe.products.create({
      name: 'CodeMail Pro Bundle',
      description: 'Lifetime Access to CodeMail Pro Bundle',
    })

    // Créer ensuite un prix pour ce produit
    const price = await stripe.prices.create({
      unit_amount: amount * 100, // Convertit le montant en centimes (ex: 197€ -> 19700)
      currency,
      product: product.id,
    })

    return {
      success: true,
      priceId: price.id,
      productId: product.id,
    }
  } catch (error) {
    console.error('Error creating Stripe price:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

// Fonction utilitaire pour récupérer un price
export async function getStripePrice(priceId: string) {
  try {
    const price = await stripe.prices.retrieve(priceId)
    return {
      success: true,
      price,
    }
  } catch (error) {
    console.error('Error retrieving Stripe price:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}
