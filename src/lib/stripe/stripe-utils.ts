import Stripe from 'stripe'

import {stripeClient} from './stripe-client'

/**
 * Récupère le priceId à partir d'un subscriptionId
 * @param subscriptionId - L'ID de l'abonnement Stripe
 * @returns Le priceId de l'abonnement ou null si non trouvé
 */
export async function getPriceIdFromSubscriptionId(
  subscriptionId: string
): Promise<string | null> {
  try {
    const subscription =
      await stripeClient.subscriptions.retrieve(subscriptionId)

    // Récupérer le premier item de l'abonnement (normalement il n'y en a qu'un)
    const firstItem = subscription.items.data[0]

    if (firstItem && firstItem.price && firstItem.price.id) {
      return firstItem.price.id
    }

    return null
  } catch (error) {
    console.error('Erreur lors de la récupération du priceId:', error)
    return null
  }
}

/**
 * Récupère les détails complets d'un abonnement
 * @param subscriptionId - L'ID de l'abonnement Stripe
 * @returns Les détails de l'abonnement ou null si non trouvé
 */
export async function getSubscriptionDetails(
  subscriptionId: string
): Promise<Stripe.Subscription | null> {
  try {
    const subscription =
      await stripeClient.subscriptions.retrieve(subscriptionId)
    return subscription
  } catch (error) {
    console.error("Erreur lors de la récupération de l'abonnement:", error)
    return null
  }
}

/**
 * Récupère le prix formaté depuis un objet Stripe subscription
 * @param stripeSubscription - L'objet Stripe subscription
 * @returns Le prix formaté avec devise et fréquence
 */
export function getFormattedPriceFromSubscription(
  stripeSubscription: Stripe.Subscription | null
): string {
  if (!stripeSubscription?.items?.data?.[0]?.price) {
    return 'Non défini'
  }

  const priceObject = stripeSubscription.items.data[0].price
  const quantity = stripeSubscription.items.data[0].quantity || 1

  // Récupérer le montant unitaire (en centimes)
  const unitAmount = priceObject.unit_amount || 0

  // Convertir en euros (diviser par 100 pour les centimes)
  const unitPrice = unitAmount / 100

  // Calculer le prix total avec la quantité
  const totalPrice = unitPrice * quantity

  // Récupérer la devise
  const currency = priceObject.currency?.toUpperCase() || 'EUR'

  // Récupérer la fréquence
  const interval = priceObject.recurring?.interval
  let frequencyText = ''

  switch (interval) {
    case 'month':
      frequencyText = '/mois'
      break
    case 'year':
      frequencyText = '/an'
      break
    case 'day':
      frequencyText = '/jour'
      break
    case 'week':
      frequencyText = '/semaine'
      break
    default:
      frequencyText = priceObject.recurring ? '/période' : ''
  }

  return `${totalPrice}${currency === 'EUR' ? '€' : ` ${currency}`}${frequencyText}`
}

/**
 * Récupère les informations détaillées d'un abonnement Stripe
 * @param stripeSubscription - L'objet Stripe subscription
 * @returns Les informations détaillées de l'abonnement
 */
export function getSubscriptionInfo(
  stripeSubscription: Stripe.Subscription | null
): {
  price: string
  quantity: number
  currency: string
  interval: string | null
  priceId: string | null
  unitAmount: number
} {
  if (!stripeSubscription?.items?.data?.[0]?.price) {
    return {
      price: 'Non défini',
      quantity: 0,
      currency: 'EUR',
      interval: null,
      priceId: null,
      unitAmount: 0,
    }
  }

  const priceObject = stripeSubscription.items.data[0].price
  const quantity = stripeSubscription.items.data[0].quantity || 1
  const unitAmount = priceObject.unit_amount || 0
  const currency = priceObject.currency?.toUpperCase() || 'EUR'
  const interval = priceObject.recurring?.interval || null
  const priceId = priceObject.id

  return {
    price: getFormattedPriceFromSubscription(stripeSubscription),
    quantity,
    currency,
    interval,
    priceId,
    unitAmount: unitAmount / 100, // Convertir en unité monétaire
  }
}
