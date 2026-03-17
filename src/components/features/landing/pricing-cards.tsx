'use client'

import {Check, MapPin} from 'lucide-react'
import Link from 'next/link'
import {useState} from 'react'

import {Button} from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type PricingTranslations = {
  title: string
  subtitle: string
  popular: string
  switchFr: string
  switchIntl: string
  graine: {
    name: string
    description: string
    price: string
    features: string[]
    cta: string
  }
  pousse: {
    name: string
    description: string
    price: string
    priceSuffix: string
    originalPrice: string
    features: string[]
    cta: string
  }
  recolte: {
    name: string
    description: string
    priceFr: string
    priceIntl: string
    priceSuffix: string
    originalPriceFr: string
    originalPriceIntl: string
    features: string[]
    featureFr: string
    cta: string
  }
}

export function PricingCards({
  translations: tr,
}: {
  translations: PricingTranslations
}) {
  const [isFr, setIsFr] = useState(true)

  const recoltePrice = isFr ? tr.recolte.priceFr : tr.recolte.priceIntl
  const recolteOriginalPrice = isFr
    ? tr.recolte.originalPriceFr
    : tr.recolte.originalPriceIntl
  const recolteFeatures = isFr
    ? [tr.recolte.featureFr, ...tr.recolte.features]
    : tr.recolte.features

  return (
    <div className="space-y-8">
      {/* Switch FR / non-FR */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-stone-100 p-1">
          <button
            onClick={() => setIsFr(true)}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
              isFr
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            <MapPin className="h-3.5 w-3.5" />
            {tr.switchFr}
          </button>
          <button
            onClick={() => setIsFr(false)}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
              !isFr
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            <MapPin className="h-3.5 w-3.5" />
            {tr.switchIntl}
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
        {/* Graine */}
        <Card className="relative flex flex-col border-stone-200">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">
              {tr.graine.name}
            </CardTitle>
            <CardDescription>{tr.graine.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="mb-6">
              <span className="text-4xl font-bold text-stone-900">
                {tr.graine.price}
              </span>
            </div>
            <ul className="space-y-3 text-sm text-stone-600">
              {tr.graine.features.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <Check className="text-primary h-5 w-5 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/register">{tr.graine.cta}</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Pousse */}
        <Card className="border-primary relative flex flex-col bg-stone-50 shadow-lg">
          <div className="bg-primary absolute -top-4 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-bold text-white">
            {tr.popular}
          </div>
          <CardHeader>
            <CardTitle className="text-primary font-heading text-2xl">
              {tr.pousse.name}
            </CardTitle>
            <CardDescription>{tr.pousse.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="mb-1">
              <span className="text-4xl font-bold text-stone-900">
                {tr.pousse.price}
              </span>
              <span className="text-stone-500">{tr.pousse.priceSuffix}</span>
            </div>
            <p className="mb-6 text-xs text-stone-400 line-through">
              {tr.pousse.originalPrice}
            </p>
            <ul className="space-y-3 text-sm text-stone-600">
              {tr.pousse.features.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <Check className="text-primary h-5 w-5 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href="/register">{tr.pousse.cta}</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Récolte */}
        <Card className="relative flex flex-col border-stone-200">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">
              {tr.recolte.name}
            </CardTitle>
            <CardDescription>{tr.recolte.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="mb-1">
              <span className="text-4xl font-bold text-stone-900">
                {recoltePrice}
              </span>
              <span className="text-stone-500">{tr.recolte.priceSuffix}</span>
            </div>
            <p className="mb-6 text-xs text-stone-400 line-through">
              {recolteOriginalPrice}
            </p>
            <ul className="space-y-3 text-sm text-stone-600">
              {recolteFeatures.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <Check
                    className={`h-5 w-5 flex-shrink-0 ${
                      feature === tr.recolte.featureFr
                        ? 'text-amber-500'
                        : 'text-primary'
                    }`}
                  />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/register">{tr.recolte.cta}</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
