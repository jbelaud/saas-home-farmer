'use client'

import {useEffect, useState} from 'react'

import {useAuth} from '@/components/context/auth-provider'

/**
 * Hook pour récupérer le nombre de notifications non lues
 */
export function useUnreadNotifications() {
  const {user} = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading] = useState(false)

  useEffect(() => {
    // Si on a les notifications dans l'user, compter celles non lues
    if (user?.notifications) {
      const unreadNotifications = user.notifications.filter(
        (notification) => !notification.read
      )
      setUnreadCount(unreadNotifications.length)
      return
    }

    // Sinon, on garde 0
    setUnreadCount(0)
  }, [user?.notifications])

  // Fonction pour mettre à jour le count manuellement
  const updateUnreadCount = (newCount: number) => {
    setUnreadCount(newCount)
  }

  const decrementUnreadCount = () => {
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  return {unreadCount, loading, updateUnreadCount, decrementUnreadCount}
}
