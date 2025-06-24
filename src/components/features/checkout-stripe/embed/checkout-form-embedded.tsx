'use client'
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js'
import {loadStripe, Stripe} from '@stripe/stripe-js'
import React, {useEffect, useState} from 'react'
import {toast} from 'sonner'

import {env} from '@/env'

import {createEmbededCheckoutSession} from './action'

type CheckoutButtonProps = {
  priceId: string
  variant?: 'default' | 'secondary' | 'outline'
  seats: number
}

if (!env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error(
    "La clé Stripe publishable est manquante. Vérifiez vos variables d'environnement."
  )
}

export default function StripeFormEmbedded({
  priceId,
  seats = 1,
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

        const result = await createEmbededCheckoutSession(priceId, seats)
        if (!result.success) throw new Error(result.error)
        setClientSecret(result.clientSecret || '')
      } catch (error) {
        console.error('Error:', error)
        toast.error('Error', {
          description:
            error instanceof Error ? error.message : 'Something went wrong',
        })
      } finally {
        setIsLoading(false)
      }
    }

    initializeStripe()
  }, [priceId, seats])

  const options = {
    clientSecret,
    //  appearance,
    // Customize the appearance of the embedded checkout
    // Refer to the Stripe documentation for more details
  }

  return (
    <EmbeddedCheckoutProvider stripe={stripe} options={options}>
      <EmbeddedCheckout />
    </EmbeddedCheckoutProvider>
  )
}
