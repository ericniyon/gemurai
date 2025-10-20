import { prisma } from '@/lib/database'
import { 
  Notification, 
  NotificationType, 
  NotificationData, 
  NotificationChannel,
  NotificationPriority,
  NotificationStatus,
  NotificationPreferences
} from './types'
import { getNotificationTemplate, formatNotificationMessage } from './templates'

export class NotificationService {
  /**
   * Create and send a notification
   */
  static async sendNotification(
    userId: string,
    type: NotificationType,
    data: NotificationData = {},
    channels?: NotificationChannel[]
  ): Promise<Notification> {
    try {
      // Get notification template
      const template = getNotificationTemplate(type)
      
      // Check user preferences
      const preferences = await this.getUserPreferences(userId)
      if (!preferences) {
        throw new Error(`User preferences not found for user ${userId}`)
      }

      // Filter channels based on user preferences
      const allowedChannels = channels || template.channels
      const enabledChannels = allowedChannels.filter(channel => {
        switch (channel) {
          case 'EMAIL': return preferences.emailEnabled
          case 'SMS': return preferences.smsEnabled
          case 'PUSH': return preferences.pushEnabled
          case 'IN_APP': return preferences.inAppEnabled
          default: return false
        }
      })

      // Check if notification type is enabled for user
      if (!preferences.types[type]) {
        console.log(`Notification type ${type} is disabled for user ${userId}`)
        return null
      }

      // Check quiet hours
      if (preferences.quietHours.enabled && this.isQuietHours(preferences.quietHours)) {
        console.log(`Notification suppressed due to quiet hours for user ${userId}`)
        return null
      }

      // Format message with data
      const formattedMessage = formatNotificationMessage(template, data)

      // Create notification record
      const notification = await prisma.notification.create({
        data: {
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId,
          type,
          title: template.title,
          message: formattedMessage,
          data: data,
          status: 'PENDING',
          priority: template.priority,
          channels: enabledChannels,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      // Send notification through enabled channels
      await this.sendThroughChannels(notification, enabledChannels)

      return notification
    } catch (error) {
      console.error('Error sending notification:', error)
      throw error
    }
  }

  /**
   * Send notification to multiple users
   */
  static async sendBulkNotification(
    userIds: string[],
    type: NotificationType,
    data: NotificationData = {},
    channels?: NotificationChannel[]
  ): Promise<Notification[]> {
    const notifications: Notification[] = []
    
    for (const userId of userIds) {
      try {
        const notification = await this.sendNotification(userId, type, data, channels)
        if (notification) {
          notifications.push(notification)
        }
      } catch (error) {
        console.error(`Error sending notification to user ${userId}:`, error)
      }
    }
    
    return notifications
  }

  /**
   * Send notification through specific channels
   */
  private static async sendThroughChannels(
    notification: Notification,
    channels: NotificationChannel[]
  ): Promise<void> {
    for (const channel of channels) {
      try {
        switch (channel) {
          case 'IN_APP':
            await this.sendInAppNotification(notification)
            break
          case 'EMAIL':
            await this.sendEmailNotification(notification)
            break
          case 'SMS':
            await this.sendSMSNotification(notification)
            break
          case 'PUSH':
            await this.sendPushNotification(notification)
            break
        }
      } catch (error) {
        console.error(`Error sending notification through ${channel}:`, error)
        // Update notification status to failed
        await this.updateNotificationStatus(notification.id, 'FAILED')
      }
    }
  }

  /**
   * Send in-app notification
   */
  private static async sendInAppNotification(notification: Notification): Promise<void> {
    // In-app notifications are already stored in database
    // Just update the status
    await this.updateNotificationStatus(notification.id, 'SENT')
    console.log(`In-app notification sent: ${notification.id}`)
  }

  /**
   * Send email notification
   */
  private static async sendEmailNotification(notification: Notification): Promise<void> {
    // TODO: Implement email service integration
    // For now, just log and update status
    console.log(`Email notification sent: ${notification.id}`)
    await this.updateNotificationStatus(notification.id, 'SENT')
  }

  /**
   * Send SMS notification
   */
  private static async sendSMSNotification(notification: Notification): Promise<void> {
    // TODO: Implement SMS service integration
    // For now, just log and update status
    console.log(`SMS notification sent: ${notification.id}`)
    await this.updateNotificationStatus(notification.id, 'SENT')
  }

  /**
   * Send push notification
   */
  private static async sendPushNotification(notification: Notification): Promise<void> {
    try {
      const { PushNotificationService } = await import('./push-service')
      
      const result = await PushNotificationService.sendToUser(notification.userId, notification)
      
      if (result.success) {
        console.log(`[PUSH_NOTIFICATION] Push notification sent successfully: ${notification.id}`)
        await this.updateNotificationStatus(notification.id, 'SENT')
      } else {
        console.error(`[PUSH_NOTIFICATION] Failed to send push notification: ${notification.id}`, result.error)
        await this.updateNotificationStatus(notification.id, 'FAILED')
      }
    } catch (error) {
      console.error(`[PUSH_NOTIFICATION] Error sending push notification: ${notification.id}`, error)
      await this.updateNotificationStatus(notification.id, 'FAILED')
    }
  }

  /**
   * Update notification status
   */
  private static async updateNotificationStatus(
    notificationId: string,
    status: NotificationStatus
  ): Promise<void> {
    await prisma.notification.update({
      where: { id: notificationId },
      data: {
        status,
        sentAt: status === 'SENT' ? new Date() : undefined,
        deliveredAt: status === 'DELIVERED' ? new Date() : undefined,
        readAt: status === 'READ' ? new Date() : undefined,
        updatedAt: new Date()
      }
    })
  }

  /**
   * Get user notification preferences
   */
  static async getUserPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      const preferences = await prisma.notificationPreferences.findUnique({
        where: { userId }
      })

      if (!preferences) {
        // Create default preferences if not found
        return await this.createDefaultPreferences(userId)
      }

      return preferences
    } catch (error) {
      console.error('Error getting user preferences:', error)
      return null
    }
  }

  /**
   * Create default notification preferences
   */
  private static async createDefaultPreferences(userId: string): Promise<NotificationPreferences> {
    const defaultTypes = {
      ORDER_CREATED: true,
      PAYMENT_CONFIRMED: true,
      ORDER_APPROVED: true,
      ORDER_REJECTED: true,
      ORDER_COMPLETED: true,
      ORDER_CANCELLED: true,
      NEW_ORDER_RECEIVED: true,
      PAYMENT_PENDING: true,
      ORDER_REQUIRES_APPROVAL: true,
      ORDER_COMPLETED_EMPLOYER: true,
      LOW_STOCK_ALERT: true,
      OUT_OF_STOCK_ALERT: true,
      ORDER_PROCESSING_ERROR: true,
      PAYMENT_FAILED: true,
      VOUCHER_USED: true,
      VOUCHER_EXPIRED: true,
      INSUFFICIENT_VOUCHER_BALANCE: true,
      STOCK_DEDUCTED: false,
      STOCK_ADDED_TO_DCC: false,
      STOCK_RESTORED: false,
      ORDER_SHIPPED: true,
      ORDER_DELIVERED: true,
      DELIVERY_FAILED: true,
      PAYMENT_RECEIVED: true,
      COMMISSION_CALCULATED: false,
      WALLET_UPDATED: false,
      STATUS_UPDATED: false,
      PRIORITY_CHANGED: false,
      NOTES_ADDED: false,
      BULK_ORDER_CREATED: true,
      BULK_ORDER_APPROVED: true,
      BULK_ORDER_REJECTED: true,
      DATABASE_ERROR: true,
      TRANSACTION_TIMEOUT: true,
      VALIDATION_ERROR: true,
      NETWORK_ERROR: true
    }

    const preferences = await prisma.notificationPreferences.create({
      data: {
        userId,
        emailEnabled: true,
        smsEnabled: true,
        pushEnabled: true,
        inAppEnabled: true,
        types: defaultTypes,
        frequency: 'IMMEDIATE',
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00'
        }
      }
    })

    return preferences
  }

