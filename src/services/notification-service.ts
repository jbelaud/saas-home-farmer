import {getTranslations} from 'next-intl/server'

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
  getUserByEmailDao,
  getUserByIdDao,
  getUserSettingsByUserIdDao,
} from '@/db/repositories/user-repository'
import {env} from '@/env'
import {logger} from '@/lib/logger'
import {sendNotificationEmailService} from '@/services/facades/email-service-facade'

import {
  canDeleteNotification,
  canManageNotifications,
  canReadNotification,
  canReadUserNotifications,
  canUpdateNotification,
} from './authorization/notification-authorization'
import {AuthorizationError} from './errors/authorization-error'
import {
  ValidationError,
  ValidationParsedZodError,
} from './errors/validation-error'
import {
  sendEmailChangeEmailVerificationService,
  sendMagicLinkEmailService,
  sendOrganizationInvitationService,
  sendOTPEmailService,
  sendResetPasswordLinkEmailService,
  sendSubscriptionCanceledEmailService,
  sendSubscriptionCompletedEmailService,
  sendSubscriptionDeletedEmailService,
  sendSubscriptionUpdatedEmailService,
  sendVerificationEmailService,
} from './facades/email-service-facade'
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
 * Créer une notification typée avec métadonnées
 *
 * Cette fonction détermine automatiquement si l'email doit être envoyé selon :
 * - Pour les notifications critiques (auth, sécurité) : email toujours envoyé
 * - Pour les notifications internes : respecte les paramètres utilisateur
 *
 * @param notificationParams - Paramètres de la notification typée
 * @returns Promise<Notification> - La notification créée
 */
export const createTypedNotificationService = async <
  T extends NotificationType,
>(
  notificationParams: CreateTypedNotification<T>
) => {
  logger.debug('🔔 createTypedNotificationService appelé avec:', {
    type: notificationParams.type,
    userId: notificationParams.userId,
  })

  // Récupérer les paramètres utilisateur pour la langue
  const targetUser = await getUserByIdDao(notificationParams.userId)
  if (!targetUser) {
    throw new ValidationError("L'utilisateur spécifié n'existe pas")
  }

  const userSettings = await getUserSettingsByUserIdDao(
    notificationParams.userId
  )
  const userLanguage = userSettings?.language || 'fr'

  // Utiliser les traductions si title et message ne sont pas fournis
  let finalTitle = notificationParams.title
  let finalMessage = notificationParams.message

  if (!finalTitle || !finalMessage) {
    try {
      const translations = await getTranslations({
        locale: userLanguage,
        namespace: `services.domain.notification.${notificationParams.type}`,
      })

      if (!finalTitle) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        finalTitle = translations.raw('title' as any)
      }
      if (!finalMessage) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        finalMessage = translations.raw('message' as any)
      }
    } catch {
      // Si les traductions ne sont pas trouvées, utiliser les valeurs par défaut
      if (!finalTitle) {
        finalTitle = `Notification ${notificationParams.type}`
      }
      if (!finalMessage) {
        finalMessage = `Une nouvelle notification de type ${notificationParams.type} a été créée.`
      }
    }
  }

  // Créer la notification avec les titres et messages finaux
  const finalNotificationParams = {
    ...notificationParams,
    title: finalTitle || `Notification ${notificationParams.type}`,
    message:
      finalMessage ||
      `Une nouvelle notification de type ${notificationParams.type} a été créée.`,
  }

  // Déterminer automatiquement si l'email est critique
  const forceEmail = isCriticalNotification(notificationParams.type)

  return await createNotificationService(finalNotificationParams, {
    forceEmail,
  })
}
/**
 * Créer une nouvelle notification
 */
