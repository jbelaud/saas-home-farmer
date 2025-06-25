import Stripe from 'stripe'

import {
  getUserByEmailDao,
  updateUserSafeByUidDao,
} from '@/db/repositories/user-repository'
import {logger} from '@/lib/logger'
import {
  createSubscriptionFromStripeService,
  getSubscriptionByUserIdService,
} from '@/services/facades/subscription-service-facade'
import {createUserFromStripeService} from '@/services/facades/user-service-facade'
import {SubscriptionPlan} from '@/services/types/domain/subscription-types'

import {stripeClient} from './stripe-utils'

export async function onStripeEvent(event: Stripe.Event) {
  logger.info('[STRIPE-EVENT] Réception événement Stripe:', event.type)
  logger.debug('[STRIPE-EVENT] Détails événement:', {
    eventId: event.id,
    eventData: event.data,
  })

  // Handle any Stripe event - TOUS les événements Stripe passent ici
  logger.info('Better Auth Stripe event:', event.type, event.id)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        logger.info('🔧 Traitement checkout session completed')
        const session = event.data.object as Stripe.Checkout.Session
        const metadata = session.metadata || {}
        const seats = metadata.seats ? parseInt(metadata.seats) : 1

        // Récupérer les infos nécessaires
        const customerEmail =
          metadata.customerEmail ?? session.customer_details?.email
        const stripeCustomerId = session.customer ?? undefined
        const plan = metadata.plan as SubscriptionPlan
        const isReccuring = metadata.isReccuring === 'true'
        const isYearly = metadata.interval === 'year'
        // const priceId = metadata.priceId as string
        // const payment_intent = session.payment_intent as string
        const subscriptionId = session.subscription as string

        logger.info('🔧 session', session)
        logger.debug('🔧 metadata:', metadata)
        logger.debug('🔧 customerEmail', customerEmail)
        logger.debug('🔧 stripeCustomerId', stripeCustomerId)
        logger.debug('🔧 plan', plan)
        logger.debug('🔧 isYearly', isYearly)
        logger.debug('🔧 subscription', subscriptionId)
        logger.debug('🔧 isReccuring', isReccuring)

        // Détecter le type de traitement nécessaire
        const isGuestCheckout =
          !customerEmail || metadata.guest_checkout === 'true'
        const isInstallmentCheckout = metadata.source === 'installment_checkout'
        const isCustomCheckout = metadata.source === 'custom_checkout'

        logger.debug('🔧 Type de checkout détecté:', {
          isGuestCheckout,
          isInstallmentCheckout,
          isCustomCheckout,
          source: metadata.source,
        })

        // ÉTAPE 1: Gestion de l'utilisateur (guest ou existant)
        let finalCustomerId = stripeCustomerId as string
        let finalCustomerEmail = customerEmail

        if (isGuestCheckout) {
          logger.debug('📋 Traitement utilisateur guest')
          const email = session.customer_details?.email ?? ''
          const name = session.customer_details?.name ?? ''

          finalCustomerEmail = email

          // Créer customer Stripe si nécessaire
          if (!finalCustomerId) {
            const customer = await stripeClient.customers.create({
              email: email,
              metadata: {
                managed_by: 'webhook_guest_checkout',
              },
            })
            finalCustomerId = customer.id
          }

          // Gestion de l'utilisateur en base
          const user = await getUserByEmailDao(email)
          if (user) {
            logger.debug('🔧 Utilisateur existant trouvé')
            if (finalCustomerId && user.stripeCustomerId !== finalCustomerId) {
              logger.warn('⚠️ Mismatch stripeCustomerId détecté')
              const subscription = await getSubscriptionByUserIdService(user.id)
              if (!subscription) {
                await updateUserSafeByUidDao(
                  {
                    email: user.email,
                    name: user.name,
                    stripeCustomerId: finalCustomerId,
                  },
                  user.id
                )
              }
            }
          } else {
            await createUserFromStripeService({
              email,
              stripeCustomerId: finalCustomerId,
              name: name ?? email?.split('@')[0] ?? '',
            })
            logger.info('✅ Nouvel utilisateur créé pour guest checkout', email)
          }
        }

        // ÉTAPE 2: Gestion de la subscription UNIQUEMENT pour vos cas spécifiques
        if (
          isInstallmentCheckout &&
          finalCustomerEmail &&
          plan &&
          metadata.schedule_id
        ) {
          logger.debug('🗓️ Traitement subscription échéancier')

          try {
            const numberOfPayments = parseInt(
              metadata.number_of_payments || '1'
            )
            const currentDate = new Date()
            const endDate = new Date(currentDate)
            endDate.setMonth(endDate.getMonth() + numberOfPayments)

            await createSubscriptionFromStripeService(
              finalCustomerEmail,
              plan,
              isYearly,
              subscriptionId,
              finalCustomerId,
              seats,
              endDate
            )

            logger.info(
              '✅ Subscription échéancier créée avec succès',
              finalCustomerEmail
            )
          } catch (error) {
            logger.error('❌ Erreur création subscription échéancier:', error)
          }
        } else if (isCustomCheckout && finalCustomerEmail && plan) {
          logger.debug('🔧 Traitement subscription custom')

          try {
            await createSubscriptionFromStripeService(
              finalCustomerEmail,
              plan,
              isYearly,
              subscriptionId,
              finalCustomerId,
              seats
            )
            logger.info('✅ Custom subscription créée avec succès')
          } catch (error) {
            logger.error('❌ Erreur création custom subscription:', error)
          }
        } else if (
          isGuestCheckout &&
          !isInstallmentCheckout &&
          !isCustomCheckout &&
          finalCustomerEmail &&
          plan
        ) {
          logger.info('📋 Traitement subscription guest simple')

          await createSubscriptionFromStripeService(
            finalCustomerEmail,
            plan,
            isYearly,
            subscriptionId,
            finalCustomerId
          )
          logger.info('✅ Subscription guest simple créée avec succès')
        } else {
          logger.debug(
            "📋 Checkout Better Auth natif - traité automatiquement par l'API Better Auth"
          )
        }
        break
      }

      case 'customer.subscription.updated': {
        logger.info('🔄 [TEST] Traitement customer.subscription.updated')
        const subscription = event.data.object as Stripe.Subscription

        logger.debug('🔄 [TEST] Subscription object:', {
          id: subscription.id,
          customer: subscription.customer,
          status: subscription.status,
          start_date: subscription.start_date,
          ended_at: subscription.ended_at,
          metadata: subscription.metadata,
        })

        // TODO: Ici Better Auth gère automatiquement la mise à jour
        logger.info(
          '✅ [TEST] customer.subscription.updated traité par Better Auth'
        )
        break
      }

      case 'customer.subscription.deleted': {
        logger.info('🗑️ [TEST] Traitement customer.subscription.deleted')
        const subscription = event.data.object as Stripe.Subscription

        logger.debug('🗑️ [TEST] Subscription deleted:', {
          id: subscription.id,
          customer: subscription.customer,
          status: subscription.status,
          metadata: subscription.metadata,
        })

        // TODO: Ici Better Auth gère automatiquement l'annulation
        logger.info(
          '✅ [TEST] customer.subscription.deleted traité par Better Auth'
        )
        break
      }

      case 'invoice.paid':
        logger.info('💰 Invoice paid:', event.data.object.id)
        break

      case 'payment_intent.succeeded': {
        //1 pour les paiements unique seulement // PlanConst.LIFETIME
        logger.info(
          '✅ Payment succeeded (payment_intent.succeeded):',
          event.data.object.id
        )

        break
      }

      default:
        logger.info('📝 Autre événement Stripe:', event.type)
    }
  } catch (error) {
    logger.error('❌ Erreur dans onEvent Stripe:', error)
  }
}
