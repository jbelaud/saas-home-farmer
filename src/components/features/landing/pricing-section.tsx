import {Check} from 'lucide-react'
import Link from 'next/link'
import {useTranslations} from 'next-intl'

import {Button} from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function PricingSection() {
  const t = useTranslations('HomePage')

  const plans = [
    {
      key: 'graine' as const,
      popular: false,
      ctaVariant: 'outline' as const,
    },
    {
      key: 'pousse' as const,
      popular: true,
      ctaVariant: 'default' as const,
    },
    {
      key: 'recolte' as const,
      popular: false,
      ctaVariant: 'outline' as const,
    },
  ]

  return (
    <section id="pricing" className="py-20">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="font-heading mb-4 text-3xl font-bold text-stone-900">
            {t('pricing.title')}
          </h2>
          <p className="text-stone-600">{t('pricing.subtitle')}</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
          {plans.map(({key, popular, ctaVariant}) => {
            const features = t.raw(`pricing.${key}.features`) as string[]
            const price = t(`pricing.${key}.price`)
            const priceSuffix =
              key !== 'graine' ? t(`pricing.${key}.priceSuffix`) : undefined
            const originalPrice =
              key !== 'graine' ? t(`pricing.${key}.originalPrice`) : undefined

            return (
              <Card
                key={key}
                className={`relative flex flex-col ${
                  popular
                    ? 'border-primary bg-stone-50 shadow-lg'
                    : 'border-stone-200'
                }`}
              >
                {popular && (
                  <div className="bg-primary absolute -top-4 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-bold text-white">
                    {t('pricing.popular')}
                  </div>
                )}
                <CardHeader>
                  <CardTitle
                    className={`font-heading text-2xl ${popular ? 'text-primary' : ''}`}
                  >
                    {t(`pricing.${key}.name`)}
                  </CardTitle>
                  <CardDescription>
                    {t(`pricing.${key}.description`)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-stone-900">
                      {price}
                    </span>
                    {priceSuffix && (
                      <span className="text-stone-500">{priceSuffix}</span>
                    )}
                  </div>
                  {originalPrice && (
                    <p className="mb-6 text-xs text-stone-500 line-through">
                      {originalPrice}
                    </p>
                  )}
                  <ul className="space-y-3 text-sm text-stone-600">
                    {features.map((feature) => (
                      <li key={feature} className="flex gap-2">
                        <Check className="text-primary h-5 w-5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant={ctaVariant} className="w-full" asChild>
                    <Link href="/register">{t(`pricing.${key}.cta`)}</Link>
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
