import {Crown, Sprout, Zap} from 'lucide-react'
import {notFound} from 'next/navigation'

import {
  getGrainePlan,
  getPoussePlan,
  getRecolteFrPlan,
} from '@/app/dal/subscription-dal'
import {PagesConst} from '@/env'
import {isPageEnabled} from '@/lib/utils'

import SubscriptionPage from './subscription'

export default async function Page() {
  if (!isPageEnabled(PagesConst.SUBSCRIPTION)) {
    return notFound()
  }

  const [planGraine, planPousse, planRecolte] = await Promise.all([
    getGrainePlan(),
    getPoussePlan(),
    getRecolteFrPlan(),
  ])

  if (!planGraine || !planPousse || !planRecolte) {
    throw new Error('Impossible de charger les plans')
  }

  const availablePlans = [
    {
      id: planGraine.code,
      name: 'Découverte',
      price: planGraine.price ? parseFloat(planGraine.price) : null,
      yearlyPrice: planGraine.yearlyPrice
        ? parseFloat(planGraine.yearlyPrice)
        : 0,
      priceDisplay: '0€/mois',
      yearlyPriceDisplay: '0€/an',
      description: 'Testez gratuitement avec 1 client',
      features: planGraine.features as string[],
      icon: <Sprout className="h-5 w-5" />,
      color: 'bg-stone-500',
      popular: false,
    },
    {
      id: planPousse.code,
      name: 'Essentiel',
      price: planPousse.price ? parseFloat(planPousse.price) : null,
      yearlyPrice: planPousse.yearlyPrice
        ? parseFloat(planPousse.yearlyPrice)
        : 0,
      priceDisplay: '9€/mois',
      yearlyPriceDisplay: '90€/an (2 mois offerts)',
      description: "Jusqu'à 20 clients",
      features: planPousse.features as string[],
      icon: <Zap className="h-5 w-5" />,
      color: 'bg-emerald-500',
      popular: true,
    },
    {
      id: planRecolte.code,
      name: 'Entreprise',
      price: planRecolte.price ? parseFloat(planRecolte.price) : null,
      yearlyPrice: planRecolte.yearlyPrice
        ? parseFloat(planRecolte.yearlyPrice)
        : 0,
      priceDisplay: '29€/mois',
      yearlyPriceDisplay: '290€/an (2 mois offerts)',
      description: 'Clients illimités + Module SAP',
      features: planRecolte.features as string[],
      icon: <Crown className="h-5 w-5" />,
      color: 'bg-amber-500',
      popular: false,
    },
  ]

  return <SubscriptionPage availablePlans={availablePlans} />
}
