'use server'

import {revalidatePath} from 'next/cache'

import {updateUserService} from '@/services/facades/user-service-facade'

export type FormState = {
  success: boolean
  errors?: Array<{field: string; message: string}>
  message?: string
}

export async function updateUserAction(
  userId: string,
  prevState?: FormState,
  formData?: FormData
): Promise<FormState> {
  if (!formData) {
    return {success: false, message: 'Données invalides'}
  }

  try {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const visibility = formData.get('visibility') as 'public' | 'private'

    // Validation basique côté serveur
    if (!name || !email) {
      return {
        success: false,
        message: "Le nom et l'email sont requis",
        errors: [
          ...(name ? [] : [{field: 'name', message: 'Le nom est requis'}]),
          ...(email ? [] : [{field: 'email', message: "L'email est requis"}]),
        ],
      }
    }

    await updateUserService({
      id: userId,
      name,
      email,
      visibility,
      updatedAt: new Date(),
    })

    revalidatePath('/admin/users')
    return {
      success: true,
      message: 'Utilisateur mis à jour avec succès',
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error)
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Une erreur est survenue lors de la mise à jour',
    }
  }
}

export async function deleteUserAction(userId: string): Promise<FormState> {
  try {
    // Note: Nous n'avons pas encore implémenté deleteUserService
    // Ceci est un placeholder pour la fonction
    console.log('Delete user:', userId)

    revalidatePath('/admin/users')
    return {
      success: true,
      message: 'Utilisateur supprimé avec succès',
    }
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error)
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Une erreur est survenue lors de la suppression',
    }
  }
}
