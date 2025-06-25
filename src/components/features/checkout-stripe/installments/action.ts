'use server'

import {headers} from 'next/headers'

import {getPlanByPriceId, stripeClient} from '@/lib/stripe/stripe-utils'
import {getAuthUser} from '@/services/authentication/auth-service'

import {createInstallmentSubscriptionSchedule} from './stripe-utils'
// Import des types locaux du dossier installments
import {InstallmentPlan, InstallmentPlans, InstallmentType} from './types'

export type InstallmentCheckoutResult = {
  success: boolean
  sessionUrl?: string
  sessionId?: string
  clientSecret?: string
  installmentPlan?: InstallmentPlan
  scheduleId?: string
  error?: string
}

export async function createInstallmentCheckoutSession(
  priceId: string,
  installmentType: InstallmentType,
  seats: number = 1,
  guest: boolean = false
): Promise<InstallmentCheckoutResult> {
  try {
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

    const plan = getPlanByPriceId(priceId)
    if (!plan) {
      return {
        success: false,
        error: 'Plan non trouvé',
      }
    }

    // Vérifier que ce n'est pas un plan récurrent (incompatible avec les échéanciers)
    if (plan.isReccuring) {
      return {
        success: false,
        error:
          'Les paiements en plusieurs fois ne sont pas disponibles pour les abonnements récurrents',
      }
    }

    const installmentPlan = InstallmentPlans[installmentType]
    if (!installmentPlan) {
      return {
        success: false,
        error: "Type d'échéancier non valide",
      }
    }

    const headersList = await headers()
    const origin = headersList.get('origin') || ''

    // Récupérer le prix pour calculer le montant total
    const price = await stripeClient.prices.retrieve(priceId)
    if (!price || !price.unit_amount) {
      return {
        success: false,
        error: 'Prix non trouvé',
      }
    }

    const totalAmount = price.unit_amount * seats // en centimes
    const numberOfPayments = installmentPlan.numberOfPayments

    // Logique différente selon guest ou user connecté
    let customerId: string
    let baseMetadata: Record<string, string>

    if (guest || !user) {
      // Mode Guest : créer un customer temporaire, Stripe collectera l'email
      const customer = await stripeClient.customers.create({
        metadata: {
          managed_by: 'webhook_guest_checkout',
          source: 'installment_checkout',
        },
      })
      customerId = customer.id

      baseMetadata = {
        source: 'installment_checkout',
        guest_checkout: 'true', // Marquer comme guest checkout
        plan: plan.planCode,
        installment_type: installmentType,
      }
    } else {
      // Mode User connecté : utiliser ou créer le customer
      customerId = user.stripeCustomerId || ''

      // Créer un customer Stripe si nécessaire
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
        source: 'installment_checkout',
        email: user.email ?? '',
        plan: plan.planCode,
        userId: user.id,
        customerEmail: user.email ?? '',
        installment_type: installmentType,
      }
    }

    // Créer le Subscription Schedule pour les échéanciers
    const scheduleResult = await createInstallmentSubscriptionSchedule(
      customerId,
      priceId,
      totalAmount,
      numberOfPayments,
      seats,
      baseMetadata
    )

    // Créer une session checkout pour le premier paiement
    const session = await stripeClient.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: scheduleResult.installmentPrice.id,
          quantity: seats,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/checkout/success?redirect_status=succeeded&session_id={CHECKOUT_SESSION_ID}&installment_schedule=${scheduleResult.schedule.id}`,
      cancel_url: `${origin}/pricing`,
      metadata: {
        ...baseMetadata,
        payment_type: 'installment',
        number_of_payments: numberOfPayments.toString(),
        seats: seats.toString(),
        schedule_id: scheduleResult.schedule.id,
        original_price_id: priceId,
      },
      payment_method_types: ['card'],
    })

    console.log('🔧 Installment Checkout Session créée:', {
      mode: guest || !user ? 'guest' : 'user_connecté',
      customer: customerId,
      metadata: baseMetadata,
      scheduleId: scheduleResult.schedule.id,
    })

    return {
      success: true,
      sessionUrl: session.url || undefined,
      sessionId: session.id,
      clientSecret: session.client_secret || undefined,
      installmentPlan: installmentPlan,
      scheduleId: scheduleResult.schedule.id,
    }
  } catch (error) {
    console.error('Stripe installment error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }
  }
}
