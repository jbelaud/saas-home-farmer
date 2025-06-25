'use server'

import Stripe from 'stripe'

import {getPlanByPriceId, stripeClient} from '@/lib/stripe/stripe-utils'
import {getAuthUser} from '@/services/authentication/auth-service'
import {createSubscriptionFromStripeService} from '@/services/facades/subscription-service-facade'
import {createUserFromStripeService} from '@/services/facades/user-service-facade'

export async function createCheckoutSession(
  priceId: string,
  seats: number = 1,
  guest: boolean = false,
  email?: string
) {
  // Récupérer l'utilisateur connecté (optionnel si guest)
  const user = await getAuthUser()

  // Vérifier si le checkout est possible selon le contexte
  if (!guest && !user) {
    return {
      success: false,
      error:
        'Utilisateur non connecté - utilisez le mode guest ou connectez-vous',
    }
  }

  if (guest && !email) {
    return {
      success: false,
      error: 'Email requis pour le mode guest',
    }
  }

  const plan = getPlanByPriceId(priceId)
  if (!plan) {
    throw new Error('Plan not found')
  }

  try {
    // Logique différente selon guest ou user connecté
    let customerId: string | undefined
    let customerEmail: string | undefined
    let baseMetadata: Record<string, string>

    if (guest || !user) {
      // Mode Guest : créer un customer avec l'email fourni
      customerEmail = email // Email fourni par le formulaire guest

      const customer = await stripeClient.customers.create({
        email: email,
        metadata: {
          managed_by: 'webhook_guest_checkout',
          source: 'react_stripe_elements',
        },
      })
      customerId = customer.id

      baseMetadata = {
        source: 'react_stripe_elements',
        guest_checkout: 'true', // Marquer comme guest checkout
        isReccuring: plan.isReccuring ? 'true' : 'false',
        seats: seats.toString(),
        plan: plan.planCode,
        interval: plan.isYearly ? 'year' : 'month',
        email: email || '', // Ajout de l'email dans les metadata
      }
    } else {
      // Mode User connecté : utiliser ou créer le customer
      customerId = user.stripeCustomerId || undefined

      if (!customerId) {
        const customer = await stripeClient.customers.create({
          email: user.email ?? '',
          metadata: {
            userId: user.id,
          },
        })
        customerId = customer.id
      }

      baseMetadata = {
        source: 'react_stripe_elements',
        isReccuring: plan.isReccuring ? 'true' : 'false',
        seats: seats.toString(),
        email: user.email ?? '',
        plan: plan.planCode,
        interval: plan.isYearly ? 'year' : 'month',
        userId: user.id,
        customerEmail: user.email ?? '', // Ajout pour le webhook
      }
    }

    // Récupérer le prix pour connaître le montant
    const price = await stripeClient.prices.retrieve(priceId)
    if (!price || !price.unit_amount) {
      throw new Error('Price not found')
    }
    const amount = price.unit_amount * seats * 100

    // Créer un Setup Intent pour configurer le mode de paiement
    const setupIntent = await stripeClient.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
      usage: 'off_session',
      metadata: {
        ...baseMetadata,
        priceId: priceId,
        amount: amount.toString(),
        currency: price.currency,
      },
    })

    // Sauvegarder les informations de l'abonnement en attente dans les métadonnées
    if (!setupIntent.client_secret) {
      throw new Error('Client secret manquant pour le setup intent')
    }

    console.log('🔧 React Stripe Setup Intent créé:', {
      mode: guest || !user ? 'guest' : 'user_connecté',
      customer: customerId,
      customerEmail: customerEmail || email,
      metadata: baseMetadata,
      setupIntentId: setupIntent.id,
    })

    return {
      success: true,
      clientSecret: setupIntent.client_secret,
      setupIntentId: setupIntent.id,
      customerId: customerId,
      priceId: priceId,
      amount: amount,
      unit_amount: price.unit_amount,
      currency: price.currency,
      seats: seats,
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
  try {
    // Récupérer le Setup Intent pour obtenir le payment method ET les métadonnées
    const setupIntent = await stripeClient.setupIntents.retrieve(setupIntentId)
    console.log('🔧 setupIntent', setupIntent)
    const metadata = setupIntent.metadata
    console.log('🔧 setupIntent.metadata', metadata)

    const seats = metadata?.seats ? parseInt(metadata.seats) : 1
    const isReccuring = metadata?.isReccuring
      ? metadata.isReccuring === 'true'
      : false
    const isGuestCheckout = metadata?.guest_checkout === 'true'

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

    let stripeSubscription: Stripe.Subscription | null = null
    let customerEmail: string = ''

    // Gestion différente selon guest ou user connecté
    if (isGuestCheckout) {
      // Mode Guest : récupérer l'email du customer ou demander à l'utilisateur
      const customer = await stripeClient.customers.retrieve(customerId)
      if (customer.deleted) {
        throw new Error('Customer supprimé')
      }
      customerEmail = customer.email || ''

      if (!customerEmail) {
        throw new Error("Email requis pour finaliser l'abonnement guest")
      }

      // Créer l'utilisateur guest en base de données
      await createUserFromStripeService({
        email: customerEmail,
        stripeCustomerId: customerId,
        name: customerEmail.split('@')[0],
      })
      console.log('✅ Utilisateur guest créé:', customerEmail)
    } else {
      // Mode User connecté : vérifier l'authentification
      const user = await getAuthUser()
      if (!user) {
        return {
          success: false,
          error: 'Utilisateur non connecté',
        }
      }
      customerEmail = user.email ?? ''
    }

    if (isReccuring) {
      // Créer l'abonnement Stripe avec le payment method confirmé
      stripeSubscription = await stripeClient.subscriptions.create({
        customer: customerId,
        items: [
          {
            price: priceId,
            quantity: seats,
          },
        ],
        default_payment_method: paymentMethodId,
        metadata: {
          email: customerEmail,
          source: 'react_stripe_elements',
          ...(isGuestCheckout
            ? {guest_checkout: 'true'}
            : {managed_by: 'better_auth'}),
        },
      })
    }

    // Récupérer les informations du plan depuis le priceId
    const plan = getPlanByPriceId(priceId)
    if (!plan) {
      throw new Error('Plan non trouvé pour ce priceId')
    }

    // Créer l'abonnement en base via le service
    await createSubscriptionFromStripeService(
      customerEmail,
      plan.planCode,
      plan.isYearly,
      stripeSubscription?.id ?? '',
      customerId,
      seats
    )

    console.log('🔧 React Stripe Subscription confirmée:', {
      mode: isGuestCheckout ? 'guest' : 'user_connecté',
      customerEmail,
      subscriptionId: stripeSubscription?.id,
    })

    return {
      success: true,
      subscriptionId: stripeSubscription?.id ?? '',
      status: stripeSubscription?.status ?? '',
    }
  } catch (error) {
    console.error('Stripe subscription error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}
