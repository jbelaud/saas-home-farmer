import {
  countUnreadNotificationsByUserIdDao,
  createNotificationDao,
  deleteNotificationDao,
  deleteReadNotificationsByUserIdDao,
  getNotificationByIdDao,
  getNotificationsByUserIdDao,
  getUnreadNotificationsByUserIdDao,
  markAllNotificationsAsReadDao,
  markNotificationAsReadDao,
  updateNotificationDao,
} from '@/db/repositories/notification-repository'
import {
  getUserByIdDao,
  getUserSettingsByUserIdDao,
} from '@/db/repositories/user-repository'

import {
  canCreateNotification,
  canDeleteNotification,
  canManageNotifications,
  canReadNotification,
  canReadUserNotifications,
  canUpdateNotification,
} from './authorization/notification-authorization'
import {sendNotificationEmailService} from './email-service'
import {AuthorizationError} from './errors/authorization-error'
import {
  ValidationError,
  ValidationParsedZodError,
} from './errors/validation-error'
import {Pagination} from './types/common-type'
import {
  CreateNotification,
  CreateTypedNotification,
  NotificationType,
  UpdateNotification,
} from './types/domain/notification-types'
import {
  createNotificationServiceSchema,
  markAsReadNotificationServiceSchema,
  updateNotificationServiceSchema,
  uuidSchema,
} from './validation/notification-validation'

/**
 * Créer une nouvelle notification
 */
export const createNotificationService = async (
  notificationParams: CreateNotification
) => {
  // Validation des données
  const parsed = createNotificationServiceSchema.safeParse(notificationParams)
  if (!parsed.success) {
    throw new ValidationParsedZodError(parsed.error)
  }

  // Vérification des autorisations - admins ou utilisateur créant pour lui-même
  const canCreate = await canCreateNotification(parsed.data.userId)
  if (!canCreate) {
    throw new AuthorizationError(
      "Vous n'avez pas les droits pour créer des notifications"
    )
  }

  // Vérifier que l'utilisateur cible existe
  const targetUser = await getUserByIdDao(parsed.data.userId)
  if (!targetUser) {
    throw new ValidationError("L'utilisateur spécifié n'existe pas")
  }

  // Créer la notification
  const notification = await createNotificationDao(parsed.data)

  // Envoyer un email si les paramètres utilisateur l'autorisent
  try {
    const userSettings = await getUserSettingsByUserIdDao(parsed.data.userId)

    // Vérifier si l'utilisateur a activé les notifications email
    const shouldSendEmail =
      userSettings?.enableEmailNotifications &&
      (userSettings?.notificationChannel === 'email' ||
        userSettings?.notificationChannel === 'both')

    if (shouldSendEmail) {
      // Déterminer le type d'email selon le type de notification
      let emailType: 'info' | 'warning' | 'success' | 'error' = 'info'

      if (
        parsed.data.type === 'security_alert' ||
        parsed.data.type === 'password_changed'
      ) {
        emailType = 'warning'
      } else if (
        parsed.data.type === 'payment_succeeded' ||
        parsed.data.type === 'subscription_created'
      ) {
        emailType = 'success'
      } else if (
        parsed.data.type === 'payment_failed' ||
        parsed.data.type === 'user_banned'
      ) {
        emailType = 'error'
      }

      // Utiliser la langue définie dans les paramètres utilisateur
      const language = userSettings?.language || 'fr'

      await sendNotificationEmailService({
        email: targetUser.email,
        title: parsed.data.title,
        message: parsed.data.message,
        type: emailType,
        language,
      })
    }
  } catch (emailError) {
    // Ne pas faire échouer la création de notification si l'email échoue
    console.error(
      "Erreur lors de l'envoi de l'email de notification:",
      emailError
    )
  }

  return notification
}

/**
 * Créer une notification typée avec métadonnées
 */
export const createTypedNotificationService = async <
  T extends NotificationType,
>(
  notificationParams: CreateTypedNotification<T>
) => {
  return await createNotificationService(notificationParams)
}

/**
 * Récupérer une notification par ID
 */
export const getNotificationByIdService = async (id: string) => {
  // Validation de l'ID
  const parsedId = uuidSchema.safeParse(id)
  if (!parsedId.success) {
    throw new ValidationError("L'ID doit être un UUID valide")
  }

  // Vérification des autorisations
  const canRead = await canReadNotification(id)
  if (!canRead) {
    throw new AuthorizationError(
      "Vous n'avez pas les droits pour lire cette notification"
    )
  }

  return await getNotificationByIdDao(id)
}

/**
 * Récupérer les notifications d'un utilisateur avec pagination
 */
export const getNotificationsByUserIdService = async (
  userId: string,
  pagination: Pagination
) => {
  // Validation de l'ID utilisateur
  const parsedUserId = uuidSchema.safeParse(userId)
  if (!parsedUserId.success) {
    throw new ValidationError("L'ID utilisateur doit être un UUID valide")
  }

  // Vérification des autorisations
  const canRead = await canReadUserNotifications(userId)
  if (!canRead) {
    throw new AuthorizationError(
      "Vous n'avez pas les droits pour lire les notifications de cet utilisateur"
    )
  }

  return await getNotificationsByUserIdDao(userId, pagination)
}

