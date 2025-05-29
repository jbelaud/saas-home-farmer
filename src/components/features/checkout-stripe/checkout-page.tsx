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
    <div className="min-h-screen bg-black p-4">
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
        <Card className="space-y-6 border-zinc-800 bg-zinc-900 p-6 text-white">
          <div>
            <h2 className="mb-1 text-xl font-bold">Complete your purchase</h2>
            <p className="text-zinc-400">
              Click the button below to proceed to secure checkout
            </p>
          </div>
          <CheckoutButtonEmbed
            priceId={priceId}
            customerEmail={user?.email || ''}
          />
          {/* <CheckoutButtonReactStripe priceId={priceId} />
          <CheckoutButtonLink priceId={priceId} /> */}

          <div className="text-center text-sm text-zinc-400">
            Your payment is secure and encrypted
          </div>
        </Card>
      </div>
    </div>
  )
}
