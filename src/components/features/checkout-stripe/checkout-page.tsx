import {getSubscriptionRecapInfo} from '@/components/features/checkout-stripe/actions'
import CheckoutFormEmbedded from '@/components/features/checkout-stripe/embed/checkout-form-embedded'
import {Card} from '@/components/ui/card'

import CheckoutButtonExternal from './external-checkout/checkout-button-external'
import CheckoutPaymentLink from './payment-link/checkout-payment-link'
import CheckoutButtonReactStripe from './react-stripe/checkout-button-react-stripe'
import SubscriptionRecap from './subscription-recap'

// pour les payment avec user (guest=false)
const enableEmbededForm = true
const enableExternalForm = false
const enableCheckoutButtonReactStripe = false

// pour les payment sans user (guest=true)
const enablePaymentLink = true

export default async function CheckoutPage({
  priceId,
  couponId,
  seats = 1,
  guest = false,
}: {
  priceId: string
  couponId: string
  seats: number
  guest: boolean
}) {
  let recapInfo
  try {
    recapInfo = await getSubscriptionRecapInfo(priceId, couponId, seats)
  } catch (error) {
    console.error('Error getting stripe subscription recap:', error)
    recapInfo = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-0 py-4 sm:px-2 md:px-4">
        <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Left side - Subscription Recap */}
          <div className="lg:sticky lg:top-4">
            {recapInfo.success ? (
              <SubscriptionRecap
                planName={recapInfo.recap?.planName}
                price={recapInfo.recap?.price}
                originalPrice={recapInfo.recap?.originalPrice}
                discount={recapInfo.recap?.discount}
                features={recapInfo.recap?.features}
                currency={recapInfo.recap?.currency}
              />
            ) : (
              <div className="text-red-500">
                Error loading subscription details:
              </div>
            )}
            {recapInfo.warning && (
              <div className="text-red-500">Warning: {recapInfo.warning}</div>
            )}
          </div>

          {/* Right side - Checkout Button */}
          <Card className="bg-card text-foreground space-y-6 border-0 p-4 sm:border sm:p-6">
            <div>
              <h2 className="mb-1 text-xl font-bold">Complete your purchase</h2>
              {guest && enablePaymentLink && (
                <>
                  <p className="text-muted-foreground">
                    Please click the button below to complete your purchase
                  </p>
                  <div className="mt-4">
                    <CheckoutPaymentLink priceId={priceId} seats={seats} />
                  </div>
                </>
              )}
              {!guest && enableEmbededForm && (
                <>
                  <p className="text-muted-foreground">
                    Please fill the form below to complete your purchase
                  </p>
                  <div className="mt-4">
                    <CheckoutFormEmbedded priceId={priceId} seats={seats} />
                  </div>
                </>
              )}

              {!guest && enableCheckoutButtonReactStripe && (
                <>
                  <p className="text-muted-foreground">
                    Please click the button below to complete your purchase
                  </p>
                  <div className="mt-4">
                    <CheckoutButtonReactStripe
                      priceId={priceId}
                      seats={seats}
                    />
                  </div>
                </>
              )}
              {!guest && enableExternalForm && (
                <>
                  <p className="text-muted-foreground">
                    Please click the button below to complete your purchase
                  </p>
                  <div className="mt-4">
                    <CheckoutButtonExternal priceId={priceId} seats={seats} />
                  </div>
                </>
              )}
            </div>

            <div className="text-muted-foreground text-center text-sm">
              Your payment is secure and encrypted
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