export const createNotificationService = async (
  notificationParams: CreateNotification,
  options: {forceEmail?: boolean} = {}
) => {
  logger.debug('🔔 createNotificationService appelé avec:', {
    type: notificationParams.type,
    userId: notificationParams.userId,
    forceEmail: options.forceEmail,
  })

  // Validation des données
  const parsed = createNotificationServiceSchema.safeParse(notificationParams)
  if (!parsed.success) {
    throw new ValidationParsedZodError(parsed.error)
  }

  // Vérification des autorisations - admins ou utilisateur créant pour lui-même
  // desactiver pour le moment trop de cas speifique a gerer comme le reset
  // const canCreate = await canCreateNotification(parsed.data.userId)
  // if (!canCreate) {
  //   throw new AuthorizationError(
  //     "Vous n'avez pas les droits pour créer des notifications"
  //   )
  // }

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
    const userLanguage = userSettings?.language || 'fr'

    const translations = await getTranslations({
      locale: userLanguage,
      namespace: `services.domain.notification.${parsed.data.type}`,
    })

    // Vérifier si l'utilisateur a activé les notifications email OU si c'est forcé
    const shouldSendEmail =
      options.forceEmail ||
      (userSettings?.enableEmailNotifications &&
        (userSettings?.notificationChannel === 'email' ||
          userSettings?.notificationChannel === 'both'))

    if (shouldSendEmail) {
      logger.debug("📧 Envoi d'email autorisé pour:", parsed.data.type)

      // Gérer les emails spécifiques Better Auth
      logger.debug('🔍 Métadonnées reçues:', parsed.data.metadata)

      if (parsed.data.type === 'reset_password' && parsed.data.metadata?.url) {
        console.log('🔄 Envoi email reset password à:', targetUser.email)
        await sendResetPasswordLinkEmailService({
          email: targetUser.email,
          url: parsed.data.metadata.url as string,
        })
        console.log('✅ Email reset password envoyé')
      } else if (
        parsed.data.type === 'email_verification' &&
        parsed.data.metadata?.url
      ) {
        await sendVerificationEmailService({
          email: targetUser.email,
          url: parsed.data.metadata.url,
        })
      } else if (
        parsed.data.type === 'change_email_verification' &&
        parsed.data.metadata?.url
      ) {
        await sendEmailChangeEmailVerificationService({
          email: targetUser.email, // Send to current email for security
          url: parsed.data.metadata.url,
        })
      } else if (
        parsed.data.type === 'magic_link' &&
        parsed.data.metadata?.url
      ) {
        await sendMagicLinkEmailService({
          email: targetUser.email,
          url: parsed.data.metadata.url,
        })
      } else if (parsed.data.type === 'otp_code' && parsed.data.metadata?.otp) {
        await sendOTPEmailService({
          email: targetUser.email,
          otp: parsed.data.metadata.otp,
          otpLink: parsed.data.metadata.otpLink,
        })
      } else if (
        parsed.data.type === 'organization_invitation' &&
        parsed.data.metadata?.organizationName
      ) {
        const inviteLink = `${env.NEXT_PUBLIC_APP_URL}/invitations`
        await sendOrganizationInvitationService({
          email: targetUser.email,
          invitedByUsername: parsed.data.metadata.invitedBy,
          invitedByEmail: parsed.data.metadata.invitedByEmail,
          teamName: parsed.data.metadata.organizationName,
          inviteLink,
        })
        const invitedByUser = await getUserByEmailDao(
          parsed.data.metadata.invitedByEmail
        )

        const titleInvited = translations('title_invited', {
          email: targetUser.email,
          organizationName: parsed.data.metadata.organizationName,
        })
        const messageInvited = translations('message_invited', {
          email: targetUser.email,
          organizationName: parsed.data.metadata.organizationName,
        })

        await createNotificationDao({
          ...parsed.data,
          title: titleInvited,
          message: messageInvited,
          userId: invitedByUser?.id || '',
        })
      } else if (
        parsed.data.type === 'subscription_created' &&
        parsed.data.metadata?.subscription
      ) {
        await sendSubscriptionCompletedEmailService(
          parsed.data.metadata.subscription
        )
      } else if (
        parsed.data.type === 'subscription_updated' &&
        parsed.data.metadata?.subscription
      ) {
        await sendSubscriptionUpdatedEmailService(
          parsed.data.metadata.subscription
        )
      } else if (
        parsed.data.type === 'subscription_canceled' &&
        parsed.data.metadata?.subscription
      ) {
        await sendSubscriptionCanceledEmailService(
          parsed.data.metadata.subscription
        )
      } else if (
        parsed.data.type === 'subscription_deleted' &&
        parsed.data.metadata?.subscription
      ) {
        await sendSubscriptionDeletedEmailService(
          parsed.data.metadata.subscription
        )
      } else {
        // Utiliser le service d'email générique pour les autres types
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

        await sendNotificationEmailService({
          email: targetUser.email,
          title: parsed.data.title,
          message: parsed.data.message,
          type: emailType,
          language: userLanguage,
        })
      }
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
 * Détermine si un type de notification nécessite un email obligatoire
 *
 * Les notifications critiques sont celles liées à :
 * - L'authentification (reset_password, email_verification, magic_link, otp_code)
 * - La sécurité (security_alert, password_changed)
 *
 * Ces notifications ignorent les paramètres utilisateur et envoient toujours un email
 *
 * @param type - Type de notification à vérifier
 * @returns true si le type nécessite un email obligatoire, false sinon
 */
const isCriticalNotification = (type: NotificationType): boolean => {
  const criticalTypes: NotificationType[] = [
    'reset_password',
    'email_verification',
    'change_email_verification',
    'magic_link',
    'otp_code',
    'security_alert',
    'password_changed',
    'organization_invitation',
    'subscription_created',
    'subscription_updated',
    'subscription_canceled',
    'subscription_deleted',
  ]
  return criticalTypes.includes(type)
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