  /**
   * Update user notification preferences
   */
  static async updateUserPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    return await prisma.notificationPreferences.upsert({
      where: { userId },
      update: preferences,
      create: {
        userId,
        emailEnabled: true,
        smsEnabled: true,
        pushEnabled: true,
        inAppEnabled: true,
        types: {},
        frequency: 'IMMEDIATE',
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00'
        },
        ...preferences
      }
    })
  }

  /**
   * Get user notifications
   */
  static async getUserNotifications(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<Notification[]> {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    })
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string): Promise<void> {
    await prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: 'READ',
        readAt: new Date(),
        updatedAt: new Date()
      }
    })
  }

  /**
   * Mark all notifications as read for user
   */
  static async markAllAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { 
        userId,
        status: { in: ['SENT', 'DELIVERED'] }
      },
      data: {
        status: 'READ',
        readAt: new Date(),
        updatedAt: new Date()
      }
    })
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(userId: string): Promise<number> {
    return await prisma.notification.count({
      where: {
        userId,
        status: { in: ['SENT', 'DELIVERED'] }
      }
    })
  }

  /**
   * Check if current time is within quiet hours
   */
  private static isQuietHours(quietHours: { enabled: boolean; start: string; end: string }): boolean {
    if (!quietHours.enabled) return false

    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    
    const [startHour, startMin] = quietHours.start.split(':').map(Number)
    const [endHour, endMin] = quietHours.end.split(':').map(Number)
    
    const startTime = startHour * 60 + startMin
    const endTime = endHour * 60 + endMin

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime
    } else {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime <= endTime
    }
  }

  /**
   * Clean up old notifications
   */
  static async cleanupOldNotifications(daysOld: number = 30): Promise<void> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    await prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        },
        status: 'READ'
      }
    })
  }
}
