import {Crown, Sprout, Zap} from 'lucide-react'
import {notFound} from 'next/navigation'

import {
  getGrainePlan,
  getPoussePlan,
  getRecolteFrPlan,
} from '@/app/dal/subscription-dal'
import {PagesConst} from '@/env'
import {
  formatPrice,
  getPricingByCountry,
  getYearlySavings,
} from '@/lib/helpers/pricing-helper'
import {isPageEnabled} from '@/lib/utils'
import {getActiveOrganizationId} from '@/services/authentication/auth-service'
import {getFarmerProfileByOrganizationIdService} from '@/services/facades/farmer-service-facade'

import SubscriptionPage from './subscription'

export default async function Page() {
  if (!isPageEnabled(PagesConst.SUBSCRIPTION)) {
    return notFound()
  }

  // Récupérer l'organisation active
  const organizationId = await getActiveOrganizationId()

  const [planGraine, planPousse, planRecolte, farmerProfile] =
    await Promise.all([
      getGrainePlan(),
      getPoussePlan(),
      getRecolteFrPlan(),
      // Récupérer le profil du farmer pour connaître son pays
      organizationId
        ? getFarmerProfileByOrganizationIdService(organizationId)
        : Promise.resolve(undefined),
    ])

  // Récupérer les tarifs selon le pays
  const pricing = getPricingByCountry(farmerProfile?.country || 'FR')

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
      priceDisplay: formatPrice(pricing.discovery.monthly),
      yearlyPriceDisplay: formatPrice(pricing.discovery.yearly, true),
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
      priceDisplay: formatPrice(pricing.essential.monthly),
      yearlyPriceDisplay: `${formatPrice(pricing.essential.yearly, true)} (${getYearlySavings(pricing.essential.monthly)})`,
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
      priceDisplay: formatPrice(pricing.enterprise.monthly),
      yearlyPriceDisplay: `${formatPrice(pricing.enterprise.yearly, true)} (${getYearlySavings(pricing.enterprise.monthly)})`,
      description:
        farmerProfile?.country === 'FR'
          ? 'Clients illimités + Module SAP'
          : 'Clients illimités',
      features: planRecolte.features as string[],
      icon: <Crown className="h-5 w-5" />,
      color: 'bg-amber-500',
      popular: false,
    },
  ]

  return <SubscriptionPage availablePlans={availablePlans} />
}
