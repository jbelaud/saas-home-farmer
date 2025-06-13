import {DrizzleAdapter} from '@auth/drizzle-adapter'
import type {NextAuthConfig} from 'next-auth'
import Apple from 'next-auth/providers/apple'
import Google from 'next-auth/providers/google'
import Resend from 'next-auth/providers/resend'

import db from '@/db/models/db'
import {EmailService} from '@/services/email-service'

import MagicLinkMail from '../emails/magic-link-email'

export const authConfig: NextAuthConfig = {
  trustHost: true,
  pages: {
    signIn: '/sign-in',
    signOut: '/sign-out',
    verifyRequest: '/verify-request',
    error: '/error',
  },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async redirect({url, baseUrl}) {
      return `${baseUrl}/dashboard`
    },
  },

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Apple({
      clientId: process.env.APPLE_ID,
      clientSecret: process.env.APPLE_SECRET,
    }),
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
