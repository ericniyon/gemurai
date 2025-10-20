"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  AlertTriangle,
  XCircle,
  Package,
  CreditCard,
  Truck,
  DollarSign,
  Bell,
  BellOff
} from 'lucide-react'

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

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: string) => void
  getPriorityColor: (priority: string) => string
  formatTimeAgo: (dateString: string) => string
}

export function NotificationItem({ 
  notification, 
  onMarkAsRead, 
  getPriorityColor, 
  formatTimeAgo 
}: NotificationItemProps) {
  const [isRead, setIsRead] = useState(notification.status === 'READ')

  const getNotificationIcon = (type: string) => {
    if (type.includes('ORDER')) {
      return <Package className="h-4 w-4" />
    } else if (type.includes('PAYMENT')) {
      return <CreditCard className="h-4 w-4" />
    } else if (type.includes('STOCK')) {
      return <Package className="h-4 w-4" />
    } else if (type.includes('VOUCHER')) {
      return <DollarSign className="h-4 w-4" />
    } else if (type.includes('DELIVERY') || type.includes('SHIPPED')) {
      return <Truck className="h-4 w-4" />
    } else if (type.includes('ERROR') || type.includes('FAILED')) {
      return <XCircle className="h-4 w-4" />
    } else if (type.includes('ALERT')) {
      return <AlertTriangle className="h-4 w-4" />
    } else {
      return <Bell className="h-4 w-4" />
    }
  }

  const getNotificationColor = (type: string, priority: string) => {
    if (type.includes('ERROR') || type.includes('FAILED') || priority === 'CRITICAL') {
      return 'border-red-200 bg-red-50'
    } else if (type.includes('ALERT') || priority === 'HIGH') {
      return 'border-orange-200 bg-orange-50'
    } else if (type.includes('SUCCESS') || type.includes('APPROVED') || type.includes('COMPLETED')) {
      return 'border-green-200 bg-green-50'
    } else if (priority === 'MEDIUM') {
      return 'border-blue-200 bg-blue-50'
    } else {
      return 'border-gray-200 bg-gray-50'
    }
  }

  const handleMarkAsRead = () => {
    if (!isRead) {
      onMarkAsRead(notification.id)
      setIsRead(true)
    }
  }

  return (
    <Card 
      className={`mb-2 cursor-pointer transition-all hover:shadow-md ${
        isRead 
          ? 'opacity-60' 
          : 'border-l-4 border-l-blue-500 shadow-sm'
      } ${getNotificationColor(notification.type, notification.priority)}`}
      onClick={handleMarkAsRead}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <div className={`p-1 rounded-full ${
            notification.priority === 'CRITICAL' ? 'bg-red-100 text-red-600' :
            notification.priority === 'HIGH' ? 'bg-orange-100 text-orange-600' :
            notification.priority === 'MEDIUM' ? 'bg-blue-100 text-blue-600' :
            'bg-gray-100 text-gray-600'
          }`}>
            {getNotificationIcon(notification.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className={`text-sm font-medium ${
                isRead ? 'text-gray-600' : 'text-gray-900'
              }`}>
                {notification.title}
              </h4>
              <div className="flex items-center gap-1">
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${getPriorityColor(notification.priority)} text-white`}
                >
                  {notification.priority}
                </Badge>
                {!isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
            </div>
            
            <p className={`text-sm ${
              isRead ? 'text-gray-500' : 'text-gray-700'
            }`}>
              {notification.message}
            </p>
            
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-400">
                {formatTimeAgo(notification.createdAt)}
              </span>
              
              {notification.data && (
                <div className="flex items-center gap-1">
                  {notification.data.orderId && (
                    <Badge variant="outline" className="text-xs">
                      #{notification.data.orderId.slice(-8)}
                    </Badge>
                  )}
                  {notification.data.amount && (
                    <Badge variant="outline" className="text-xs">
                      {notification.data.amount} RWF
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
