'use server'

import {revalidatePath} from 'next/cache'

import {
  deleteNotificationService,
  markAllNotificationsAsReadService,
  markNotificationAsReadService,
  updateNotificationService,
} from '@/services/facades/notification-service-facade'

export async function markNotificationAsReadAction(notificationId: string) {
  try {
    await markNotificationAsReadService(notificationId)
    revalidatePath('/notifications')
    return {success: true}
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return {
      success: false,
      error: 'Erreur lors du marquage de la notification comme lue',
    }
  }
}

export async function markNotificationAsUnreadAction(notificationId: string) {
  try {
    await updateNotificationService({
      id: notificationId,
      read: false,
    })
    revalidatePath('/notifications')
    return {success: true}
  } catch (error) {
    console.error('Error marking notification as unread:', error)
    return {
      success: false,
      error: 'Erreur lors du marquage de la notification comme non lue',
    }
  }
}

export async function deleteNotificationAction(notificationId: string) {
  try {
    await deleteNotificationService(notificationId)
    revalidatePath('/notifications')
    return {success: true}
  } catch (error) {
    console.error('Error deleting notification:', error)
    return {
      success: false,
      error: 'Erreur lors de la suppression de la notification',
    }
  }
}

export async function markAllNotificationsAsReadAction(userId: string) {
  try {
    await markAllNotificationsAsReadService(userId)
    revalidatePath('/notifications')
    return {success: true}
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return {
      success: false,
      error: 'Erreur lors du marquage de toutes les notifications comme lues',
    }
  }
}
