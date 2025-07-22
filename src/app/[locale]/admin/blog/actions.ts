'use server'

import {revalidatePath} from 'next/cache'

import {
  deletePostService,
  updatePostService,
} from '@/services/facades/post-service-facade'
import {POST_STATUS} from '@/services/types/domain/post-types'

export type FormState = {
  success: boolean
  message: string
}

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
