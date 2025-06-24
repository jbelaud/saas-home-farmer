'use client'

import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import {loadStripe, Stripe} from '@stripe/stripe-js'
import React, {useEffect, useState} from 'react'
import {toast} from 'sonner'

import {Button} from '@/components/ui/button'

import {createCheckoutSession} from './actions'

type CheckoutButtonProps = {
  priceId: string
  variant?: 'default' | 'secondary' | 'outline'
  seats: number
}
//Numéro : 4242 4242 4242 4242
// Composant pour le formulaire de configuration du mode de paiement
function CheckoutForm() {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)

    const {error} = await stripe.confirmSetup({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
    })

    if (error) {
      toast.error('Échec de la configuration', {
        description:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de la configuration de l'abonnement",
      })
    }

    setIsProcessing(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="mt-4 w-full"
      >
        {isProcessing ? 'Configuration en cours...' : "Configurer l'abonnement"}
      </Button>
    </form>
  )
}

export default function CheckoutButtonReactStripe({
  priceId,
  variant = 'default',
  seats = 1,
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const [stripe, setStripe] = useState<Stripe | null>(null)
  const [clientSecret, setClientSecret] = useState('')

  useEffect(() => {
    // eslint-disable-next-line promise/catch-or-return
    loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string).then(
      setStripe
    )
  }, [])

  const handleCheckout = async () => {
    setIsLoading(true)
    try {
      const result = await createCheckoutSession(priceId, seats)
      if (!result.success) throw new Error(result.error)
      setClientSecret(result.clientSecret || '')
    } catch (error) {
      console.error("Erreur lors de la création de l'abonnement:", error)
      toast.error(
        "Une erreur est survenue lors de la création de l'abonnement",
        {
          description:
            error instanceof Error
              ? error.message
              : "Une erreur est survenue lors de la création de l'abonnement",
        }
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <Button
        onClick={handleCheckout}
        disabled={isLoading}
        variant={variant}
        className='disabled:opacity-50" w-full rounded-lg bg-yellow-400 px-4 py-2.5 font-medium text-black transition-colors hover:bg-yellow-500'
      >
        {isLoading ? "Création de l'abonnement..." : "S'abonner avec Stripe"}
      </Button>

      {clientSecret && stripe && (
        <Elements stripe={stripe} options={{clientSecret}}>
          <div className="mt-4">
            <CheckoutForm />
          </div>
        </Elements>
      )}
    </div>
  )
}
