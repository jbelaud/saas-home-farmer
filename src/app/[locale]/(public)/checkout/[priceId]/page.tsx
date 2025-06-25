import CheckoutPage from '@/components/features/checkout-stripe/checkout-page'
import {logger} from '@/lib/logger'

type PropsParams = {
  params: Promise<{priceId: string}>
  searchParams: Promise<{
    couponCode: string
    seats: number
    guest: string
    split?: string
  }>
}

export default async function Page({params, searchParams}: PropsParams) {
  const paramStore = await params
  const searchParamsStore = await searchParams
  const priceId = paramStore.priceId ?? ''
  const guest = searchParamsStore.guest === 'true'
  const enableInstallments = searchParamsStore.split === 'true'

  logger.info('🔧 [CHECKOUT] checkout as guest', guest)
  logger.info('🔧 [CHECKOUT] installments mode', enableInstallments)
  logger.info('🔧 [CHECKOUT] priceId', priceId)
  logger.info('🔧 [CHECKOUT] couponCode', searchParamsStore.couponCode)
  logger.info('🔧 [CHECKOUT] seats', searchParamsStore.seats)

  return (
    <CheckoutPage
      priceId={priceId}
      couponId={searchParamsStore.couponCode}
      seats={searchParamsStore.seats}
      guest={guest}
      enableInstallments={enableInstallments}
    />
  )
}
