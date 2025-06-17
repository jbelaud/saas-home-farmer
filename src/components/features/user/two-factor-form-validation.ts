import z from 'zod'

export const twoFactorFormSchema = z.object({
  action: z.enum(['enable', 'disable'], {
    required_error: 'Veuillez sélectionner une action',
  }),
  password: z.string().min(1, 'Le mot de passe est requis'),
})

export type TwoFactorFormSchemaType = z.infer<typeof twoFactorFormSchema>

export const twoFactorSetupSchema = z.object({
  secret: z.string().min(1, 'Le secret est requis'),
  backupCodes: z
    .array(z.string())
    .min(8, 'Au moins 8 codes de sauvegarde sont requis'),
})

export type TwoFactorSetupSchemaType = z.infer<typeof twoFactorSetupSchema>
