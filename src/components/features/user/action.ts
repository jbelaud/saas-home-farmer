'use server'

import {revalidatePath} from 'next/cache'

import {getAuthUser} from '@/services/authentication/auth-utils'
import {updateUserService} from '@/services/facades/user-service-facade'
import {UpdateUser} from '@/services/types/domain/user-types'

import {userFormSchema, UserFormSchemaType} from './user-form-validation'

type ValidationError = {
  field: keyof UserFormSchemaType
  message: string
}
export type FormState = {
  success: boolean
  errors?: ValidationError[]
  message?: string
}
export async function updateUserAction(
  prevState?: FormState,
  formData?: FormData
): Promise<FormState> {
  const user = await getAuthUser()
  if (!user) {
    return {success: false, message: 'User not found'}
  }
  if (!formData) {
    return {success: false, message: 'Invalid data'}
  }
  // Extraire les données du FormData
  const userData: UpdateUser = {
    id: formData.get('id') as string,
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    image: formData.get('image') as string,
    visibility: formData.get('visibility') as 'public' | 'private',
  }

  // STEP 1 : Valider les données avec le schéma Zod coté back
  const validationResult = userFormSchema.safeParse(userData)

  if (!validationResult.success) {
    // Récupérer les messages d'erreur a plat
    const errorMessages = validationResult.error.errors
      .map((err) => `${err.path.join('.')}: ${err.message}`)
      .join(', ')
    // Récupérer les messages d'erreur pour chaque champs (normalement déjà fait par le front RHF)
    const validationErrors: ValidationError[] =
      validationResult.error.errors.map((err) => ({
        field: err.path[0] as keyof UserFormSchemaType,
        message: `zod server error ${err.message}`,
      }))
    return {
      success: false,
      message: `Validation failed: ${errorMessages}`,
      errors: validationErrors,
    }
  }
  // STEP 2 : Régles customs coté backend
  if (userData.name?.toString().includes('  ')) {
    return {
      success: false,
      errors: [
        {
          field: 'name',
          message: 'Custom server error : Name must not contain 2 spaces',
        },
      ],
      message: 'Server Error : Name must not contain 2 spaces',
    }
  }

  const validatedData = validationResult.data as UpdateUser

  try {
    await updateUserService(validatedData)
    revalidatePath('/account')
    return {success: true, message: 'Profile updated successfully'}
  } catch (error) {
    console.error(error)
    return {success: false, message: 'Failed to update profile'}
  }
}
