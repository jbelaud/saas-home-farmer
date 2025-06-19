'use server'

import {revalidatePath} from 'next/cache'
import {headers} from 'next/headers'

import {requireActionAuth} from '@/app/dal/user-dal'
import {auth} from '@/lib/better-auth/auth'
import {APP_NAME} from '@/lib/constants'
import {uploadImageForEntityService} from '@/services/facades/file-service-facade'
import {updateUserService} from '@/services/facades/user-service-facade'
import {updateUserSettingsService} from '@/services/facades/user-service-facade'
import {
  EntityTypeConst,
  FileCategoryConst,
} from '@/services/types/domain/file-types'
import {
  Language,
  NotificationChannel,
  Theme,
  UpdateUser,
  UpdateUserSettings,
} from '@/services/types/domain/user-types'

import {
  settingsFormSchema,
  SettingsFormSchemaType,
  userFormSchema,
  UserFormSchemaType,
} from '../admin/users/user-form-validation'
import {
  changePasswordFormSchema,
  ChangePasswordFormSchemaType,
} from './change-password-form-validation'
import {
  twoFactorFormSchema,
  TwoFactorFormSchemaType,
} from './two-factor-form-validation'

type ValidationError<T = UserFormSchemaType> = {
  field: keyof T
  message: string
}

export type FormState<T = UserFormSchemaType> = {
  success: boolean
  errors?: ValidationError<T>[]
  message?: string
}

export type UploadImageState = {
  success: boolean
  message?: string
  imageUrl?: string
}

export type TwoFactorState = {
  success: boolean
  message?: string
  totpURI?: string
  backupCodes?: string[]
  errors?: ValidationError<TwoFactorFormSchemaType>[]
}

export type VerifyTotpState = {
  success: boolean
  message?: string
  errors?: ValidationError<{code: string}>[]
}

export type ChangePasswordState = {
  success: boolean
  message?: string
  errors?: ValidationError<ChangePasswordFormSchemaType>[]
}

export async function updateUserAction(
  prevState?: FormState<UserFormSchemaType>,
  formData?: FormData
): Promise<FormState<UserFormSchemaType>> {
  const user = await requireActionAuth()
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

export async function uploadProfileImageAction(
  prevState?: UploadImageState,
  formData?: FormData
): Promise<UploadImageState> {
  const user = await requireActionAuth()
  if (!user) {
    return {success: false, message: 'User not found'}
  }
  if (!formData) {
    return {success: false, message: 'Invalid data'}
  }

  const file = formData.get('file') as File
  if (!file || file.size === 0) {
    return {success: false, message: 'No file provided'}
  }

  try {
    const result = await uploadImageForEntityService({
      file,
      entityType: EntityTypeConst.USER,
      entityId: user.id,
      category: FileCategoryConst.PROFILE,
    })

    return {
      success: true,
      message: 'Image uploadée avec succès',
      imageUrl: result.url,
    }
  } catch (error) {
    console.error("Erreur lors de l'upload:", error)
    return {
      success: false,
      message: "Impossible d'uploader l'image. Veuillez réessayer.",
    }
  }
}

export async function updateUserSettingsAction(
  prevState?: FormState<SettingsFormSchemaType>,
  formData?: FormData
): Promise<FormState<SettingsFormSchemaType>> {
  const user = await requireActionAuth()
  if (!user) {
    return {success: false, message: 'Utilisateur non trouvé'}
  }

  if (!formData) {
    return {success: false, message: 'Données invalides'}
  }

  // Construire l'objet settings en ne prenant que les champs présents
  const settingsData: UpdateUserSettings = {
    userId: user.id,
  }

  // Ajouter seulement les champs qui sont présents dans le FormData
  const theme = formData.get('theme')
  if (theme) settingsData.theme = theme as Theme

  const language = formData.get('language')
  if (language) settingsData.language = language as Language

  const timezone = formData.get('timezone')
  if (timezone) settingsData.timezone = timezone as string

  const twoFactorType = formData.get('twoFactorType')
  if (twoFactorType)
    settingsData.twoFactorType = twoFactorType as 'otp' | 'totp'

  const enableEmailNotifications = formData.get('enableEmailNotifications')
  if (enableEmailNotifications !== null) {
    settingsData.enableEmailNotifications = enableEmailNotifications === 'true'
  }

  const enablePushNotifications = formData.get('enablePushNotifications')
  if (enablePushNotifications !== null) {
    settingsData.enablePushNotifications = enablePushNotifications === 'true'
  }

  const notificationChannel = formData.get('notificationChannel')
  if (notificationChannel) {
    settingsData.notificationChannel =
      notificationChannel as NotificationChannel
  }

  const emailDigest = formData.get('emailDigest')
  if (emailDigest !== null) {
    settingsData.emailDigest = emailDigest === 'true'
  }

  const marketingEmails = formData.get('marketingEmails')
  if (marketingEmails !== null) {
    settingsData.marketingEmails = marketingEmails === 'true'
  }

  const validationResult = settingsFormSchema.safeParse(settingsData)

  if (!validationResult.success) {
    const validationErrors = validationResult.error.errors.map((err) => ({
      field: err.path[0] as keyof SettingsFormSchemaType,
      message: err.message,
    }))
    return {
      success: false,
      message: 'Erreur de validation',
      errors: validationErrors,
    }
  }

  try {
    await updateUserSettingsService(validationResult.data)
    revalidatePath('/account')
    return {success: true, message: 'Paramètres mis à jour avec succès'}
  } catch (error) {
    console.error(error)
    return {success: false, message: 'Échec de la mise à jour des paramètres'}
  }
}

export async function update2FAAction(
  prevState?: TwoFactorState,
  formData?: FormData
): Promise<TwoFactorState> {
  const user = await requireActionAuth()
  if (!user) {
    return {success: false, message: 'Utilisateur non trouvé'}
  }

  if (!formData) {
    return {success: false, message: 'Données invalides'}
  }

  const twoFactorData = {
    action: formData.get('action') as 'enable' | 'disable',
    password: formData.get('password') as string,
  }

  // Validation avec Zod
  const validationResult = twoFactorFormSchema.safeParse(twoFactorData)

  if (!validationResult.success) {
    const validationErrors = validationResult.error.errors.map((err) => ({
      field: err.path[0] as keyof TwoFactorFormSchemaType,
      message: err.message,
    }))
    return {
      success: false,
      message: 'Erreur de validation',
      errors: validationErrors,
    }
  }

  const {action, password} = validationResult.data

  try {
    if (action === 'enable') {
      // Activer le 2FA
      const result = await auth.api.enableTwoFactor({
        headers: await headers(),
        body: {
          password,
          issuer: APP_NAME,
        },
      })
      console.log('enableTwoFactor result', result)
      // better-auth retourne { totpURI: string; backupCodes: string[] } en cas de succès
      if (result.totpURI && result.backupCodes) {
        revalidatePath('/account')
        return {
          success: true,
          message:
            "Authentification à deux facteurs activée avec succès. Veuillez configurer votre application d'authentification.",
          totpURI: result.totpURI,
          backupCodes: result.backupCodes,
        }
      } else {
        return {
          success: false,
          message: "Échec de l'activation du 2FA",
        }
      }
    } else {
      // Désactiver le 2FA
      const result = await auth.api.disableTwoFactor({
        headers: await headers(),
        body: {
          password,
        },
      })

      // better-auth retourne { status: boolean } pour disable
      if (result.status) {
        revalidatePath('/account')
        return {
          success: true,
          message: 'Authentification à deux facteurs désactivée avec succès',
        }
      } else {
        return {
          success: false,
          message: 'Échec de la désactivation du 2FA',
        }
      }
    }
  } catch (error) {
    console.error('Erreur 2FA:', error)
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Erreur inattendue lors de la configuration 2FA',
    }
  }
}

