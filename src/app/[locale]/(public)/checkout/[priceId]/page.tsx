import CheckoutPage from '@/components/features/checkout-stripe/checkout-page'

type PropsParams = {
  params: Promise<{priceId: string}>
  searchParams: Promise<{couponCode: string; seats: number}>
}
export default async function Page({params, searchParams}: PropsParams) {
  const paramStore = await params
  const searchParamsStore = await searchParams
  const priceId = paramStore.priceId ?? ''
  return (
    <CheckoutPage
      priceId={priceId}
      couponId={searchParamsStore.couponCode}
      seats={searchParamsStore.seats}
    />
  )
}
