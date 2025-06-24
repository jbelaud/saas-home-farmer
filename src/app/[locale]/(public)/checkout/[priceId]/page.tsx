import CheckoutPage from '@/components/features/checkout-stripe/checkout-page'

type PropsParams = {
  params: Promise<{priceId: string}>
  searchParams: Promise<{couponCode: string; seats: number; guest: string}>
}
export default async function Page({params, searchParams}: PropsParams) {
  const paramStore = await params
  const searchParamsStore = await searchParams
  const priceId = paramStore.priceId ?? ''
  const guest = searchParamsStore.guest === 'true'
  console.log('🔧 checkout as guest', guest)
  return (
    <CheckoutPage
      priceId={priceId}
      couponId={searchParamsStore.couponCode}
      seats={searchParamsStore.seats}
      guest={guest}
    />
  )
}
