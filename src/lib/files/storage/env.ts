import {z} from 'zod'

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  STORAGE_TYPE: z.enum(['supabase', 's3']).default('supabase'),
  SUPABASE_BUCKET: z.string().min(1),
  MAX_FILE_SIZE: z.string().transform(Number).default('5242880'), // 5MB
  ALLOWED_MIME_TYPES: z
    .string()
    .default('image/jpeg,image/png,image/gif,application/pdf'),
})

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  STORAGE_TYPE: process.env.STORAGE_TYPE,
  SUPABASE_BUCKET: process.env.SUPABASE_BUCKET,
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE,
  ALLOWED_MIME_TYPES: process.env.ALLOWED_MIME_TYPES,
})

export const getStorageConfig = () => {
  const basePath = env.NODE_ENV === 'production' ? 'prod' : 'dev'

  return {
    type: env.STORAGE_TYPE,
    config: {
      bucket: env.SUPABASE_BUCKET,
      basePath,
      maxFileSize: env.MAX_FILE_SIZE,
      allowedMimeTypes: env.ALLOWED_MIME_TYPES.split(','),
    },
  }
}
