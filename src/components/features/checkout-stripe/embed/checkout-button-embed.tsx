'use client'
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js'
import {loadStripe, Stripe} from '@stripe/stripe-js'
import React, {useEffect, useState} from 'react'

import {env} from '@/env'

import {createEmbededCheckoutSession} from './action'

type CheckoutButtonProps = {
  priceId: string
  variant?: 'default' | 'secondary' | 'outline'
}

if (!env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error(
    "La clé Stripe publishable est manquante. Vérifiez vos variables d'environnement."
  )
}

export default function ButtonStripeEmbed({
  priceId,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  variant = 'default',
}: CheckoutButtonProps) {
  const [, setIsLoading] = useState(false)

  const [stripe, setStripe] = useState<Stripe | null>(null)
  const [clientSecret, setClientSecret] = useState('')

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        const stripeInstance = await loadStripe(
          process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
        )
        setStripe(stripeInstance)

        const result = await createEmbededCheckoutSession(priceId)
        if (!result.success) throw new Error(result.error)
        setClientSecret(result.clientSecret || '')
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeStripe()
  }, [priceId])

  const options = {
    clientSecret,
    // Customize the appearance of the embedded checkout
    // Refer to the Stripe documentation for more details
  }
  return (
    <EmbeddedCheckoutProvider stripe={stripe} options={options}>
      <EmbeddedCheckout />
    </EmbeddedCheckoutProvider>
  )
}
