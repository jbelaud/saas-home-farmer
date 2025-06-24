'use server'

import {headers} from 'next/headers'

import {getPlanByPriceId, stripeClient} from '@/lib/stripe-utils'

export async function createPaymentLink(priceId: string, seats: number = 1) {
  // const user = await getAuthUser()
  // if (!user) {
  //   throw new Error('User not found')
  // }
  const plan = getPlanByPriceId(priceId)
  if (!plan) {
    throw new Error('Plan not found')
  }
  const isReccuring = plan.isReccuring
  //const customer = user.stripeCustomerId || undefined
  const headersList = await headers()
  const origin = headersList.get('origin') || ''

  try {
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
        source: 'guest_checkout', // IMPORTANT : Marquer comme checkout custom
        managed_by: 'better_auth', // Indiquer que Better Auth doit gérer
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
