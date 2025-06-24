import {getSubscriptionRecapInfo} from '@/components/features/checkout-stripe/actions'
import CheckoutFormEmbedded from '@/components/features/checkout-stripe/embed/checkout-form-embedded'
import {Card} from '@/components/ui/card'

import CheckoutButtonLink from './payment-link/checkout-button-link'
import CheckoutButtonReactStripe from './react-stripe/checkout-button-react-stripe'
import SubscriptionRecap from './subscription-recap'

const enableEmbededForm = true
const enableCheckoutButtonExternalLink = false
const enableCheckoutButtonReactStripe = false

export default async function CheckoutPage({
  priceId,
  couponId,
  seats = 1,
}: {
  priceId: string
  couponId: string
  seats: number
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
    <div className="bg-background min-h-screen p-4">
      <div className="mx-auto grid max-w-6xl items-start gap-8 lg:grid-cols-2">
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
        <Card className="border-border bg-card text-foreground space-y-6 p-6">
          <div>
            <h2 className="mb-1 text-xl font-bold">Complete your purchase</h2>
            {enableEmbededForm && (
              <>
                <p className="text-muted-foreground">
                  Please fill the form below to complete your purchase
                </p>
                <div className="mt-4">
                  <CheckoutFormEmbedded priceId={priceId} seats={seats} />
                </div>
              </>
            )}
            {enableCheckoutButtonExternalLink && (
              <>
                <p className="text-muted-foreground">
                  Please click the button below to complete your purchase
                </p>
                <div className="mt-4">
                  <CheckoutButtonLink priceId={priceId} seats={seats} />
                </div>
              </>
            )}
            {enableCheckoutButtonReactStripe && (
              <>
                <p className="text-muted-foreground">
                  Please click the button below to complete your purchase
                </p>
                <div className="mt-4">
                  <CheckoutButtonReactStripe priceId={priceId} />
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
  )
}
