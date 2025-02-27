import type {NextAuthConfig} from 'next-auth'
import Resend from 'next-auth/providers/resend'
import {DrizzleAdapter} from '@auth/drizzle-adapter'
import {EmailService} from '@/services/email-service'
import MagicLinkMail from './emails/magic-link-email'
import db from '@/db/models/db'

export const authConfig: NextAuthConfig = {
  trustHost: true,
  pages: {
    signIn: '/sign-in',
    signOut: '/sign-out',
    verifyRequest: '/verify-request',
    error: '/error',
  },

  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      sendVerificationRequest: async ({identifier: email, url}) => {
        const fromEmail = process.env.EMAIL_FROM

        if (!fromEmail) {
          throw new Error('EMAIL_FROM is not set')
        }
        await EmailService.sendEmail({
          to: email,
          subject: 'Connexion au SaaS Mike Codeur Stripe',
          from: fromEmail,
          text: 'Connexion au SaaS Mike Codeur Stripe',
          react: MagicLinkMail({url}),
        })
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: 'database',
    maxAge: 24 * 60 * 60 * 30, // 24 heures (en secondes) x 3 = & mois
    updateAge: 60 * 60, // 1 heure (en secondes)
  },
  adapter: DrizzleAdapter(db),
} satisfies NextAuthConfig
