import {
  AddNotificationModel,
  NotificationModel,
  UpdateNotificationModel,
} from '@/db/models/notification-model'

// ICI les TYPES DE DOMAIN sont EGAUX aux types drizzle
// Les fichier types DOMAINS sont la pour décorréler les types de drizzle des types de domaine (services)

export type Notification = NotificationModel

export type CreateNotification = AddNotificationModel

export type UpdateNotification = {
  id: string
} & Partial<Omit<UpdateNotificationModel, 'id'>>

// Types pour les différents types de notifications
export type NotificationType =
  | 'payment_failed'
  | 'payment_succeeded'
  | 'subscription_created'
  | 'subscription_updated'
  | 'subscription_canceled'
  | 'subscription_deleted'
  | 'organization_invitation'
  | 'project_created'
  | 'project_updated'
  | 'user_banned'
  | 'user_unbanned'
  | 'system_maintenance'
  | 'security_alert'

// Métadonnées spécifiques selon le type de notification
export type NotificationMetadata = {
  payment_failed?: {
    paymentId: string
    amount: number
    currency: string
    reason?: string
  }
  payment_succeeded?: {
    paymentId: string
    amount: number
    currency: string
  }
  subscription_created?: {
    subscriptionId: string
    planName: string
  }
  subscription_updated?: {
    subscriptionId: string
    planName: string
    previousPlanName?: string
  }
  subscription_canceled?: {
    subscriptionId: string
    planName: string
    canceledAt: string
  }
  subscription_deleted?: {
    subscriptionId: string
    planName: string
  }
  organization_invitation?: {
    organizationId: string
    organizationName: string
    invitedBy: string
    role: string
  }
  project_created?: {
    projectId: string
    projectName: string
    organizationId?: string
  }
  project_updated?: {
    projectId: string
    projectName: string
    changes: string[]
  }
  user_banned?: {
    reason: string
    expiresAt?: string
    bannedBy: string
  }
  user_unbanned?: {
    unbannedBy: string
    unbannedAt: string
  }
  system_maintenance?: {
    startTime: string
    endTime: string
    description: string
  }
  security_alert?: {
    alertType: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    description: string
  }
}

// Type pour créer une notification avec métadonnées typées
export type CreateTypedNotification<T extends NotificationType> = Omit<
  CreateNotification,
  'type' | 'metadata'
> & {
  type: T
  metadata?: NotificationMetadata[T]
}
