import {z} from 'zod'

import {
  CreateUser,
  CreateUserSettings,
  Language,
  NotificationChannel,
  Theme,
  UpdateUser,
  UpdateUserSettings,
  User,
  UserVisibility,
} from '../types/domain/user-types'

export const baseUserServiceSchema = z.object({
  email: z.string().email({
    message: "L'email n'est pas valide.",
  }),
}) satisfies z.Schema<Pick<User, 'email'>>

export const createUserServiceSchema = baseUserServiceSchema.extend({
  name: z
    .string()
    .min(3, {
      message: 'Le nom doit contenir au moins 3 caractères.',
    })
    .max(30, {
      message: 'Le nom ne doit pas contenir plus de 30 caractères.',
    }),
  password: z.string().optional(),
  email: z.string().email({
    message: "L'email n'est pas valide.",
  }),
}) satisfies z.Schema<CreateUser>

export const updateUserServiceSchema = createUserServiceSchema.extend({
  id: z.string(),
  image: z.string().nullable().optional(),
  visibility: z.enum(['public', 'private']) satisfies z.Schema<UserVisibility>,
  password: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date(),
}) satisfies z.Schema<UpdateUser>

export const userUuidSchema = z.string().uuid({
  message: "L'identifiant n'est pas valide.",
})

export const themeSchema = z.enum([
  'light',
  'dark',
  'system',
]) satisfies z.Schema<Theme>

export const languageSchema = z.enum([
  'fr',
  'en',
  'es',
]) satisfies z.Schema<Language>

export const notificationChannelSchema = z.enum([
  'email',
  'push',
  'both',
  'none',
]) satisfies z.Schema<NotificationChannel>

// Schémas pour les paramètres utilisateur
export const createUserSettingsServiceSchema = z.object({
  userId: z.string().uuid({
    message: "L'identifiant de l'utilisateur n'est pas valide.",
  }),

  theme: themeSchema,
  language: languageSchema,
  timezone: z.string().default('Europe/Paris'),
  enableTwoFactor: z.boolean().default(false),
  enableEmailNotifications: z.boolean().default(true),
  enablePushNotifications: z.boolean().default(true),
  notificationChannel: notificationChannelSchema.default('both'),
  emailDigest: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),
  twoFactorType: z.enum(['otp', 'totp']).default('totp'),
}) satisfies z.Schema<CreateUserSettings>

export const updateUserSettingsServiceSchema = createUserSettingsServiceSchema
  .partial()
  .extend({
    userId: z.string().uuid({
      message: "L'identifiant de l'utilisateur n'est pas valide.",
    }),
  }) satisfies z.Schema<UpdateUserSettings>

export const userSettingsUuidSchema = z.string().uuid()
