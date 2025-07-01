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
