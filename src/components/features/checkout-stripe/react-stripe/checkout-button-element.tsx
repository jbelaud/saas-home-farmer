'use client'

import React, {useState, useEffect} from 'react'
import {Button} from '@/components/ui/button'
import {createCheckoutSession} from './actions'
import {toast} from '@/hooks/use-toast'
import {loadStripe, Stripe} from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'

type CheckoutButtonProps = {
  priceId: string
  variant?: 'default' | 'secondary' | 'outline'
}
//Numéro : 4242 4242 4242 4242
// Composant pour le formulaire de paiement
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

    const {error} = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/success`,
      },
    })

    if (error) {
      toast({
        title: 'Payment failed',
        description: error.message,
        variant: 'destructive',
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
        {isProcessing ? 'Processing...' : 'Pay now'}
      </Button>
    </form>
  )
}

export default function CheckoutButtonReactStripe({
  priceId,
  variant = 'default',
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
      const result = await createCheckoutSession(priceId)
      if (!result.success) throw new Error(result.error)
      setClientSecret(result.clientSecret || '')
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      })
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
        {isLoading ? 'Processing...' : 'Checkout React Stripe'}
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
