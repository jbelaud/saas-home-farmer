import {getUserDal} from '@/app/dal/user-dal'
import {getSubscriptionRecapInfo} from '@/components/features/checkout-stripe/actions'
import CheckoutButtonEmbed from '@/components/features/checkout-stripe/embed/checkout-button-embed'
import {Card} from '@/components/ui/card'

import SubscriptionRecap from './subscription-recap'

export default async function CheckoutPage({
  priceId,
  couponId,
}: {
  priceId: string
  couponId: string
}) {
  const recapInfo = await getSubscriptionRecapInfo(priceId, couponId)
  const user = await getUserDal()
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
              Error loading subscription details: {recapInfo.error}
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
            <p className="text-muted-foreground">
              Click the button below to proceed to secure checkout
            </p>
          </div>
          <CheckoutButtonEmbed
            priceId={priceId}
            customerEmail={user?.email || ''}
          />
          {/* <CheckoutButtonReactStripe priceId={priceId} />
          <CheckoutButtonLink priceId={priceId} /> */}

          <div className="text-muted-foreground text-center text-sm">
            Your payment is secure and encrypted
          </div>
        </Card>
      </div>
    </div>
  )
}
