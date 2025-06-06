import {
  priceLifetime,
  priceProMonthly,
  priceProYearly,
} from '@/app/dal/stripe-dal'
import {getActiveSubscriptionsByEmailDal} from '@/app/dal/user-dal'
import PricingPlans from '@/components/features/payment/pricing'
import {getAuthUser} from '@/services/authentication/auth-service'

export default async function Page() {
  const user = await getAuthUser()

  //const subscription = await getSubscriptionDal(user?.id)
  const userSubscriptions = user
    ? await getActiveSubscriptionsByEmailDal(user?.email)
    : []
  return (
    <>
      <PricingPlans
        subscriptions={userSubscriptions}
        priceProMonthly={priceProMonthly.recap}
        priceProYearly={priceProYearly.recap}
        priceLifetime={priceLifetime.recap}
      />
    </>
  )
}
