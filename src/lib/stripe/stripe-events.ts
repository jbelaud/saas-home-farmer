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

        // CAS : User connu - checkout custom (non gerer par l'api better-auth)
        if (
          metadata.source === 'custom_checkout' &&
          metadata.managed_by === 'better_auth'
        ) {
          console.log('🔧 Traitement checkout custom via Better Auth')

          if (customerEmail && plan) {
            // Utiliser votre service existant pour créer la subscription

            try {
              await createSubscriptionFromStripeService(
                customerEmail,
                plan,
                isYearly,
                session.subscription as string,
                stripeCustomerId as string,
                seats
              )
              console.log(
                '✅ Custom subscription créée avec succès:',
                customerEmail,
                plan,
                stripeCustomerId
              )
            } catch (error) {
              console.error('❌ Erreur création custom subscription:', error)
            }
          } else {
            console.warn('⚠️ Données manquantes pour checkout custom:', {
              customerEmail,
              plan,
            })
          }
          // CAS : User inconnu (checkout as guest + creation de compte)
        } else if (metadata.source === 'guest_checkout') {
          console.log('📋 Checkout guest - traité automatiquement')
          const email = session.customer_details?.email ?? ''
          const name = session.customer_details?.name ?? ''

          console.log('🔧 customerEmail', email)
          let customerId = stripeCustomerId
          if (!stripeCustomerId) {
            const customer = await stripeClient.customers.create({
              email: email,
              metadata: {
                managed_by: 'webhook_guest_checkout',
              },
            })
            customerId = customer.id
          }
          const user = await getUserByEmailDao(email ?? '')
          if (user) {
            console.log('🔧 user found')
            if (
              stripeCustomerId &&
              user.stripeCustomerId !== stripeCustomerId
            ) {
              // Attention : Ce cas doit etre gerer avec prudence
              // mettre a jout le user va casser le lien avec des plans existants
              console.warn('⚠️ user stripeCustomerId mismatch')
              const subscription = await getSubscriptionByUserIdService(user.id)
              if (subscription) {
                console.warn('⚠️ subscription found')
              } else {
                console.warn('🔧 no subscription found')
                // Envisager lupdate de stripeCustomerId
                await updateUserSafeByUidDao(
                  {
                    email: user.email,
                    name: user.name,
                    stripeCustomerId: stripeCustomerId as string,
                  },
                  user.id
                )
              }

              //await updateStripeCustomerIdService(user.id, stripeCustomerId)
            }
          } else {
            const newUser = await createUserFromStripeService({
              email,
              stripeCustomerId: customerId as string,
              name: name ?? email?.split('@')[0] ?? '',
            })
            console.log('🔧 newUser', newUser)
          }
          if (isReccuring) {
            await createSubscriptionFromStripeService(
              email,
              plan,
              isYearly,
              subscriptionId as string,
              customerId as string
            )
          } else {
            await createSubscriptionFromStripeService(
              email,
              plan,
              isYearly,
              subscriptionId as string,
              customerId as string
            )
          }
        } else {
          console.log('📋 Checkout Better Auth natif - traité automatiquement')
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
