import {getSubscriptionRecapInfo} from '@/components/features/checkout-stripe/actions'
import {env} from '@/env'

import CheckoutBetterAuth from './checkout-better-auth'

export default async function Page() {
  // permet un gestion dynamique des prix (si modifié coté dashboard stripe)
  const [proMonthlyResult, proYearlyResult, lifetimeResult] = await Promise.all(
    [
      getSubscriptionRecapInfo(
        env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY,
        undefined,
        1
      ),
      getSubscriptionRecapInfo(
        env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_YEARLY,
        undefined,
        1
      ),
      getSubscriptionRecapInfo(
        env.NEXT_PUBLIC_STRIPE_PRICE_ID_LIFETIME,
        undefined,
        1
      ),
    ]
  )

  const initialPriceRecaps = {
    proMonthly: proMonthlyResult.recap,
    proYearly: proYearlyResult.recap,
    lifetime: lifetimeResult.recap,
  }

  return <CheckoutBetterAuth initialPriceRecaps={initialPriceRecaps} />
}
