import {stripe} from '@better-auth/stripe'
import {betterAuth, BetterAuthOptions, User} from 'better-auth'
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
import {APP_ISSUER} from '@/lib/constants'
import {BILLING_MODE} from '@/lib/helper/subscription-helper'
import {stripeClient} from '@/lib/stripe/stripe-client'
import {onStripeEvent} from '@/lib/stripe/stripe-events'
import {
  sendEmailChangeEmailVerificationService,
  sendMagicLinkEmailService,
  sendOrganizationInvitationService,
  sendOTPEmailService,
  sendResetPasswordLinkEmailService,
  sendSubscriptionCanceledEmailService,
  sendSubscriptionCompletedEmailService,
  sendSubscriptionDeletedEmailService,
  sendSubscriptionUpdatedEmailService,
  sendVerificationEmailService,
} from '@/services/facades/email-service-facade'
import {getOrganizationMembersService} from '@/services/facades/organization-service-facade'
import {getActivePlansForBetterAuthService} from '@/services/facades/subscription-service-facade'
import {initializeRegisterUserDataService} from '@/services/facades/user-service-facade'
import {BillingModes} from '@/services/types/domain/subscription-types'

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
      invitationLimit: 10,
      membershipLimit: 10,
      allowUserToCreateOrganization: false,
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
        plans: await getActivePlansForBetterAuthService(),
        authorizeReference: createAuthorizeReference(),
        onSubscriptionComplete: async ({subscription}) => {
          await sendSubscriptionCompletedEmailService(subscription)
        },
        onSubscriptionUpdate: async ({subscription}) => {
          await sendSubscriptionUpdatedEmailService(subscription)
        },
        onSubscriptionCancel: async ({subscription}) => {
          await sendSubscriptionCanceledEmailService(subscription)
        },
        onSubscriptionDeleted: async ({subscription}) => {
          await sendSubscriptionDeletedEmailService(subscription)
        },
      },
      onEvent: onStripeEvent,
    }),
  ],
  trustedOrigins: ['http://localhost:3000'],
  hooks: {
    after: createAuthRedirectMiddleware(),
  },
  databaseHooks: createDatabaseHooks(),
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
        session,
      }
    }, options), // Passer les options pour l'inférence TypeScript
    nextCookies(), // TOUJOURS en dernier
  ],
})

/**
 * Crée les hooks pour la base de données
 * @returns
 */
function createDatabaseHooks() {
  return {
    user: {
      create: {
        before: async (user: User) => {
          return {
            data: {
              ...user,
              name: user.name || user.email.split('@')[0],
            },
          }
        },
        after: async (user: User) => {
          await initializeRegisterUserDataService(user.email)
        },
      },
    },
  }
}
/**
 * Crée la fonction d'autorisation pour les références d'abonnement
 */
function createAuthorizeReference() {
  return async ({
    user,
    referenceId,
    action,
  }: {
    user: User
    referenceId: string
    action: string
  }) => {
    // Check if the user has permission to manage subscriptions for this reference

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
        // Seuls owner et admin peuvent gérer les abonnements
        return member?.role === 'owner' //|| member?.role === 'admin'
      }
      return false
    }
    return false
  }
}

/**
 * Middleware pour gérer les redirections après les actions d'authentification
 */
function createAuthRedirectMiddleware() {
  return createAuthMiddleware(async (ctx) => {
    if (
      ctx.path.startsWith('/sign-up') ||
      ctx.path === '/magic-link/verify' ||
      ctx.path === '/callback/:id' ||
      ctx.path.startsWith('/sign-in/') // pour SSO
    ) {
      //console.log('ctx.path', ctx.path)
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
