import {Country} from '@/services/types/domain/farmer-types'

/**
 * Tarifs par défaut (France avec API Urssaf)
 */
const DEFAULT_PRICING = {
  discovery: {monthly: 0, yearly: 0},
  essential: {monthly: 9, yearly: 90},
  enterprise: {monthly: 29, yearly: 290},
}

/**
 * Tarifs pour la Belgique et Suisse (pas d'API Urssaf)
 */
const BE_CH_PRICING = {
  discovery: {monthly: 0, yearly: 0},
  essential: {monthly: 9, yearly: 90},
  enterprise: {monthly: 19, yearly: 190},
}

/**
 * Tarifs pour "Autre" (même logique que BE/CH)
 */
const OTHER_PRICING = BE_CH_PRICING

/**
 * Récupère les tarifs selon le pays de l'utilisateur
 */
export function getPricingByCountry(country: Country) {
  switch (country) {
    case 'FR':
      return DEFAULT_PRICING
    case 'BE':
    case 'CH':
      return BE_CH_PRICING
    case 'OTHER':
      return OTHER_PRICING
    default:
      return DEFAULT_PRICING
  }
}

/**
 * Calcule le prix affiché selon le mode de facturation (mensuel/annuel)
 */
export function calculatePrice(
  basePrice: number,
  isYearly: boolean,
  discountPercent: number = 0
): number {
  if (isYearly) {
    // Appliquer une réduction de 2 mois gratuits (17% de réduction)
    const monthlyEquivalent = basePrice * 12
    const discountedPrice = monthlyEquivalent * (1 - discountPercent / 100)
    return Math.round(discountedPrice)
  }
  return basePrice
}

/**
 * Formate le prix pour l'affichage
 */
export function formatPrice(price: number, isYearly: boolean = false): string {
  if (price === 0) return '0€'
  return `€${price}/${isYearly ? 'an' : 'mois'}`
}

/**
 * Calcule l'affichage de la réduction annuelle
 */
export function getYearlySavings(basePrice: number): string {
  const monthlyEquivalent = basePrice * 12
  const yearlyPrice = calculatePrice(basePrice, true, 17) // 17% = 2 mois gratuits
  const savings = monthlyEquivalent - yearlyPrice
  return `✨ ${Math.round(savings / 12)} mois gratuits`
}
