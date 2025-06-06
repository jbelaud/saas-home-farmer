import z from 'zod'

export const userFormSchema = z.object({
  id: z.string().uuid('Invalid UUID').optional(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  image: z.string().url('Invalid URL').optional().or(z.literal('')),
  visibility: z.enum(['public', 'private']),
})
export type UserFormSchemaType = z.infer<typeof userFormSchema>
