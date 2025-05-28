'use client'
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js'
import {loadStripe, Stripe} from '@stripe/stripe-js'
import React, {useEffect, useState} from 'react'

import {createCheckoutSession} from './action'

type CheckoutButtonProps = {
  priceId: string
  customerEmail: string
  variant?: 'default' | 'secondary' | 'outline'
}

console.log(
  'process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
)

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error(
    "La clé Stripe publishable est manquante. Vérifiez vos variables d'environnement."
  )
}

export default function ButtonStripeEmbed({
  priceId,
  customerEmail,
  variant = 'default',
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const [stripe, setStripe] = useState<Stripe | null>(null)
  const [clientSecret, setClientSecret] = useState('')

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        const stripeInstance = await loadStripe(
          process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
        )
        setStripe(stripeInstance)

        const result = await createCheckoutSession(priceId, customerEmail)
        if (!result.success) throw new Error(result.error)
        setClientSecret(result.clientSecret || '')
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeStripe()
  }, [priceId, customerEmail])

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
