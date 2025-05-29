import z from 'zod'

export const authLoginFormSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
})

export const authRegisterFormSchema = authLoginFormSchema
  .extend({
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    confirmPassword: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })
