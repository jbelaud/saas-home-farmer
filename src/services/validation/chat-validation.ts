import {z} from 'zod'

export const chatMessageSchema = z.object({
  content: z
    .string()
    .min(1, 'Le message ne peut pas être vide')
    .max(4000, 'Le message est trop long'),
  role: z.enum(['user', 'assistant']),
  conversationId: z.string().uuid().optional(),
})

export const ollamaRequestSchema = z.object({
  model: z.string().min(1, 'Le modèle est requis'),
  prompt: z.string().min(1, 'Le prompt ne peut pas être vide'),
  stream: z.boolean().optional().default(true),
})

export const conversationIdSchema = z
  .string()
  .uuid('ID de conversation invalide')
