import {getTranslations} from 'next-intl/server'

import {PricingCards} from './pricing-cards'

export async function PricingSection({locale}: {locale: string}) {
  const t = await getTranslations({locale, namespace: 'HomePage'})

  const graineFeatures = t.raw('pricing.graine.features') as string[]
  const pousseFeatures = t.raw('pricing.pousse.features') as string[]
  const recolteFeatures = t.raw('pricing.recolte.features') as string[]

  const translations = {
    title: t('pricing.title'),
    subtitle: t('pricing.subtitle'),
    popular: t('pricing.popular'),
    switchFr:
      locale === 'fr' ? 'France (avec API Fiscale)' : 'France (with Tax API)',
    switchIntl:
      locale === 'fr'
        ? 'Belgique / Suisse / Autre'
        : 'Belgium / Switzerland / Other',
    graine: {
      name: t('pricing.graine.name'),
      description: t('pricing.graine.description'),
      price: t('pricing.graine.price'),
      features: graineFeatures,
      cta: t('pricing.graine.cta'),
    },
    pousse: {
      name: t('pricing.pousse.name'),
      description: t('pricing.pousse.description'),
      price: t('pricing.pousse.price'),
      priceSuffix: t('pricing.pousse.priceSuffix'),
      originalPrice: t('pricing.pousse.originalPrice'),
      features: pousseFeatures,
      cta: t('pricing.pousse.cta'),
    },
    recolte: {
      name: t('pricing.recolte.name'),
      description: t('pricing.recolte.description'),
      priceFr: t('pricing.recolte.priceFr'),
      priceIntl: t('pricing.recolte.priceIntl'),
      priceSuffix: t('pricing.recolte.priceSuffix'),
      originalPriceFr: t('pricing.recolte.originalPriceFr'),
      originalPriceIntl: t('pricing.recolte.originalPriceIntl'),
      features: recolteFeatures,
      featureFr: t('pricing.recolte.featureFr'),
      cta: t('pricing.recolte.cta'),
    },
  }

  return (
    <section id="pricing" className="py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="font-heading mb-4 text-3xl font-bold text-stone-900">
            {translations.title}
          </h2>
          <p className="text-stone-600">{translations.subtitle}</p>
        </div>
        <PricingCards translations={translations} />
      </div>
    </section>
  )
}
