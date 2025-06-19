import {z} from 'zod'

export const changeEmailFormSchema = z.object({
  newEmail: z
    .string()
    .min(1, "L'email est requis")
    .email("Format d'email invalide"),
})

export type ChangeEmailFormSchemaType = z.infer<typeof changeEmailFormSchema>
