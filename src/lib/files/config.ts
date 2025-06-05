import {z} from 'zod'

const fileConfigSchema = z.object({
  bucket: z.string().min(1),
  maxFileSize: z.number().default(5 * 1024 * 1024), // 5MB par défaut
  allowedMimeTypes: z
    .array(z.string())
    .default(['image/jpeg', 'image/png', 'image/gif', 'application/pdf']),
  basePath: z.record(z.string()).default({
    development: 'dev',
    production: 'prod',
  }),
})

export const fileConfig = fileConfigSchema.parse({
  bucket: process.env.SUPABASE_BUCKET || 'default-bucket',
  maxFileSize: Number(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024,
  allowedMimeTypes: process.env.ALLOWED_MIME_TYPES?.split(',') || [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
  ],
  basePath: {
    development: 'dev',
    production: 'prod',
  },
})

export const getBasePath = () => {
  const env = process.env.NODE_ENV || 'development'
  return fileConfig.basePath[env as keyof typeof fileConfig.basePath]
}
