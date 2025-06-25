'use client'

import {CreditCard} from 'lucide-react'
import {useState} from 'react'
import {toast} from 'sonner'

import {Button} from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import {PriceRecap} from '../actions'
import CheckoutFormEmbedded from '../embed/checkout-form-embedded'
import {createInstallmentCheckoutSession} from './action'
import InstallmentSelector from './installment-selector'
import {InstallmentType} from './types'

interface CheckoutInstallmentProps {
  priceId: string
  seats: number
  recap: PriceRecap
  isRecurring: boolean
}

export default function CheckoutInstallment({
  priceId,
  seats,
  recap,
  isRecurring,
}: CheckoutInstallmentProps) {
  const [selectedInstallmentType, setSelectedInstallmentType] =
    useState<InstallmentType>(InstallmentType.FULL_PAYMENT)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleInstallmentCheckout = async () => {
    if (selectedInstallmentType === InstallmentType.FULL_PAYMENT) {
      // Ne rien faire, le checkout classique gérera
      return
    }

    try {
      setIsProcessing(true)

      const result = await createInstallmentCheckoutSession(
        priceId,
        selectedInstallmentType,
        seats
      )

      if (result.success && result.sessionUrl) {
        toast.success('Redirection vers le paiement en cours...')
        // Rediriger vers la session Stripe
        window.location.href = result.sessionUrl
      } else {
        toast.error(
          result.error || 'Erreur lors de la création de la session de paiement'
        )
      }
    } catch (error) {
      console.error('Erreur checkout échéancier:', error)
      toast.error('Une erreur inattendue est survenue')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Sélecteur d'échéanciers - uniquement pour les paiements uniques */}
      {!isRecurring && (
        <InstallmentSelector
          totalAmount={recap.price * 100} // Convertir en centimes
          currency={recap.currency}
          onInstallmentTypeChange={setSelectedInstallmentType}
          selectedInstallmentType={selectedInstallmentType}
          isRecurring={isRecurring}
        />
      )}

      {/* Formulaire de checkout */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            <CardTitle>Finaliser votre commande</CardTitle>
          </div>
          <CardDescription>
            {selectedInstallmentType === InstallmentType.FULL_PAYMENT
              ? 'Paiement sécurisé par Stripe'
              : `Paiement en ${selectedInstallmentType.replace('_', ' ').toLowerCase()}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedInstallmentType === InstallmentType.FULL_PAYMENT ? (
            // Checkout classique pour paiement unique
            <CheckoutFormEmbedded priceId={priceId} seats={seats} />
          ) : (
            // Bouton pour démarrer le processus d'échéanciers
            <div className="space-y-4">
              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/20">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  🔄 <strong>Paiement échelonné</strong>
                  <br />
                  Votre premier paiement sera débité aujourd&apos;hui, puis les
                  paiements suivants seront automatiquement prélevés chaque
                  mois.
                </p>
              </div>

              <Button
                onClick={handleInstallmentCheckout}
                disabled={isProcessing}
                className="w-full"
                size="lg"
              >
                {isProcessing
                  ? 'Préparation du paiement...'
                  : `Commencer le paiement en ${selectedInstallmentType.split('_')[0]} fois`}
              </Button>

              <p className="text-muted-foreground text-center text-xs">
                En cliquant, vous acceptez que vos prochains paiements soient
                automatiquement débités selon l&apos;échéancier choisi.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {isRecurring && (
        <Card className="bg-blue-50 p-4 dark:bg-blue-950/20">
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p className="font-medium">📅 Abonnement récurrent</p>
            <p>
              Ce plan sera renouvelé automatiquement chaque{' '}
              {recap.interval === 'year' ? 'année' : 'mois'}.
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
