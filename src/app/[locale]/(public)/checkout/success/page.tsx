'use client'

import {CheckCircle2} from 'lucide-react'
import Link from 'next/link'
import {useSearchParams} from 'next/navigation'
import {useEffect, useState} from 'react'

import {Button} from '@/components/ui/button'

export default function SuccessPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  )
  const searchParams = useSearchParams()
  const paymentIntent = searchParams.get('payment_intent')
  const redirectStatus = searchParams.get('redirect_status')

  useEffect(() => {
    if (redirectStatus === 'succeeded') {
      setStatus('success')
    } else {
      setStatus('error')
    }
  }, [redirectStatus])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-yellow-400">⚪</div>
          <p className="mt-2 text-zinc-400">Verifying your payment...</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-red-500">❌</div>
          <h1 className="mt-4 text-2xl font-bold">Payment Failed</h1>
          <p className="mt-2 text-zinc-400">
            Something went wrong with your payment.
          </p>
          <Button asChild className="mt-4">
            <Link href="/">Try Again</Link>
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
        <h1 className="mt-4 text-2xl font-bold">Payment Successful!</h1>
        <p className="mt-2 text-zinc-400">
          Thank you for your purchase. Your payment has been processed
          successfully.
        </p>
        {paymentIntent && (
          <div className="mt-4 rounded border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-sm text-zinc-400">Payment ID:</p>
            <p className="mt-1 font-mono text-sm text-zinc-300">
              {paymentIntent}
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
