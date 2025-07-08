'use client'

import {useState} from 'react'

import {Card} from '@/components/ui/card'
import {PaginatedResponse} from '@/services/types/common-type'
import {Notification} from '@/services/types/domain/notification-types'

import NotificationItem from './notification-item'
import NotificationsPagination from './notifications-pagination'
import NotificationsToolbar from './notifications-toolbar'

interface NotificationsManagementProps {
  initialData: PaginatedResponse<Notification>
  userId: string
}

export default function NotificationsManagement({
  initialData,
  userId,
}: NotificationsManagementProps) {
  const [data, setData] = useState(initialData)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [loading, setLoading] = useState(false)

  const handleFilterChange = async (newFilter: 'all' | 'unread') => {
    setFilter(newFilter)
    setLoading(true)

    try {
      // TODO: Implement filter logic
      console.log('Filter changed to:', newFilter)
    } catch (error) {
      console.error('Error filtering notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAllAsRead = async () => {
    setLoading(true)
    try {
      const {markAllNotificationsAsReadAction} = await import(
        '../../../app/[locale]/(app)/notifications/actions'
      )
      const result = await markAllNotificationsAsReadAction(userId)
      if (result.success) {
        // Marquer toutes les notifications comme lues dans le state local
        setData((prev) => ({
          ...prev,
          data: prev.data.map((notification) => ({
            ...notification,
            read: true,
          })),
        }))
      }
    } catch (error) {
      console.error('Error marking all as read:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationUpdate = (notificationId: string, read: boolean) => {
    setData((prev) => ({
      ...prev,
      data: prev.data.map((notification) =>
        notification.id === notificationId
          ? {...notification, read}
          : notification
      ),
    }))
  }

  const handleNotificationDelete = (notificationId: string) => {
    setData((prev) => ({
      ...prev,
      data: prev.data.filter(
        (notification) => notification.id !== notificationId
      ),
      pagination: {
        ...prev.pagination,
        total: prev.pagination.total - 1,
      },
    }))
  }

  const hasUnreadNotifications = data.data.some(
    (notification) => !notification.read
  )

  return (
    <div className="space-y-6">
      <NotificationsToolbar
        filter={filter}
        onFilterChange={handleFilterChange}
        onMarkAllAsRead={handleMarkAllAsRead}
        hasUnreadNotifications={hasUnreadNotifications}
        loading={loading}
      />

      <div className="space-y-4">
        {data.data.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="space-y-3">
              <div className="text-muted-foreground mx-auto h-12 w-12">🔔</div>
              <h3 className="text-lg font-semibold">Aucune notification</h3>
              <p className="text-muted-foreground">
                {filter === 'unread'
                  ? 'Toutes vos notifications ont été lues.'
                  : "Vous n'avez aucune notification pour le moment."}
              </p>
            </div>
          </Card>
        ) : (
          data.data.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onUpdate={handleNotificationUpdate}
              onDelete={handleNotificationDelete}
            />
          ))
        )}
      </div>

      {data.pagination.totalPages > 1 && (
        <NotificationsPagination
          pagination={data.pagination}
          onPageChange={(page) => {
            // TODO: Implement pagination
            console.log('Page changed to:', page)
          }}
        />
      )}
    </div>
  )
}
