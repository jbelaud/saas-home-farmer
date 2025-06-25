import Stripe from 'stripe'

import {
  getUserByEmailDao,
  updateUserSafeByUidDao,
} from '@/db/repositories/user-repository'
import {
  createSubscriptionFromStripeService,
  getSubscriptionByUserIdService,
} from '@/services/facades/subscription-service-facade'
import {createUserFromStripeService} from '@/services/facades/user-service-facade'
import {SubscriptionPlan} from '@/services/types/domain/subscription-types'

import {stripeClient} from './stripe-utils'

export async function onStripeEvent(event: Stripe.Event) {
  // Handle any Stripe event - TOUS les événements Stripe passent ici
  console.log('Better Auth Stripe event:', event.type, event.id)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        console.log('🔧 Traitement checkout session completed')
        const session = event.data.object as Stripe.Checkout.Session
        const metadata = session.metadata || {}
        const seats = metadata.seats ? parseInt(metadata.seats) : 1

        console.log('Checkout session metadata:', metadata)
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

        console.log('🔧 session', session)
        console.log('🔧 customerEmail', customerEmail)
        console.log('🔧 stripeCustomerId', stripeCustomerId)
        console.log('🔧 plan', plan)
        console.log('🔧 isYearly', isYearly)
        console.log('🔧 subscription', subscriptionId)
        console.log('🔧 isReccuring', isReccuring)

        // Détecter le type de traitement nécessaire
        const isGuestCheckout =
          !customerEmail || metadata.guest_checkout === 'true'
        const isInstallmentCheckout = metadata.source === 'installment_checkout'
        const isCustomCheckout = metadata.source === 'custom_checkout'

        console.log('🔧 Type de checkout détecté:', {
          isGuestCheckout,
          isInstallmentCheckout,
          isCustomCheckout,
          source: metadata.source,
        })

        // ÉTAPE 1: Gestion de l'utilisateur (guest ou existant)
        let finalCustomerId = stripeCustomerId as string
        let finalCustomerEmail = customerEmail

        if (isGuestCheckout) {
          console.log('📋 Traitement utilisateur guest')
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
            console.log('🔧 Utilisateur existant trouvé')
            if (finalCustomerId && user.stripeCustomerId !== finalCustomerId) {
              console.warn('⚠️ Mismatch stripeCustomerId détecté')
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
            console.log('✅ Nouvel utilisateur créé pour guest checkout')
          }
        }

        // ÉTAPE 2: Gestion de la subscription UNIQUEMENT pour vos cas spécifiques
        if (
          isInstallmentCheckout &&
          finalCustomerEmail &&
          plan &&
          metadata.schedule_id
        ) {
          console.log('🗓️ Traitement subscription échéancier')

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

            console.log('✅ Subscription échéancier créée avec succès')
          } catch (error) {
            console.error('❌ Erreur création subscription échéancier:', error)
          }
        } else if (isCustomCheckout && finalCustomerEmail && plan) {
          console.log('🔧 Traitement subscription custom')

          try {
            await createSubscriptionFromStripeService(
              finalCustomerEmail,
              plan,
              isYearly,
              subscriptionId,
              finalCustomerId,
              seats
            )
            console.log('✅ Custom subscription créée avec succès')
          } catch (error) {
            console.error('❌ Erreur création custom subscription:', error)
          }
        } else if (
          isGuestCheckout &&
          !isInstallmentCheckout &&
          !isCustomCheckout &&
          finalCustomerEmail &&
          plan
        ) {
          console.log('📋 Traitement subscription guest simple')

          await createSubscriptionFromStripeService(
            finalCustomerEmail,
            plan,
            isYearly,
            subscriptionId,
            finalCustomerId
          )
          console.log('✅ Subscription guest simple créée avec succès')
        } else {
          console.log(
            "📋 Checkout Better Auth natif - traité automatiquement par l'API Better Auth"
          )
        }
        break
      }

      case 'invoice.paid':
        console.log('💰 Invoice paid:', event.data.object.id)
        break

      case 'payment_intent.succeeded': {
        //1 pour les paiements unique seulement // PlanConst.LIFETIME
        console.log(
          '✅ Payment succeeded (payment_intent.succeeded):',
          event.data.object.id
        )

        break
      }

      default:
        console.log('📝 Autre événement Stripe:', event.type)
    }
  } catch (error) {
    console.error('❌ Erreur dans onEvent Stripe:', error)
  }
}
