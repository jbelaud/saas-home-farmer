import z from 'zod'

import {
  languageSchema,
  notificationChannelSchema,
  themeSchema,
} from '@/services/validation/user-validation'

export const userFormSchema = z.object({
  id: z.string().uuid('Invalid UUID').optional(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  image: z.string().url('Invalid URL').optional().or(z.literal('')),
  visibility: z.enum(['public', 'private']),
})
export type UserFormSchemaType = z.infer<typeof userFormSchema>

export const settingsFormSchema = z.object({
  userId: z.string().uuid(),
  theme: themeSchema.optional(),
  language: languageSchema.optional(),
  timezone: z.string().optional(),
  twoFactorType: z.enum(['otp', 'totp']).optional(),
  enableEmailNotifications: z.boolean().optional(),
  enablePushNotifications: z.boolean().optional(),
  notificationChannel: notificationChannelSchema.optional(),
  emailDigest: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
})

export type SettingsFormSchemaType = z.infer<typeof settingsFormSchema>
