'use server'

import {headers} from 'next/headers'

import {logger} from '@/lib/logger'
import {getPlanByPriceId, stripeClient} from '@/lib/stripe/stripe-utils'

export async function createPaymentLink(
  priceId: string,
  seats: number = 1,
  guest: boolean = true
) {
  logger.info('[PAYMENT-LINK] Création payment link démarrée')
  logger.debug('[PAYMENT-LINK] Paramètres reçus:', {priceId, seats, guest})

  // const user = await getAuthUser()
  // if (!user) {
  //   throw new Error('User not found')
  // }

  if (!guest) {
    logger.error(
      '[PAYMENT-LINK] ❌ Payment link seulement disponible en mode guest'
    )
    return {
      success: false,
      error: 'Payment link is only available for guest checkout',
    }
  }

  const plan = getPlanByPriceId(priceId)
  if (!plan) {
    logger.error('[PAYMENT-LINK] ❌ Plan non trouvé pour priceId:', priceId)
    throw new Error('Plan not found')
  }
  logger.debug('[PAYMENT-LINK] Plan récupéré:', {
    planCode: plan.planCode,
    isReccuring: plan.isReccuring,
  })

  const isReccuring = plan.isReccuring
  //const customer = user.stripeCustomerId || undefined
  const headersList = await headers()
  const origin = headersList.get('origin') || ''

  try {
    logger.info('[PAYMENT-LINK] 🔧 Création payment link Stripe')
    const paymentLink = await stripeClient.paymentLinks.create({
      line_items: [
        {
          price: priceId,
          quantity: seats,
        },
      ],
      after_completion: {
        type: 'redirect',
        redirect: {
          url: `${origin}/checkout/success?redirect_status=succeeded`,
        },
      },
      metadata: {
        priceId,
        isReccuring: isReccuring ? 'true' : 'false',
        seats,
        plan: plan.planCode,
        interval: plan.isYearly ? 'year' : 'month',
        guest_checkout: 'true', // IMPORTANT : Marquer comme checkout custom
        managed_by: 'better_auth', // Indiquer que Better Auth doit gérer
      },
    })

    logger.info('✅ [PAYMENT-LINK] Payment link créé avec succès')
    logger.debug('[PAYMENT-LINK] Détails payment link:', {
      url: paymentLink.url,
      id: paymentLink.id,
      metadata: paymentLink.metadata,
    })

    return {
      success: true,
      url: paymentLink.url,
    }
  } catch (error) {
    logger.error(
      '[PAYMENT-LINK] ❌ Erreur lors de la création payment link:',
      error
    )
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}
