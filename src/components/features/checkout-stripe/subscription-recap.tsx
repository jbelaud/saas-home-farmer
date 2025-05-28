'use client'

import {Package2Icon} from 'lucide-react'

import {Card} from '@/components/ui/card'
import {ScrollArea} from '@/components/ui/scroll-area'

interface SubscriptionRecapProps {
  planName?: string
  price?: number
  originalPrice?: number
  discount?: number
  features?: string[]
  description?: string
  currency?: string
}

export default function SubscriptionRecap({
  planName = 'CodeMail Pro Bundle',
  price = 197,
  originalPrice = 400,
  discount = 203,
  features = [
    'Introduction Course / Components',
    'PRO: Complete Email Integration Guide',
    'PRO: All CodeMail.io Features Access',
    'PRO: Code Review Sessions',
  ],
  currency = 'eur',
}: SubscriptionRecapProps) {
  // Fonction utilitaire pour formater la devise
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount)
  }

  return (
    <Card className="w-full max-w-md border-zinc-800 bg-zinc-900 text-white">
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="rounded-lg bg-zinc-800 p-2">
            <Package2Icon className="h-6 w-6 text-yellow-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{planName}</h2>
            <p className="text-zinc-400">Lifetime Access</p>
          </div>
        </div>

        {/* Features */}
        <ScrollArea className="h-[200px] pr-4">
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                <p className="text-zinc-300">{feature}</p>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Price Breakdown */}
        <div className="space-y-3 border-t border-zinc-800 pt-4">
          <div className="flex justify-between">
            <span className="text-zinc-400">Subtotal:</span>
            <span className="text-zinc-300">
              {formatCurrency(originalPrice)}
            </span>
          </div>
          <div className="flex justify-between text-yellow-400">
            <span>Discount:</span>
            <span>-{formatCurrency(discount)}</span>
          </div>
          <div className="flex justify-between border-t border-zinc-800 pt-2 text-lg font-bold">
            <span>Total</span>
            <span>{formatCurrency(price)}</span>
          </div>
        </div>

        {/* Payment Options */}
        <div className="text-center text-sm text-zinc-400">
          You can pay in 3 or 2 installments
        </div>
      </div>
    </Card>
  )
}
