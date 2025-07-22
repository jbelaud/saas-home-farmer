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
  deletePostService,
  updatePostService,
  updatePostWithTranslationsService,
} from '@/services/facades/post-service-facade'
import {
  CreatePostTranslation,
  POST_STATUS,
  SupportedLanguage,
} from '@/services/types/domain/post-types'

// Types pour les traductions sans postId (pour les Server Actions)
type TranslationInput = {
  language: SupportedLanguage
  title: string
  slug: string
  description: string
  content: string
  metaTitle: string
  metaDescription: string
  metaKeywords: string
}

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

/**
 * Nettoie un hashtag pour qu'il respecte les règles de validation
 */
function sanitizeHashtag(input: string): string {
  return input
    .trim()
    .replace(/^#/, '') // Enlever # du début si présent
    .replace(/[^a-zA-Z0-9_]/g, '') // Ne garder que lettres, chiffres et underscores
    .toLowerCase() // Convertir en minuscules
}

/**
 * Nettoie une liste de hashtags
 */
function sanitizeHashtags(hashtags: string[]): string[] {
  return hashtags
    .map(sanitizeHashtag)
    .filter((tag) => tag.length >= 2) // Garder seulement les hashtags de 2+ caractères
    .filter((tag, index, array) => array.indexOf(tag) === index) // Supprimer les doublons
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

    const translationsData: TranslationInput[] = validatedData.translations.map(
      (translation) => ({
        language: translation.language as SupportedLanguage,
        title: translation.title,
        slug: translation.slug,
        description: translation.description || '',
        content: translation.content || '',
        metaTitle: translation.metaTitle || '',
        metaDescription: translation.metaDescription || '',
        metaKeywords: translation.metaKeywords || '',
      })
    )

    // Séparation des hashtags existants (IDs) et nouveaux (noms)
    const existingHashtags = validatedData.hashtags || []
    const newHashtagsToCreate = sanitizeHashtags(
      validatedData.newHashtags || []
    )

    // Création du post avec traductions
    // Convertir TranslationInput en CreatePostTranslation en ajoutant un postId temporaire
    const translationsWithPostId = translationsData.map((t) => ({
      ...t,
      postId: '', // Sera remplacé par le service
    }))

    await createPostWithTranslationsService(
      postData,
      translationsWithPostId as CreatePostTranslation[],
      existingHashtags,
      newHashtagsToCreate
    )

    // Revalidation du cache
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
        message: error.message,
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

export async function updatePostCompleteAction(
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

    const translationsData: TranslationInput[] = validatedData.translations.map(
      (translation) => ({
        language: translation.language as SupportedLanguage,
        title: translation.title,
        slug: translation.slug,
        description: translation.description || '',
        content: translation.content || '',
        metaTitle: translation.metaTitle || '',
        metaDescription: translation.metaDescription || '',
        metaKeywords: translation.metaKeywords || '',
      })
    )

    // Séparation des hashtags existants (IDs) et nouveaux (noms)
    const existingHashtags = validatedData.hashtags || []
    const newHashtagsToCreate = sanitizeHashtags(
      validatedData.newHashtags || []
    )

    // Mise à jour du post avec traductions
    // Convertir TranslationInput en CreatePostTranslation en ajoutant un postId temporaire
    const translationsWithPostId = translationsData.map((t) => ({
      ...t,
      postId: postId, // Utiliser l'ID du post existant
    }))

    await updatePostWithTranslationsService(
      postData,
      translationsWithPostId as CreatePostTranslation[],
      existingHashtags,
      newHashtagsToCreate
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
        message: error.message,
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

// Action simple pour mise à jour rapide depuis la liste
export async function updatePostAction(
  id: string,
  formData: FormData
): Promise<FormState> {
  try {
    const status = formData.get('status') as string
    const categoryId = formData.get('categoryId') as string

    // Validation basique
    if (
      !status ||
      !Object.values(POST_STATUS).includes(
        status as 'draft' | 'published' | 'archived'
      )
    ) {
      return {
        success: false,
        message: 'Statut invalide',
      }
    }

    await updatePostService({
      id,
      status: status as 'draft' | 'published' | 'archived',
      categoryId: categoryId || null,
    })

    revalidatePath('/admin/blog')
    return {
      success: true,
      message: 'Post mis à jour avec succès',
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du post:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Une erreur est survenue',
    }
  }
}

export async function deletePostAction(id: string): Promise<FormState> {
  try {
    await deletePostService(id)

    revalidatePath('/admin/blog')
    return {
      success: true,
      message: 'Post supprimé avec succès',
    }
  } catch (error) {
    console.error('Erreur lors de la suppression du post:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Une erreur est survenue',
    }
  }
}
