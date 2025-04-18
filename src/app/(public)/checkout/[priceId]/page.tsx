import CheckoutPage from '@/components/features/checkout-stripe/checkout-page'
console.log('ENV check:', {
  hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
  keyLength: process.env.STRIPE_SECRET_KEY?.length,
})
type PropsParams = {
  params: Promise<{priceId: string}>
  searchParams: Promise<{couponCode: string}>
}
export default async function Page({params, searchParams}: PropsParams) {
  const paramStore = await params
  const searchParamsStore = await searchParams
  const priceId = paramStore.priceId ?? ''
  return (
    <CheckoutPage priceId={priceId} couponId={searchParamsStore.couponCode} />
  )
}
