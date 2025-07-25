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
  guest: boolean
}

if (!env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error(
    "La clé Stripe publishable est manquante. Vérifiez vos variables d'environnement."
  )
}

export default function StripeFormEmbedded({
  priceId,
  seats = 1,
  guest = false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  variant = 'default',
}: CheckoutButtonProps) {
  const [, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false) // 🛡️ Flag pour éviter double init

  const [stripe, setStripe] = useState<Stripe | null>(null)
  const [clientSecret, setClientSecret] = useState('')

  useEffect(() => {
    // 🛡️ Protection contre double appel
    if (isInitialized) return

    let isSubscribed = true // 🛡️ Cleanup flag

    const initializeStripe = async () => {
      try {
        console.log('🔧 [CHECKOUT-FORM] Initialisation Stripe démarrée')

        const stripeInstance = await loadStripe(
          env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
        )

        if (!isSubscribed) return // 🛡️ Abandon si nettoyé
        setStripe(stripeInstance)

        const result = await createEmbededCheckoutSession(priceId, seats, guest)
        if (!result.success) throw new Error(result.error)

        if (!isSubscribed) return // 🛡️ Abandon si nettoyé
        setClientSecret(result.clientSecret || '')
        setIsInitialized(true)

        console.log('✅ [CHECKOUT-FORM] Initialisation Stripe terminée')
      } catch (error) {
        console.error('Error:', error)
        if (isSubscribed) {
          toast.error('Error', {
            description:
              error instanceof Error ? error.message : 'Something went wrong',
          })
        }
      } finally {
        if (isSubscribed) {
          setIsLoading(false)
        }
      }
    }

    initializeStripe()

    // 🛡️ Cleanup function
    return () => {
      isSubscribed = false
    }
  }, [priceId, seats, guest, isInitialized])

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
