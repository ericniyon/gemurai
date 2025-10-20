"use client"

import { useState, useEffect } from 'react'
import { Bell, BellRing } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { NotificationItem } from './NotificationItem'
import { NotificationPreferences } from './NotificationPreferences'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  createdAt: string
  data?: any
}

interface NotificationBellProps {
  userId: string
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)

  useEffect(() => {
    fetchNotifications()
    
    // Set up polling for new notifications
    const interval = setInterval(fetchNotifications, 30000) // Poll every 30 seconds
    
    return () => clearInterval(interval)
  }, [userId])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/notifications?limit=20&unreadOnly=false')
      const data = await response.json()
      
      if (data.success) {
        setNotifications(data.data.notifications)
        setUnreadCount(data.data.unreadCount)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'markAsRead',
          notificationId
        })
      })
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, status: 'READ' as const }
            : notif
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'markAllAsRead'
        })
      })
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, status: 'READ' as const }))
      )
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-500'
      case 'HIGH': return 'bg-orange-500'
      case 'MEDIUM': return 'bg-blue-500'
      case 'LOW': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          {unreadCount > 0 ? (
            <BellRing className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                Mark all read
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreferences(!showPreferences)}
              className="text-xs"
            >
              Settings
            </Button>
          </div>
        </div>

        {showPreferences ? (
          <NotificationPreferences userId={userId} />
        ) : (
          <ScrollArea className="h-96">
            {loading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No notifications yet
              </div>
            ) : (
              <div className="p-2">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    getPriorityColor={getPriorityColor}
                    formatTimeAgo={formatTimeAgo}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
