import {
  priceLifetime,
  priceProMonthly,
  priceProYearly,
} from '@/app/dal/stripe-dal'
import {getActiveSubscriptionsDal} from '@/app/dal/subscription-dal'
import PricingPlans from '@/components/features/payment/pricing'
import {getAuthUser} from '@/services/authentication/auth-service'

export default async function Page() {
  const user = await getAuthUser()
  const userSubscriptions = user ? await getActiveSubscriptionsDal() : []
  return (
    <PricingPlans
      subscriptions={userSubscriptions}
      priceProMonthly={priceProMonthly.recap}
      priceProYearly={priceProYearly.recap}
      priceLifetime={priceLifetime.recap}
    />
  )
}
