import CheckoutPage from '@/components/features/checkout-stripe/checkout-page'

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

  console.log('🔧 checkout as guest', guest)
  console.log('🆕 installments mode', enableInstallments)

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
