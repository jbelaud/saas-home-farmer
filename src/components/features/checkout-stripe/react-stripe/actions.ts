'use server'

import Stripe from 'stripe'

import {getPlanByPriceId} from '@/lib/stripe-utils'
import {getAuthUser} from '@/services/authentication/auth-service'
import {createSubscriptionFromStripeService} from '@/services/facades/subscription-service-facade'

const stripeSecretKey =
  process.env.NODE_ENV === 'production'
    ? process.env.STRIPE_SECRET_KEY
    : process.env.STRIPE_SECRET_KEY

const stripe = new Stripe(stripeSecretKey || '', {
  apiVersion: '2025-05-28.basil',
})

export async function createCheckoutSession(priceId: string) {
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
  try {
    // Créer ou récupérer le customer Stripe
    let customerId = user.stripeCustomerId

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
          managed_by: 'better_auth',
        },
      })
      customerId = customer.id
    }

    // Récupérer le prix pour connaître le montant
    const price = await stripe.prices.retrieve(priceId)

    // Créer un Setup Intent pour configurer le mode de paiement
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
      usage: 'off_session',
      metadata: {
        email: user.email,
        plan: plan.planCode,
        interval: plan.isYearly ? 'year' : 'month',
        userId: user.id,
        source: 'react_stripe_elements',
        managed_by: 'better_auth',
        priceId: priceId,
        amount: price.unit_amount?.toString() || '0',
        currency: price.currency,
      },
    })

    // Sauvegarder les informations de l'abonnement en attente dans les métadonnées
    if (!setupIntent.client_secret) {
      throw new Error('Client secret manquant pour le setup intent')
    }

    return {
      success: true,
      clientSecret: setupIntent.client_secret,
      setupIntentId: setupIntent.id,
      customerId: customerId,
      priceId: priceId,
    }
  } catch (error) {
    console.error('Stripe error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

export async function confirmSubscription(setupIntentId: string) {
  const user = await getAuthUser()
  if (!user) {
    return {
      success: false,
      error: 'Utilisateur non connecté',
    }
  }

  try {
    // Récupérer le Setup Intent pour obtenir le payment method ET les métadonnées
    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId)

    if (setupIntent.status !== 'succeeded') {
      throw new Error('Setup Intent non confirmé')
    }

    // Récupérer le priceId depuis les métadonnées du SetupIntent
    const priceId = setupIntent.metadata?.priceId
    if (!priceId) {
      throw new Error('PriceId manquant dans les métadonnées du SetupIntent')
    }

    const customerId = setupIntent.customer as string
    const paymentMethodId = setupIntent.payment_method as string

    // Créer l'abonnement Stripe avec le payment method confirmé
    const stripeSubscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: priceId,
        },
      ],
      default_payment_method: paymentMethodId,
      metadata: {
        email: user.email,
        userId: user.id,
        source: 'react_stripe_elements',
        managed_by: 'better_auth',
      },
    })

    // Récupérer les informations du plan depuis le priceId
    const plan = getPlanByPriceId(priceId)
    if (!plan) {
      throw new Error('Plan non trouvé pour ce priceId')
    }

    // Créer l'abonnement en base via le service
    await createSubscriptionFromStripeService(
      user.email,
      plan.planCode,
      plan.isYearly,
      stripeSubscription.id
    )

    return {
      success: true,
      subscriptionId: stripeSubscription.id,
      status: stripeSubscription.status,
    }
  } catch (error) {
    console.error('Stripe subscription error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}
