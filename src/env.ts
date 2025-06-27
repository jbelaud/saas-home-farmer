import {createEnv} from '@t3-oss/env-nextjs'
import {z} from 'zod'

import {
  StripeCheckoutType,
  StripeCheckoutTypeSchema,
} from './lib/stripe/stripe-types'
import {BillingModes} from './services/types/domain/subscription-types'

// Types de checkout Stripe disponibles

export const env = createEnv({
  /*
   * Variables serveur. Celles-ci ne sont accessibles que du côté serveur.
   * Ne commencent pas par NEXT_PUBLIC_.
   */
  server: {
    // Base de données
    DATABASE_URL: z.string().url(),

    // Authentification
    AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.string().url(),

    // Email
    RESEND_API_KEY: z.string().min(1),
    EMAIL_FROM: z.string().email(),
    EMAIL_TO: z.string().email(),

    // Logging
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

    // Supabase (serveur)
    SUPABASE_URL: z.string().url(),
    SUPABASE_ANON_KEY: z.string().min(1),
    SUPABASE_BUCKET: z.string().min(1),

    // Upload de fichiers
    MAX_FILE_SIZE: z
      .string()
      .transform((val) => Number(val))
      .default('5242880'),
    ALLOWED_MIME_TYPES: z.string().min(1),
    STORAGE_TYPE: z.string().optional(),

    // Stripe (serveur)
    STRIPE_SECRET_KEY: z.string().min(1),

    STRIPE_APP_WEBHOOK_SECRET: z.string().min(1),
    STRIPE_WEBHOOK_SECRET: z.string().min(1),

    // OAuth (optionnel)
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),

    // Environnement
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
  },

  /*
   * Variables client. Celles-ci sont exposées au client.
   * Doivent commencer par NEXT_PUBLIC_.
   */
  client: {
    // URL de l'application
    NEXT_PUBLIC_APP_URL: z.string().url(),

    // Stripe (client)
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
    NEXT_PUBLIC_STRIPE_CHECKOUT_TYPE: StripeCheckoutTypeSchema.default(
      'EmbededForm' as StripeCheckoutType
    ),

    // Better Auth (client)
    NEXT_PUBLIC_BETTER_AUTH_REQUIRE_EMAIL_VERIFICATION: z
      .string()
      .transform((val) => val === 'true')
      .default('true'),
    NEXT_PUBLIC_BETTER_AUTH_2FA_SKIP_VERIFICATION_ON_ENABLE: z
      .string()
      .transform((val) => val === 'true')
      .default('true'),
    NEXT_PUBLIC_BETTER_AUTH_2FA_ENABLE: z
      .string()
      .transform((val) => val === 'true')
      .default('false'),
    NEXT_PUBLIC_BETTER_AUTH_TOKEN_MANAGEMENT: z
      .string()
      .transform((val) => val === 'true')
      .default('true'),
    NEXT_PUBLIC_BETTER_AUTH_CHANGE_PASSWORD: z
      .string()
      .transform((val) => val === 'true')
      .default('true'),
    NEXT_PUBLIC_BETTER_AUTH_CHANGE_EMAIL: z
      .string()
      .transform((val) => val === 'true')
      .default('true'),

    // API URL (optionnel)
    NEXT_PUBLIC_API_URL: z.string().url().optional(),
    NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY: z.string().min(1),
    NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_YEARLY: z.string().min(1),
    NEXT_PUBLIC_STRIPE_PRICE_ID_LIFETIME: z.string().min(1),
    NEXT_PUBLIC_STRIPE_PRICE_ID_ENTREPRISE_MONTHLY: z.string().min(1),
    NEXT_PUBLIC_STRIPE_PRICE_ID_ENTREPRISE_YEARLY: z.string().min(1),
    NEXT_PUBLIC_BILLING_MODE: z
      .enum([BillingModes.USER, BillingModes.ORGANIZATION])
      .default(BillingModes.USER),
  },

  /*
   * Vous ne pouvez pas détruire `process.env` en mode développement de Vercel,
   * vous devez donc vous en contenter :
   */
  runtimeEnv: {
    // Variables serveur
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    EMAIL_TO: process.env.EMAIL_TO,
    LOG_LEVEL: process.env.LOG_LEVEL,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_BUCKET: process.env.SUPABASE_BUCKET,
    MAX_FILE_SIZE: process.env.MAX_FILE_SIZE,
    ALLOWED_MIME_TYPES: process.env.ALLOWED_MIME_TYPES,
    STORAGE_TYPE: process.env.STORAGE_TYPE,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY:
      process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY,
    NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_YEARLY:
      process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_YEARLY,
    NEXT_PUBLIC_STRIPE_PRICE_ID_LIFETIME:
      process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_LIFETIME,
    NEXT_PUBLIC_STRIPE_PRICE_ID_ENTREPRISE_MONTHLY:
      process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ENTREPRISE_MONTHLY,
    NEXT_PUBLIC_STRIPE_PRICE_ID_ENTREPRISE_YEARLY:
      process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ENTREPRISE_YEARLY,
    STRIPE_APP_WEBHOOK_SECRET: process.env.STRIPE_APP_WEBHOOK_SECRET,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    NODE_ENV: process.env.NODE_ENV,

    // Variables client
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_STRIPE_CHECKOUT_TYPE:
      process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_TYPE,
    NEXT_PUBLIC_BETTER_AUTH_REQUIRE_EMAIL_VERIFICATION:
      process.env.NEXT_PUBLIC_BETTER_AUTH_REQUIRE_EMAIL_VERIFICATION,
    NEXT_PUBLIC_BETTER_AUTH_2FA_SKIP_VERIFICATION_ON_ENABLE:
      process.env.NEXT_PUBLIC_BETTER_AUTH_2FA_SKIP_VERIFICATION_ON_ENABLE,
    NEXT_PUBLIC_BETTER_AUTH_2FA_ENABLE:
      process.env.NEXT_PUBLIC_BETTER_AUTH_2FA_ENABLE,
    NEXT_PUBLIC_BETTER_AUTH_TOKEN_MANAGEMENT:
      process.env.NEXT_PUBLIC_BETTER_AUTH_TOKEN_MANAGEMENT,
    NEXT_PUBLIC_BETTER_AUTH_CHANGE_PASSWORD:
      process.env.NEXT_PUBLIC_BETTER_AUTH_CHANGE_PASSWORD,
    NEXT_PUBLIC_BETTER_AUTH_CHANGE_EMAIL:
      process.env.NEXT_PUBLIC_BETTER_AUTH_CHANGE_EMAIL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_BILLING_MODE: process.env.NEXT_PUBLIC_BILLING_MODE,
  },

  /*
   * Run `build` ou `dev` avec SKIP_ENV_VALIDATION pour ignorer la validation de l'environnement.
   * Cela est particulièrement utile pour Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  /*
   * Rend le type des variables d'environnement vides comme chaîne au lieu de undefined.
   */
  emptyStringAsUndefined: true,

  isServer: process.env.NODE_ENV === 'test' || typeof window === 'undefined',
})
