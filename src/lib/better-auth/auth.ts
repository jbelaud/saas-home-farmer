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
import {initializeRegisterUserDataService} from '@/services/facades/user-service-facade'

import {APP_ISSUER} from '../constants'

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
