'use server'

import {headers} from 'next/headers'

import {logger} from '@/lib/logger'
import {getPlanByPriceId, stripeClient} from '@/lib/stripe/stripe-utils'
import {getAuthUser} from '@/services/authentication/auth-service'

import {createInstallmentSubscriptionSchedule} from './stripe-utils'
// Import des types locaux du dossier installments
import {InstallmentPlan, InstallmentPlans, InstallmentType} from './types'

export type InstallmentCheckoutResult = {
  success: boolean
  sessionUrl?: string
  sessionId?: string
  clientSecret?: string
  installmentPlan?: InstallmentPlan
  scheduleId?: string
  error?: string
}

export async function createInstallmentCheckoutSession(
  priceId: string,
  installmentType: InstallmentType,
  seats: number = 1,
  guest: boolean = false
): Promise<InstallmentCheckoutResult> {
  logger.info(
    '[INSTALLMENT-CHECKOUT] Création session checkout par échéances démarrée'
  )
  logger.debug('[INSTALLMENT-CHECKOUT] Paramètres reçus:', {
    priceId,
    installmentType,
    seats,
    guest,
  })

  try {
    // Récupérer l'utilisateur connecté (optionnel si guest)
    const user = await getAuthUser()
    logger.debug('[INSTALLMENT-CHECKOUT] Utilisateur récupéré:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
    })

    // Vérifier si le checkout est possible selon le contexte
    if (!guest && !user) {
      logger.error(
        '[INSTALLMENT-CHECKOUT] ❌ Échec: utilisateur non connecté en mode non-guest'
      )
      return {
        success: false,
        error:
          'Utilisateur non connecté - utilisez le mode guest ou connectez-vous',
      }
    }

    const plan = getPlanByPriceId(priceId)
    if (!plan) {
      logger.error(
        '[INSTALLMENT-CHECKOUT] ❌ Plan non trouvé pour priceId:',
        priceId
      )
      return {
        success: false,
        error: 'Plan non trouvé',
      }
    }
    logger.debug('[INSTALLMENT-CHECKOUT] Plan récupéré:', {
      planCode: plan.planCode,
      isReccuring: plan.isReccuring,
    })

    // Vérifier que ce n'est pas un plan récurrent (incompatible avec les échéanciers)
    if (plan.isReccuring) {
      logger.error(
        '[INSTALLMENT-CHECKOUT] ❌ Plan récurrent incompatible avec échéancier'
      )
      return {
        success: false,
        error:
          'Les paiements en plusieurs fois ne sont pas disponibles pour les abonnements récurrents',
      }
    }

    const installmentPlan = InstallmentPlans[installmentType]
    if (!installmentPlan) {
      logger.error(
        "[INSTALLMENT-CHECKOUT] ❌ Type d'échéancier invalide:",
        installmentType
      )
      return {
        success: false,
        error: "Type d'échéancier non valide",
      }
    }
    logger.debug('[INSTALLMENT-CHECKOUT] Plan échéancier récupéré:', {
      type: installmentType,
      numberOfPayments: installmentPlan.numberOfPayments,
    })

    const headersList = await headers()
    const origin = headersList.get('origin') || ''

    // Récupérer le prix pour calculer le montant total
    const price = await stripeClient.prices.retrieve(priceId)
    if (!price || !price.unit_amount) {
      logger.error(
        '[INSTALLMENT-CHECKOUT] ❌ Prix non trouvé ou invalide pour priceId:',
        priceId
      )
      return {
        success: false,
        error: 'Prix non trouvé',
      }
    }

    const totalAmount = price.unit_amount * seats // en centimes
    const numberOfPayments = installmentPlan.numberOfPayments
    logger.debug('[INSTALLMENT-CHECKOUT] Calculs montants:', {
      unitAmount: price.unit_amount,
      totalAmount,
      numberOfPayments,
      seats,
    })

    // Logique différente selon guest ou user connecté
    let customerId: string
    let baseMetadata: Record<string, string>

    if (guest || !user) {
      logger.info(
        '[INSTALLMENT-CHECKOUT] 📋 Mode guest détecté - création customer temporaire'
      )
      // Mode Guest : créer un customer temporaire, Stripe collectera l'email
      const customer = await stripeClient.customers.create({
        metadata: {
          managed_by: 'webhook_guest_checkout',
          source: 'installment_checkout',
        },
      })
      customerId = customer.id
      logger.debug('[INSTALLMENT-CHECKOUT] Customer guest créé:', {customerId})

      baseMetadata = {
        source: 'installment_checkout',
        guest_checkout: 'true', // Marquer comme guest checkout
        plan: plan.planCode,
        installment_type: installmentType,
      }
    } else {
      logger.info('[INSTALLMENT-CHECKOUT] 👤 Mode utilisateur connecté détecté')
      // Mode User connecté : utiliser ou créer le customer
      customerId = user.stripeCustomerId || ''

      // Créer un customer Stripe si nécessaire
      if (!customerId) {
        logger.info(
          '[INSTALLMENT-CHECKOUT] 🔧 Création customer Stripe pour utilisateur'
        )
        const customer = await stripeClient.customers.create({
          email: user.email ?? '',
          metadata: {
            userId: user.id,
          },
        })
        customerId = customer.id
        logger.debug('[INSTALLMENT-CHECKOUT] Customer Stripe créé:', {
          customerId,
        })
      }

      baseMetadata = {
        source: 'installment_checkout',
        email: user.email ?? '',
        plan: plan.planCode,
        userId: user.id,
        customerEmail: user.email ?? '',
        installment_type: installmentType,
      }
      logger.debug(
        '[INSTALLMENT-CHECKOUT] Configuration utilisateur connecté:',
        {
          customerId,
          userId: user.id,
          email: user.email,
        }
      )
    }

    logger.info('[INSTALLMENT-CHECKOUT] 🗓️ Création du Subscription Schedule')
    // Créer le Subscription Schedule pour les échéanciers
    const scheduleResult = await createInstallmentSubscriptionSchedule(
      customerId,
      priceId,
      totalAmount,
      numberOfPayments,
      seats,
      baseMetadata
    )
    logger.debug('[INSTALLMENT-CHECKOUT] Schedule créé:', {
      scheduleId: scheduleResult.schedule.id,
      installmentPriceId: scheduleResult.installmentPrice.id,
    })

    logger.info('[INSTALLMENT-CHECKOUT] 🔧 Création session checkout Stripe')
    // Créer une session checkout pour le premier paiement
    const session = await stripeClient.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: scheduleResult.installmentPrice.id,
          quantity: seats,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/checkout/success?redirect_status=succeeded&session_id={CHECKOUT_SESSION_ID}&installment_schedule=${scheduleResult.schedule.id}`,
      cancel_url: `${origin}/pricing`,
      metadata: {
        ...baseMetadata,
        payment_type: 'installment',
        number_of_payments: numberOfPayments.toString(),
        seats: seats.toString(),
        schedule_id: scheduleResult.schedule.id,
        original_price_id: priceId,
      },
      payment_method_types: ['card'],
    })

    logger.info(
      '✅ [INSTALLMENT-CHECKOUT] Session par échéances créée avec succès'
    )
    logger.debug('[INSTALLMENT-CHECKOUT] Détails session:', {
      sessionId: session.id,
      mode: guest || !user ? 'guest' : 'user_connecté',
      customer: customerId,
      scheduleId: scheduleResult.schedule.id,
    })

    return {
      success: true,
      sessionUrl: session.url || undefined,
      sessionId: session.id,
      clientSecret: session.client_secret || undefined,
      installmentPlan: installmentPlan,
      scheduleId: scheduleResult.schedule.id,
    }
  } catch (error) {
    logger.error(
      '[INSTALLMENT-CHECKOUT] ❌ Erreur lors de la création session par échéances:',
      error
    )
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }
  }
}
