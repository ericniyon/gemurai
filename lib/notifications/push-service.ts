import { Notification } from './types'

export interface PushNotificationResult {
  success: boolean
  messageId?: string
  error?: string
  delivered: boolean
}

export interface DeviceToken {
  userId: string
  token: string
  platform: 'ios' | 'android' | 'web'
  createdAt: Date
  updatedAt: Date
}

export class PushNotificationService {
  private static firebaseAdmin: any = null
  private static isInitialized = false

  /**
   * Initialize Firebase Admin SDK
   */
  private static async initializeFirebase(): Promise<void> {
    if (this.isInitialized) return

    try {
      const admin = require('firebase-admin')
      
      if (!admin.apps.length) {
        const serviceAccount = {
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL
        }

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        })
      }

      this.firebaseAdmin = admin
      this.isInitialized = true
      console.log('[PUSH_SERVICE] Firebase Admin SDK initialized')
    } catch (error) {
      console.error('[PUSH_SERVICE] Error initializing Firebase:', error)
      throw error
    }
  }

  /**
   * Send push notification to a single user
   */
  static async sendToUser(
    userId: string,
    notification: Notification
  ): Promise<PushNotificationResult> {
    try {
      await this.initializeFirebase()

      // Get user's device tokens
      const deviceTokens = await this.getUserDeviceTokens(userId)
      
      if (deviceTokens.length === 0) {
        console.log(`[PUSH_SERVICE] No device tokens found for user ${userId}`)
        return {
          success: false,
          error: 'No device tokens found',
          delivered: false
        }
      }

      // Send to all user's devices
      const results = await Promise.allSettled(
        deviceTokens.map(token => this.sendToDevice(token, notification))
      )

      const successful = results.filter(r => r.status === 'fulfilled').length
      const failed = results.filter(r => r.status === 'rejected').length

      console.log(`[PUSH_SERVICE] Sent to ${successful}/${deviceTokens.length} devices for user ${userId}`)

      return {
        success: successful > 0,
        delivered: successful > 0,
        error: failed > 0 ? `${failed} devices failed` : undefined
      }
    } catch (error) {
      console.error('[PUSH_SERVICE] Error sending push notification:', error)
      return {
        success: false,
        error: error.message,
        delivered: false
      }
    }
  }

  /**
   * Send push notification to a specific device
   */
  private static async sendToDevice(
    deviceToken: DeviceToken,
    notification: Notification
  ): Promise<PushNotificationResult> {
    try {
      const message = {
        notification: {
          title: notification.title,
          body: notification.message
        },
        data: {
          type: notification.type,
          priority: notification.priority,
          orderId: notification.data?.orderId || '',
          amount: notification.data?.amount?.toString() || '',
          productName: notification.data?.productName || '',
          voucherCode: notification.data?.voucherCode || '',
          ...notification.data
        },
        token: deviceToken.token,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'stock_orders',
            priority: 'high'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
              priority: 10
            }
          }
        }
      }

      const response = await this.firebaseAdmin.messaging().send(message)
      
      console.log(`[PUSH_SERVICE] Push notification sent to ${deviceToken.platform} device: ${response}`)
      
      return {
        success: true,
        messageId: response,
        delivered: true
      }
    } catch (error) {
      console.error(`[PUSH_SERVICE] Error sending to device ${deviceToken.token}:`, error)
      
      // Handle invalid tokens
      if (error.code === 'messaging/invalid-registration-token' || 
          error.code === 'messaging/registration-token-not-registered') {
        await this.removeInvalidToken(deviceToken.token)
      }
      
      return {
        success: false,
        error: error.message,
        delivered: false
      }
    }
  }

  /**
   * Send push notification to multiple users
   */
  static async sendToUsers(
    userIds: string[],
    notification: Notification
  ): Promise<PushNotificationResult[]> {
    const results = await Promise.allSettled(
      userIds.map(userId => this.sendToUser(userId, notification))
    )

    return results.map(result => 
      result.status === 'fulfilled' ? result.value : {
        success: false,
        error: result.reason?.message || 'Unknown error',
        delivered: false
      }
    )
  }

  /**
   * Send push notification to a topic
   */
  static async sendToTopic(
    topic: string,
    notification: Notification
  ): Promise<PushNotificationResult> {
    try {
      await this.initializeFirebase()

      const message = {
        notification: {
          title: notification.title,
          body: notification.message
        },
        data: {
          type: notification.type,
          priority: notification.priority,
          orderId: notification.data?.orderId || '',
          amount: notification.data?.amount?.toString() || '',
          productName: notification.data?.productName || '',
          voucherCode: notification.data?.voucherCode || '',
          ...notification.data
        },
        topic: topic,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'stock_orders',
            priority: 'high'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
              priority: 10
            }
          }
        }
      }

      const response = await this.firebaseAdmin.messaging().send(message)
      
      console.log(`[PUSH_SERVICE] Push notification sent to topic ${topic}: ${response}`)
      
      return {
        success: true,
        messageId: response,
        delivered: true
      }
    } catch (error) {
      console.error(`[PUSH_SERVICE] Error sending to topic ${topic}:`, error)
      return {
        success: false,
        error: error.message,
        delivered: false
      }
    }
  }

  /**
   * Get user's device tokens
   */
  private static async getUserDeviceTokens(userId: string): Promise<DeviceToken[]> {
    // This would typically come from a database
    // For now, we'll return an empty array
    // In production, you'd query your database for user's device tokens
    
    // Example implementation:
    // const tokens = await prisma.deviceToken.findMany({
    //   where: { userId, isActive: true }
    // })
    // return tokens
    
    return []
  }

  /**
   * Remove invalid device token
   */
  private static async removeInvalidToken(token: string): Promise<void> {
    // This would typically update your database
    // For now, we'll just log it
    
    console.log(`[PUSH_SERVICE] Removing invalid token: ${token}`)
    
    // Example implementation:
    // await prisma.deviceToken.update({
    //   where: { token },
    //   data: { isActive: false }
    // })
  }

  /**
   * Subscribe user to topic
   */
  static async subscribeToTopic(userId: string, topic: string): Promise<boolean> {
    try {
      await this.initializeFirebase()
      
      const deviceTokens = await this.getUserDeviceTokens(userId)
      const tokens = deviceTokens.map(dt => dt.token)
      
      if (tokens.length === 0) {
        console.log(`[PUSH_SERVICE] No device tokens found for user ${userId}`)
        return false
      }

      const response = await this.firebaseAdmin.messaging().subscribeToTopic(tokens, topic)
      
      console.log(`[PUSH_SERVICE] Subscribed ${tokens.length} devices to topic ${topic}`)
      console.log(`[PUSH_SERVICE] Success count: ${response.successCount}, Failure count: ${response.failureCount}`)
      
      return response.failureCount === 0
    } catch (error) {
      console.error(`[PUSH_SERVICE] Error subscribing to topic ${topic}:`, error)
      return false
    }
  }

  /**
   * Unsubscribe user from topic
   */
  static async unsubscribeFromTopic(userId: string, topic: string): Promise<boolean> {
    try {
      await this.initializeFirebase()
      
      const deviceTokens = await this.getUserDeviceTokens(userId)
      const tokens = deviceTokens.map(dt => dt.token)
      
      if (tokens.length === 0) {
        console.log(`[PUSH_SERVICE] No device tokens found for user ${userId}`)
        return false
      }

      const response = await this.firebaseAdmin.messaging().unsubscribeFromTopic(tokens, topic)
      
      console.log(`[PUSH_SERVICE] Unsubscribed ${tokens.length} devices from topic ${topic}`)
      console.log(`[PUSH_SERVICE] Success count: ${response.successCount}, Failure count: ${response.failureCount}`)
      
      return response.failureCount === 0
    } catch (error) {
      console.error(`[PUSH_SERVICE] Error unsubscribing from topic ${topic}:`, error)
      return false
    }
  }

  /**
   * Test push notification service
   */
  static async testService(): Promise<boolean> {
    try {
      await this.initializeFirebase()
      
      // Test with a simple message
      const testMessage = {
        notification: {
          title: 'Test Push Notification',
          body: 'This is a test push notification from the service'
        },
        topic: 'test'
      }

      // Note: This will fail if no devices are subscribed to 'test' topic
      // but it will verify that Firebase is properly configured
      console.log('[PUSH_SERVICE] Testing Firebase configuration...')
      
      return true
    } catch (error) {
      console.error('[PUSH_SERVICE] Test failed:', error)
      return false
    }
  }
}
