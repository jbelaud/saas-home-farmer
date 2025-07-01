import {stripe} from '@better-auth/stripe'
import {betterAuth, BetterAuthOptions} from 'better-auth'
import {drizzleAdapter} from 'better-auth/adapters/drizzle'
import {createAuthMiddleware} from 'better-auth/api'
import {nextCookies} from 'better-auth/next-js'
import {
  admin,
  bearer,
  customSession,
  magicLink,
  organization,
  twoFactor,
} from 'better-auth/plugins'
import {v4 as uuidv4} from 'uuid'

import db from '@/db/models/db'
import {getUserByIdDao} from '@/db/repositories/user-repository'
import {env} from '@/env'
import {
  sendEmailChangeEmailVerificationService,
  sendMagicLinkEmailService,
  sendOrganizationInvitationService,
  sendOTPEmailService,
  sendResetPasswordLinkEmailService,
  sendVerificationEmailService,
} from '@/services/facades/email-service-facade'
import {getOrganizationMembersService} from '@/services/facades/organization-service-facade'
import {initializeRegisterUserDataService} from '@/services/facades/user-service-facade'
import {BillingModes} from '@/services/types/domain/subscription-types'

import {APP_ISSUER} from '../constants'
import {BILLING_MODE} from '../helper/subscription-helper'
import {onStripeEvent} from '../stripe/stripe-events'
import {betterAuthPlans, stripeClient} from '../stripe/stripe-utils'

export const AuthAppConfig = {
  requireEmailVerification:
    env.NEXT_PUBLIC_BETTER_AUTH_REQUIRE_EMAIL_VERIFICATION,
  skipVerificationOnEnable:
    env.NEXT_PUBLIC_BETTER_AUTH_2FA_SKIP_VERIFICATION_ON_ENABLE,
  enable2FA: env.NEXT_PUBLIC_BETTER_AUTH_2FA_ENABLE,
  changePassword: env.NEXT_PUBLIC_BETTER_AUTH_CHANGE_PASSWORD,
  changeEmail: env.NEXT_PUBLIC_BETTER_AUTH_CHANGE_EMAIL,
} as const

// Solution officielle Better Auth pour résoudre le problème de typage
// avec customSession + organization plugin
// Source : https://github.com/better-auth/better-auth/issues/3233
const options = {
  appName: APP_ISSUER,
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache de 5 minutes
    },
  },
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
        authorizeReference: async ({user, referenceId, action}) => {
          // Check if the user has permission to manage subscriptions for this reference
          console.log('authorizeReference', referenceId, action)

          if (action === 'list-subscription') {
            return true
          }
          if (
            action === 'upgrade-subscription' ||
            action === 'cancel-subscription' ||
            action === 'restore-subscription'
          ) {
            // Mode USER : seul le propriétaire peut gérer
            if (BILLING_MODE === BillingModes.USER) {
              return user.id === referenceId
            }

            // Mode ORGANIZATION : vérifier le rôle dans l'org
            if (BILLING_MODE === BillingModes.ORGANIZATION) {
              const org = await getOrganizationMembersService(referenceId)
              const member = org.find((m) => m.userId === user.id)
              console.log('authorizeReference member', member)
              // Seuls owner et admin peuvent gérer les abonnements
              return member?.role === 'owner' //|| member?.role === 'admin'
            }
            return false
          }
          return false
        },

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
  ],
  trustedOrigins: ['http://localhost:3000'],
  hooks: {},
  databaseHooks: {},
} satisfies BetterAuthOptions

export const auth = betterAuth({
  ...options,
  plugins: [
    ...(options.plugins ?? []),
    customSession(async ({session}) => {
      // Maintenant TypeScript connaît tous les champs des plugins, y compris activeOrganizationId
      const fullUser = await getUserByIdDao(session.userId)
      return {
        user: fullUser,
        session, // activeOrganizationId est maintenant correctement typé
      }
    }, options), // Passer les options pour l'inférence TypeScript
    nextCookies(), // TOUJOURS en dernier
  ],
  hooks: {
    after: createAuthRedirectMiddleware(),
  },
})
/**
 * Middleware pour gérer les redirections après les actions d'authentification
 */
function createAuthRedirectMiddleware() {
  return createAuthMiddleware(async (ctx) => {
    console.log('ctx.path', ctx.path)
    //console.log('ctx.context newSession', ctx.context.newSession)

    if (
      ctx.path === '/magic-link/verify' &&
      ctx.context.newSession &&
      ctx.context.newSession.user.email
    ) {
      console.log('/magic-link/verify')
      const result = await initializeRegisterUserDataService(
        ctx.context?.newSession?.user.email ?? ''
      )
      if (result.organizationId) {
        try {
          await auth.api.setActiveOrganization({
            headers: ctx.headers,
            body: {
              organizationId: result.organizationId,
            },
          })
        } catch (error) {
          console.warn('Error setting active organization', error)
        }
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