export async function verifyTotpAction(
  prevState?: VerifyTotpState,
  formData?: FormData
): Promise<VerifyTotpState> {
  const user = await requireActionAuth()
  if (!user) {
    return {success: false, message: 'Utilisateur non trouvé'}
  }

  if (!formData) {
    return {success: false, message: 'Données invalides'}
  }

  const code = formData.get('code') as string

  // Validation simple du code
  if (!code || code.trim().length === 0) {
    return {
      success: false,
      message: 'Le code ne peut pas être vide',
      errors: [
        {
          field: 'code',
          message: 'Le code ne peut pas être vide',
        },
      ],
    }
  }

  try {
    console.log('verifyTOTP code', code)
    const result = await auth.api.verifyTOTP({
      headers: await headers(),
      body: {
        code,
        trustDevice: true,
      },
    })
    console.log('verifyTOTP result', result)
    if (result.token) {
      revalidatePath('/account')
      return {
        success: true,
        message:
          'Code validé avec succès ! Votre 2FA est maintenant configuré.',
      }
    } else {
      return {
        success: false,
        message: 'Code incorrect. Veuillez réessayer.',
        errors: [
          {
            field: 'code',
            message: 'Code incorrect. Veuillez réessayer.',
          },
        ],
      }
    }
  } catch (error) {
    console.error('Erreur lors de la vérification TOTP:', error)
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Erreur inattendue lors de la vérification',
      errors: [
        {
          field: 'code',
          message: 'Erreur lors de la vérification du code',
        },
      ],
    }
  }
}

export async function changePasswordAction(
  prevState?: ChangePasswordState,
  formData?: FormData
): Promise<ChangePasswordState> {
  const user = await requireActionAuth()
  if (!user) {
    return {success: false, message: 'Utilisateur non trouvé'}
  }

  if (!formData) {
    return {success: false, message: 'Données invalides'}
  }

  const passwordData = {
    currentPassword: formData.get('currentPassword') as string,
    newPassword: formData.get('newPassword') as string,
    confirmPassword: formData.get('confirmPassword') as string,
  }

  // Validation avec Zod
  const validationResult = changePasswordFormSchema.safeParse(passwordData)

  if (!validationResult.success) {
    const validationErrors = validationResult.error.errors.map((err) => ({
      field: err.path[0] as keyof ChangePasswordFormSchemaType,
      message: err.message,
    }))
    return {
      success: false,
      message: 'Erreur de validation',
      errors: validationErrors,
    }
  }

  const {currentPassword, newPassword} = validationResult.data

  try {
    const result = await auth.api.changePassword({
      headers: await headers(),
      body: {
        currentPassword,
        newPassword,
      },
    })

    if (result) {
      revalidatePath('/account')
      return {
        success: true,
        message: 'Mot de passe changé avec succès',
      }
    } else {
      return {
        success: false,
        message: 'Échec du changement de mot de passe',
      }
    }
  } catch (error) {
    console.error('Erreur changement mot de passe:', error)
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Erreur inattendue lors du changement de mot de passe',
    }
  }
}
