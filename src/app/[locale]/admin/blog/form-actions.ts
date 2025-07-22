'use server'

import {revalidatePath} from 'next/cache'
import * as z from 'zod'

import {getAuthUser} from '@/services/authentication/auth-service'
import {
  canCreatePost,
  canUpdatePost,
} from '@/services/authorization/post-authorization'
import {AuthorizationError} from '@/services/errors/authorization-error'
import {ValidationError} from '@/services/errors/validation-error'
import {
  createPostWithTranslationsService,
  updatePostWithTranslationsService,
} from '@/services/facades/post-service-facade'
import {SupportedLanguage} from '@/services/types/domain/post-types'

// Schémas de validation pour les Server Actions
const translationSchema = z.object({
  language: z.enum(['fr', 'en', 'es']),
  title: z.string().min(1, 'Le titre est requis'),
  slug: z.string().min(1, 'Le slug est requis'),
  description: z.string().optional(),
  content: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
})

const postFormSchema = z.object({
  status: z.enum(['draft', 'published', 'archived']),
  categoryId: z.string().optional(),
  translations: z
    .array(translationSchema)
    .min(1, 'Au moins une traduction est requise'),
  hashtags: z.array(z.string()).optional(),
  newHashtags: z.array(z.string()).optional(),
})

export type PostFormData = z.infer<typeof postFormSchema>

export type FormState = {
  success: boolean
  message: string
  fieldErrors?: Record<string, string[]>
}

export async function createPostAction(data: PostFormData): Promise<FormState> {
  try {
    // Validation des données
    const validatedData = postFormSchema.parse(data)

    // Vérification des permissions
    const canCreate = await canCreatePost()
    if (!canCreate) {
      throw new AuthorizationError(
        "Vous n'avez pas les permissions pour créer un post"
      )
    }

    // Récupération de l'utilisateur authentifié
    const user = await getAuthUser()
    if (!user) {
      throw new AuthorizationError('Utilisateur non authentifié')
    }

    // Transformation des données pour le service
    const postData = {
      status: validatedData.status,
      authorId: user.id,
      categoryId:
        validatedData.categoryId === 'none' ? null : validatedData.categoryId,
    }

    const translationsData = validatedData.translations.map((translation) => ({
      language: translation.language as SupportedLanguage,
      title: translation.title,
      slug: translation.slug,
      description: translation.description || '',
      content: translation.content || '',
      metaTitle: translation.metaTitle || '',
      metaDescription: translation.metaDescription || '',
      metaKeywords: translation.metaKeywords || '',
    }))

    // Combinaison des hashtags existants et nouveaux
    const allHashtags = [
      ...(validatedData.hashtags || []),
      ...(validatedData.newHashtags || []),
    ]

    // Création du post avec traductions
    await createPostWithTranslationsService(
      postData,
      translationsData,
      allHashtags
    )

    // Revalidation du cache et redirection
    revalidatePath('/admin/blog')

    return {
      success: true,
      message: 'Post créé avec succès',
    }
  } catch (error) {
    console.error('Erreur lors de la création du post:', error)

    if (error instanceof ValidationError) {
      return {
        success: false,
        message: 'Données invalides',
        fieldErrors: error.fieldErrors,
      }
    }

    if (error instanceof AuthorizationError) {
      return {
        success: false,
        message: error.message,
      }
    }

    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string[]> = {}
      error.errors.forEach((err) => {
        const path = err.path.join('.')
        if (!fieldErrors[path]) {
          fieldErrors[path] = []
        }
        fieldErrors[path].push(err.message)
      })

      return {
        success: false,
        message: 'Données invalides',
        fieldErrors,
      }
    }

    return {
      success: false,
      message: 'Une erreur inattendue est survenue',
    }
  }
}

export async function updatePostAction(
  postId: string,
  data: PostFormData
): Promise<FormState> {
  try {
    // Validation des données
    const validatedData = postFormSchema.parse(data)

    // Vérification des permissions
    const canUpdate = await canUpdatePost(postId)
    if (!canUpdate) {
      throw new AuthorizationError(
        "Vous n'avez pas les permissions pour modifier ce post"
      )
    }

    // Transformation des données pour le service
    const postData = {
      id: postId,
      status: validatedData.status,
      categoryId:
        validatedData.categoryId === 'none' ? null : validatedData.categoryId,
    }

    const translationsData = validatedData.translations.map((translation) => ({
      language: translation.language as SupportedLanguage,
      title: translation.title,
      slug: translation.slug,
      description: translation.description || '',
      content: translation.content || '',
      metaTitle: translation.metaTitle || '',
      metaDescription: translation.metaDescription || '',
      metaKeywords: translation.metaKeywords || '',
    }))

    // Combinaison des hashtags existants et nouveaux
    const allHashtags = [
      ...(validatedData.hashtags || []),
      ...(validatedData.newHashtags || []),
    ]

    // Mise à jour du post avec traductions
    await updatePostWithTranslationsService(
      postData,
      translationsData,
      allHashtags
    )

    // Revalidation du cache
    revalidatePath('/admin/blog')
    revalidatePath(`/admin/blog/${postId}/edit`)

    return {
      success: true,
      message: 'Post mis à jour avec succès',
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du post:', error)

    if (error instanceof ValidationError) {
      return {
        success: false,
        message: 'Données invalides',
        fieldErrors: error.fieldErrors,
      }
    }

    if (error instanceof AuthorizationError) {
      return {
        success: false,
        message: error.message,
      }
    }

    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string[]> = {}
      error.errors.forEach((err) => {
        const path = err.path.join('.')
        if (!fieldErrors[path]) {
          fieldErrors[path] = []
        }
        fieldErrors[path].push(err.message)
      })

      return {
        success: false,
        message: 'Données invalides',
        fieldErrors,
      }
    }

    return {
      success: false,
      message: 'Une erreur inattendue est survenue',
    }
  }
}
