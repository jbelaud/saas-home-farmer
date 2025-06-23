import {stripe} from '@better-auth/stripe'
import {betterAuth} from 'better-auth'
import {drizzleAdapter} from 'better-auth/adapters/drizzle'
import {createAuthMiddleware} from 'better-auth/api'
import {nextCookies} from 'better-auth/next-js'
import {
  admin,
  bearer,
  magicLink,
  organization,
  twoFactor,
} from 'better-auth/plugins'
import Stripe from 'stripe'
import {v4 as uuidv4} from 'uuid'

import db from '@/db/models/db'
import {env} from '@/env'
import {
  sendEmailChangeEmailVerificationService,
  sendMagicLinkEmailService,
  sendOrganizationInvitationService,
  sendOTPEmailService,
  sendResetPasswordLinkEmailService,
  sendVerificationEmailService,
} from '@/services/facades/email-service-facade'
import {createSubscriptionFromStripeService} from '@/services/facades/subscription-service-facade'
import {initializeRegisterUserDataService} from '@/services/facades/user-service-facade'
import {SubscriptionPlan} from '@/services/types/domain/subscription-types'

import {APP_ISSUER} from '../constants'
import {betterAuthPlans} from '../stripe-utils'

const stripeClient = new Stripe(env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

export const AuthAppConfig = {
  requireEmailVerification:
    env.NEXT_PUBLIC_BETTER_AUTH_REQUIRE_EMAIL_VERIFICATION,
  skipVerificationOnEnable:
    env.NEXT_PUBLIC_BETTER_AUTH_2FA_SKIP_VERIFICATION_ON_ENABLE,
  enable2FA: env.NEXT_PUBLIC_BETTER_AUTH_2FA_ENABLE,
  changePassword: env.NEXT_PUBLIC_BETTER_AUTH_CHANGE_PASSWORD,
  changeEmail: env.NEXT_PUBLIC_BETTER_AUTH_CHANGE_EMAIL,
} as const

export const auth = betterAuth({
  appName: APP_ISSUER,
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: AuthAppConfig.requireEmailVerification,
    sendResetPassword: async ({user, url}) => {
      await sendResetPasswordLinkEmailService({
        email: user.email,
        url,
      })
    },
  },
  account: {
    accountLinking: {
      enabled: true,
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({user, url}) => {
      await sendVerificationEmailService({
        email: user.email,
        url,
      })
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 3600, // 1 hour
  },
  advanced: {
    database: {
      generateId: () => uuidv4(),
    },
  },
  user: {
    changeEmail: {
      enabled: AuthAppConfig.changeEmail,
      sendChangeEmailVerification: async ({user, url}) => {
        await sendEmailChangeEmailVerificationService({
          email: user.email,
          url,
        })
      },
    },
  },
  socialProviders: {
    google: {
      prompt: 'select_account',
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [
    bearer(),
    twoFactor({
      issuer: APP_ISSUER,
      skipVerificationOnEnable: AuthAppConfig.skipVerificationOnEnable,
      totpOptions: {},
      otpOptions: {
        period: 300, // 5 minutes d'expiration
        sendOTP: async ({user, otp}) => {
          const otpLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-request/otp?code=${otp}`
          await sendOTPEmailService({
            email: user.email,
            otp,
            otpLink,
          })
        },
      },
    }),
    magicLink({
      sendMagicLink: async ({email, url}) => {
        await sendMagicLinkEmailService({
          email,
          url,
        })
      },
    }),
    admin(),
    organization({
      async sendInvitationEmail(data) {
        const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invitations/${data.id}`
        await sendOrganizationInvitationService({
          email: data.email,
          invitedByUsername: data.inviter.user.name,
          invitedByEmail: data.inviter.user.email,
          teamName: data.organization.name,
          inviteLink,
        })
      },
    }),
    stripe({
      stripeClient,
      stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET,
      createCustomerOnSignUp: true,
      subscription: {
        enabled: true,
        plans: betterAuthPlans,
        // ... other options
        onSubscriptionComplete: async ({
          event,
          subscription,
          stripeSubscription,
          plan,
        }) => {
          // Called when a subscription is successfully created
          console.log(
            'onSubscriptionComplete',
            event,
            subscription,
            stripeSubscription,
            plan
          )
          //await sendWelcomeEmail(subscription.referenceId, plan.name)
        },
        onSubscriptionUpdate: async ({event, subscription}) => {
          // Called when a subscription is updated
          console.log(`Subscription ${subscription.id} updated`, event)
        },
        onSubscriptionCancel: async ({
          event,
          subscription,
          stripeSubscription,
          cancellationDetails,
        }) => {
          // Called when a subscription is canceled
          console.log(
            'onSubscriptionCancel',
            event,
            subscription,
            stripeSubscription,
            cancellationDetails
          )
          //await sendCancellationEmail(subscription.referenceId)
        },
        onSubscriptionDeleted: async ({
          event,
          subscription,
          stripeSubscription,
        }) => {
          // Called when a subscription is deleted
          console.log(
            `Subscription ${subscription.id} deleted`,
            event,
            subscription,
            stripeSubscription
          )
        },
      },
      onEvent: onStripeEvent,
    }),
    nextCookies(),
  ], //garder nextCookies() en dernier
  trustedOrigins: ['http://localhost:3000'],
  hooks: {
    after: createAuthRedirectMiddleware(),
  },
  databaseHooks: {},
})
/**
 * Middleware pour gérer les redirections après les actions d'authentification
 */
function createAuthRedirectMiddleware() {
  return createAuthMiddleware(async (ctx) => {
    console.log('ctx.path', ctx.path)

    if (ctx.path === '/magic-link/verify') {
      console.log('/magic-link/verify')
      const result = await initializeRegisterUserDataService(
        ctx.context?.newSession?.user.email ?? ''
      )
      if (result.organizationId) {
        await auth.api.setActiveOrganization({
          headers: ctx.headers,
          body: {
            organizationId: result.organizationId,
          },
        })
      }
    }

    // Redirection après connexion réussie
    if (ctx.path === '/sign-in/email' && ctx.context.newSession) {
      console.log('Redirection après connexion réussie')
      //throw ctx.redirect('/dashboard')
    }

    // Redirection après inscription réussie
    if (ctx.path === '/sign-up/email' && ctx.context.newSession) {
      console.log('Redirection après inscription réussie')
      throw ctx.redirect('/verify-request')
    }

    // Redirection après déconnexion
    if (ctx.path === '/sign-out') {
      console.log('Redirection après déconnexion')
      throw ctx.redirect('/login')
    }

    // Redirection après vérification d'email
    if (ctx.path === '/verify-email' && ctx.context.newSession) {
      console.log("Redirection après vérification d'email")
      throw ctx.redirect('/dashboard')
    }
  })
}

async function onStripeEvent(event: Stripe.Event) {
  // Handle any Stripe event - TOUS les événements Stripe passent ici
  console.log('Better Auth Stripe event:', event.type, event.id)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const metadata = session.metadata || {}

        console.log('Checkout session metadata:', metadata)

        // Vérifier si c'est un checkout custom
        if (
          metadata.source === 'custom_checkout' &&
          metadata.managed_by === 'better_auth'
        ) {
          console.log('🔧 Traitement checkout custom via Better Auth')

          // Récupérer les infos nécessaires
          const customerEmail = session.customer_details?.email
          const plan = metadata.plan as SubscriptionPlan
          const isYearly = metadata.interval === 'year'

          console.log('🔧 session', session)
          console.log('🔧 customerEmail', customerEmail)
          console.log('🔧 plan', plan)
          console.log('🔧 isYearly', isYearly)

          if (customerEmail && plan) {
            // Utiliser votre service existant pour créer la subscription

            try {
              await createSubscriptionFromStripeService(
                customerEmail,
                plan,
                isYearly
              )
              console.log(
                '✅ Custom subscription créée avec succès:',
                customerEmail,
                plan
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
        } else {
          console.log('📋 Checkout Better Auth natif - traité automatiquement')
        }
        break
      }

      case 'invoice.paid':
        console.log('💰 Invoice paid:', event.data.object.id)
        break

      case 'payment_intent.succeeded':
        console.log('✅ Payment succeeded:', event.data.object.id)
        break

      default:
        console.log('📝 Autre événement Stripe:', event.type)
    }
  } catch (error) {
    console.error('❌ Erreur dans onEvent Stripe:', error)
  }
}
