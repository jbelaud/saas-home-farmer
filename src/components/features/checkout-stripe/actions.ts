'use server'

import Stripe from 'stripe'

import {stripeClient} from '@/lib/stripe/stripe-client'
import {getPlanByPriceId} from '@/lib/stripe/stripe-utils'
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
  seats: number
  unitPrice: number
  unitOriginalPrice: number
  unitDiscount: number
}

export async function getSubscriptionRecapInfo(
  priceId: string,
  couponCode?: string,
  seats: number = 1
) {
  try {
    const plan = getPlanByPriceId(priceId)
    // Récupérer les détails du prix
    const price = await stripeClient.prices.retrieve(priceId, {
      expand: ['product'], // Inclure les détails du produit associé
    })

    // Extraire le produit depuis le prix
    const product = price.product as Stripe.Product

    // Calculer le montant initial par siège
    const unitAmount = price.unit_amount || 0
    const unitOriginalPrice = unitAmount / 100 // Convertir les centimes en euros
    const unitFinalPrice = unitOriginalPrice
    let unitDiscount = 0
    let warning

    // Si un code promo est fourni, récupérer et appliquer la réduction
    if (couponCode) {
      try {
        const coupon = await stripeClient.coupons.retrieve(couponCode)

        if (coupon.valid) {
          if (coupon.amount_off) {
            // Réduction fixe en centimes par siège
            unitDiscount = coupon.amount_off / 100
          } else if (coupon.percent_off) {
            // Réduction en pourcentage par siège
            unitDiscount = (unitOriginalPrice * coupon.percent_off) / 100
          }
        }
      } catch (couponError) {
        console.warn('Error retrieving coupon:', couponError)
        // Continue sans appliquer de réduction si le coupon est invalide
        warning = 'Invalid coupon code'
      }
    }

    // Calculer les prix totaux avec le nombre de sièges
    const originalPrice = unitOriginalPrice * seats
    const discount = unitDiscount * seats
    const finalPrice = (unitFinalPrice - unitDiscount) * seats

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
          : plan?.features,
        currency: price.currency,
        interval: price.recurring?.interval,
        intervalCount: price.recurring?.interval_count,
        seats,
        unitPrice: unitFinalPrice - unitDiscount,
        unitOriginalPrice,
        unitDiscount,
      } as PriceRecap,
      warning,
    }
  } catch (error) {
    console.error('Error getting stripe subscription recap:', error)
    throw error
  }
}

export async function createStripePrice(
  amount: number,
  currency: string = 'eur'
) {
  try {
    // Créer d'abord un produit
    const product = await stripeClient.products.create({
      name: 'Pro Bundle',
      description: 'Lifetime Access to Pro Bundle',
    })

    // Créer ensuite un prix pour ce produit
    const price = await stripeClient.prices.create({
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
    const price = await stripeClient.prices.retrieve(priceId)
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
