'use client'

import {CheckCircle2} from 'lucide-react'
import Link from 'next/link'
import {useSearchParams} from 'next/navigation'
import {useEffect, useState} from 'react'

import {confirmSubscription} from '@/components/features/checkout-stripe/react-stripe/actions'
import {Button} from '@/components/ui/button'

export default function SuccessPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  )
  const [message, setMessage] = useState('Vérification de votre paiement...')
  const searchParams = useSearchParams()

  // Gestion des différents types de paiement
  const paymentIntent = searchParams.get('payment_intent')
  const setupIntent = searchParams.get('setup_intent')
  const redirectStatus = searchParams.get('redirect_status')

  useEffect(() => {
    const handlePaymentVerification = async () => {
      if (redirectStatus === 'succeeded') {
        // Si c'est un setup intent (abonnement), finaliser l'abonnement
        if (setupIntent) {
          try {
            setMessage('Création de votre abonnement en cours...')
            const result = await confirmSubscription(setupIntent)

            if (result.success) {
              setStatus('success')
              setMessage('Votre abonnement a été créé avec succès !')
            } else {
              setStatus('error')
              setMessage(
                result.error || "Erreur lors de la création de l'abonnement"
              )
            }
          } catch {
            setStatus('error')
            setMessage("Erreur inattendue lors de la création de l'abonnement")
          }
        } else {
          // Paiement unique classique
          setStatus('success')
          setMessage('Votre paiement a été traité avec succès !')
        }
      } else {
        setStatus('error')
        setMessage('Le paiement a échoué ou a été annulé')
      }
    }

    handlePaymentVerification()
  }, [redirectStatus, setupIntent])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-yellow-400">⚪</div>
          <p className="mt-2 text-zinc-400">{message}</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-red-500">❌</div>
          <h1 className="mt-4 text-2xl font-bold">Échec du paiement</h1>
          <p className="mt-2 text-zinc-400">{message}</p>
          <Button asChild className="mt-4">
            <Link href="/pricing">Réessayer</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-900 p-8 text-center text-white">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
        </div>
        <h1 className="mt-4 text-2xl font-bold">
          {setupIntent ? 'Abonnement créé !' : 'Paiement réussi !'}
        </h1>
        <p className="mt-2 text-zinc-400">{message}</p>

        {(paymentIntent || setupIntent) && (
          <div className="mt-4 rounded border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-sm text-zinc-400">
              {setupIntent ? 'Setup Intent ID:' : 'Payment ID:'}
            </p>
            <p className="mt-1 font-mono text-sm text-zinc-300">
              {setupIntent || paymentIntent}
            </p>
          </div>
        )}

        <div className="mt-6 space-y-3">
          <Button asChild className="w-full">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