/**
 * Récupérer les notifications non lues d'un utilisateur
 */
export const getUnreadNotificationsByUserIdService = async (
  userId: string,
  pagination: Pagination
) => {
  // Validation de l'ID utilisateur
  const parsedUserId = uuidSchema.safeParse(userId)
  if (!parsedUserId.success) {
    throw new ValidationError("L'ID utilisateur doit être un UUID valide")
  }

  // Vérification des autorisations
  const canRead = await canReadUserNotifications(userId)
  if (!canRead) {
    throw new AuthorizationError(
      "Vous n'avez pas les droits pour lire les notifications de cet utilisateur"
    )
  }

  return await getUnreadNotificationsByUserIdDao(userId, pagination)
}

/**
 * Compter les notifications non lues d'un utilisateur
 */
export const countUnreadNotificationsByUserIdService = async (
  userId: string
) => {
  // Validation de l'ID utilisateur
  const parsedUserId = uuidSchema.safeParse(userId)
  if (!parsedUserId.success) {
    throw new ValidationError("L'ID utilisateur doit être un UUID valide")
  }

  // Vérification des autorisations
  const canRead = await canReadUserNotifications(userId)
  if (!canRead) {
    throw new AuthorizationError(
      "Vous n'avez pas les droits pour lire les notifications de cet utilisateur"
    )
  }

  return await countUnreadNotificationsByUserIdDao(userId)
}

/**
 * Marquer une notification comme lue
 */
export const markNotificationAsReadService = async (id: string) => {
  // Validation des données
  const parsed = markAsReadNotificationServiceSchema.safeParse({id})
  if (!parsed.success) {
    throw new ValidationError("L'ID doit être un UUID valide")
  }

  // Vérification des autorisations
  const canUpdate = await canUpdateNotification(id)
  if (!canUpdate) {
    throw new AuthorizationError(
      "Vous n'avez pas les droits pour modifier cette notification"
    )
  }

  return await markNotificationAsReadDao(id)
}

/**
 * Marquer toutes les notifications d'un utilisateur comme lues
 */
export const markAllNotificationsAsReadService = async (userId: string) => {
  // Validation de l'ID utilisateur
  const parsedUserId = uuidSchema.safeParse(userId)
  if (!parsedUserId.success) {
    throw new ValidationError("L'ID utilisateur doit être un UUID valide")
  }

  // Vérification des autorisations
  const canRead = await canReadUserNotifications(userId)
  if (!canRead) {
    throw new AuthorizationError(
      "Vous n'avez pas les droits pour modifier les notifications de cet utilisateur"
    )
  }

  return await markAllNotificationsAsReadDao(userId)
}

/**
 * Mettre à jour une notification
 */
export const updateNotificationService = async (
  updateParams: UpdateNotification
) => {
  // Validation des données
  const parsed = updateNotificationServiceSchema.safeParse(updateParams)
  if (!parsed.success) {
    throw new ValidationParsedZodError(parsed.error)
  }

  // Vérification des autorisations
  const canUpdate = await canUpdateNotification(parsed.data.id)
  if (!canUpdate) {
    throw new AuthorizationError(
      "Vous n'avez pas les droits pour modifier cette notification"
    )
  }

  const {id, ...updateData} = parsed.data
  return await updateNotificationDao(id, updateData)
}

/**
 * Supprimer une notification
 */
export const deleteNotificationService = async (id: string) => {
  // Validation de l'ID
  const parsedId = uuidSchema.safeParse(id)
  if (!parsedId.success) {
    throw new ValidationError("L'ID doit être un UUID valide")
  }

  // Vérification des autorisations
  const canDelete = await canDeleteNotification(id)
  if (!canDelete) {
    throw new AuthorizationError(
      "Vous n'avez pas les droits pour supprimer cette notification"
    )
  }

  return await deleteNotificationDao(id)
}

/**
 * Supprimer toutes les notifications lues d'un utilisateur
 */
export const deleteReadNotificationsByUserIdService = async (
  userId: string
) => {
  // Validation de l'ID utilisateur
  const parsedUserId = uuidSchema.safeParse(userId)
  if (!parsedUserId.success) {
    throw new ValidationError("L'ID utilisateur doit être un UUID valide")
  }

  // Vérification des autorisations
  const canManage = await canReadUserNotifications(userId)
  if (!canManage) {
    throw new AuthorizationError(
      "Vous n'avez pas les droits pour supprimer les notifications de cet utilisateur"
    )
  }

  return await deleteReadNotificationsByUserIdDao(userId)
}

/**
 * Fonction utilitaire pour les admins - gérer toutes les notifications
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getAllNotificationsService = async (_pagination: Pagination) => {
  // Vérification des autorisations admin
  const canManage = await canManageNotifications()
  if (!canManage) {
    throw new AuthorizationError(
      "Vous n'avez pas les droits pour gérer toutes les notifications"
    )
  }

  // Pour cette implémentation, on peut étendre le repository plus tard
  // pour une fonction getAllNotifications si nécessaire
  throw new Error('Fonctionnalité non implémentée - getAllNotifications')
}
