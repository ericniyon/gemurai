import { NotificationService } from './service'
import { NotificationType, NotificationData } from './types'
import { prisma } from '@/lib/database'

export class StockOrderNotifications {
  /**
   * Send notification when DCC creates a stock order
   */
  static async notifyOrderCreated(
    dccId: string,
    orderId: string,
    totalAmount: number,
    voucherCode?: string
  ): Promise<void> {
    try {
      // Get DCC details
      const dcc = await prisma.user.findUnique({
        where: { id: dccId },
        select: { name: true, email: true }
      })

      // Get employer details (from products in the order)
      const order = await prisma.stockOrder.findUnique({
        where: { id: orderId },
        include: {
          products: {
            include: {
              product: {
                include: {
                  seller: {
                    select: { id: true, name: true, email: true }
                  }
                }
              }
            }
          }
        }
      })

      if (!order || !dcc) return

      // Notify DCC
      await NotificationService.sendNotification(
        dccId,
        'ORDER_CREATED',
        {
          orderId,
          amount: totalAmount,
          voucherCode: voucherCode || 'N/A'
        }
      )

      // Notify all unique employers who have products in this order
      const uniqueEmployers = new Map()
      order.products.forEach(orderProduct => {
        const employer = orderProduct.product.seller
        if (employer && !uniqueEmployers.has(employer.id)) {
          uniqueEmployers.set(employer.id, employer)
        }
      })

      for (const [employerId, employer] of uniqueEmployers) {
        await NotificationService.sendNotification(
          employerId,
          'NEW_ORDER_RECEIVED',
          {
            orderId,
            dccName: dcc.name,
            dccEmail: dcc.email,
            amount: totalAmount
          }
        )
      }

      console.log(`[NOTIFICATIONS] Order created notifications sent for order ${orderId}`)
    } catch (error) {
      console.error('Error sending order created notifications:', error)
    }
  }

  /**
   * Send notification when payment is confirmed (voucher payment)
   */
  static async notifyPaymentConfirmed(
    dccId: string,
    orderId: string,
    voucherCode: string,
    amount: number
  ): Promise<void> {
    try {
      // Notify DCC
      await NotificationService.sendNotification(
        dccId,
        'PAYMENT_CONFIRMED',
        {
          orderId,
          voucherCode,
          amount
        }
      )

      // Get employer details and notify them
      const order = await prisma.stockOrder.findUnique({
        where: { id: orderId },
        include: {
          products: {
            include: {
              product: {
                include: {
                  seller: {
                    select: { id: true, name: true, email: true }
                  }
                }
              }
            }
          }
        }
      })

      if (order) {
        const uniqueEmployers = new Map()
        order.products.forEach(orderProduct => {
          const employer = orderProduct.product.seller
          if (employer && !uniqueEmployers.has(employer.id)) {
            uniqueEmployers.set(employer.id, employer)
          }
        })

        for (const [employerId, employer] of uniqueEmployers) {
          await NotificationService.sendNotification(
            employerId,
            'PAYMENT_RECEIVED',
            {
              orderId,
              amount
            }
          )
        }
      }

      console.log(`[NOTIFICATIONS] Payment confirmed notifications sent for order ${orderId}`)
    } catch (error) {
      console.error('Error sending payment confirmed notifications:', error)
    }
  }

  /**
   * Send notification when order is approved
   */
  static async notifyOrderApproved(
    dccId: string,
    orderId: string,
    approvedBy: string,
    amount: number
  ): Promise<void> {
    try {
      // Get approver details
      const approver = await prisma.user.findUnique({
        where: { id: approvedBy },
        select: { name: true, email: true }
      })

      // Notify DCC
      await NotificationService.sendNotification(
        dccId,
        'ORDER_APPROVED',
        {
          orderId,
          employerName: approver?.name || 'Employer',
          amount
        }
      )

      // Notify approver
      await NotificationService.sendNotification(
        approvedBy,
        'ORDER_COMPLETED_EMPLOYER',
        {
          orderId,
          amount
        }
      )

      console.log(`[NOTIFICATIONS] Order approved notifications sent for order ${orderId}`)
    } catch (error) {
      console.error('Error sending order approved notifications:', error)
    }
  }

  /**
   * Send notification when order is rejected
   */
  static async notifyOrderRejected(
    dccId: string,
    orderId: string,
    rejectedBy: string,
    reason?: string
  ): Promise<void> {
    try {
      // Get rejector details
      const rejector = await prisma.user.findUnique({
        where: { id: rejectedBy },
        select: { name: true, email: true }
      })

      // Notify DCC
      await NotificationService.sendNotification(
        dccId,
        'ORDER_REJECTED',
        {
          orderId,
          employerName: rejector?.name || 'Employer',
          notes: reason || 'No reason provided'
        }
      )

      console.log(`[NOTIFICATIONS] Order rejected notifications sent for order ${orderId}`)
    } catch (error) {
      console.error('Error sending order rejected notifications:', error)
    }
  }

  /**
   * Send notification when order is completed
   */
  static async notifyOrderCompleted(
    dccId: string,
    orderId: string,
    completedBy: string
  ): Promise<void> {
    try {
      // Notify DCC
      await NotificationService.sendNotification(
        dccId,
        'ORDER_COMPLETED',
        {
          orderId
        }
      )

      // Notify completer
      await NotificationService.sendNotification(
        completedBy,
        'ORDER_COMPLETED_EMPLOYER',
        {
          orderId
        }
      )

      console.log(`[NOTIFICATIONS] Order completed notifications sent for order ${orderId}`)
    } catch (error) {
      console.error('Error sending order completed notifications:', error)
    }
  }

  /**
   * Send notification when stock is deducted
   */
  static async notifyStockDeducted(
    productId: string,
    orderId: string,
    quantity: number,
    stockRemaining: number
  ): Promise<void> {
    try {
      // Get product details
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { name: true, sellerId: true }
      })

      if (!product) return

      // Notify product seller (employer)
      await NotificationService.sendNotification(
        product.sellerId,
        'STOCK_DEDUCTED',
        {
          orderId,
          productId,
          productName: product.name,
          quantity,
          stockRemaining
        }
      )

      // Check if stock is low or out
      if (stockRemaining === 0) {
        await NotificationService.sendNotification(
          product.sellerId,
          'OUT_OF_STOCK_ALERT',
          {
            productId,
            productName: product.name
          }
        )
      } else if (stockRemaining <= 10) { // Low stock threshold
        await NotificationService.sendNotification(
          product.sellerId,
          'LOW_STOCK_ALERT',
          {
            productId,
            productName: product.name,
            stockRemaining
          }
        )
      }

      console.log(`[NOTIFICATIONS] Stock deducted notification sent for product ${productId}`)
    } catch (error) {
      console.error('Error sending stock deducted notification:', error)
    }
  }

  /**
   * Send notification when stock is added to DCC
   */
  static async notifyStockAddedToDCC(
    dccId: string,
    productId: string,
    orderId: string,
    quantity: number
  ): Promise<void> {
    try {
      // Get product and DCC details
      const [product, dcc] = await Promise.all([
        prisma.product.findUnique({
          where: { id: productId },
          select: { name: true }
        }),
        prisma.user.findUnique({
          where: { id: dccId },
          select: { name: true }
        })
      ])

      if (!product || !dcc) return

      // Notify DCC
      await NotificationService.sendNotification(
        dccId,
        'STOCK_ADDED_TO_DCC',
        {
          orderId,
          productId,
          productName: product.name,
          quantity,
          dccName: dcc.name
        }
      )

      console.log(`[NOTIFICATIONS] Stock added to DCC notification sent for DCC ${dccId}`)
    } catch (error) {
      console.error('Error sending stock added to DCC notification:', error)
    }
  }

  /**
   * Send notification when voucher is used
   */
  static async notifyVoucherUsed(
    dccId: string,
    voucherCode: string,
    orderId: string,
    amount: number
  ): Promise<void> {
    try {
      await NotificationService.sendNotification(
        dccId,
        'VOUCHER_USED',
        {
          voucherCode,
          orderId,
          amount
        }
      )

      console.log(`[NOTIFICATIONS] Voucher used notification sent for voucher ${voucherCode}`)
    } catch (error) {
      console.error('Error sending voucher used notification:', error)
    }
  }

  /**
   * Send notification when voucher expires
   */
  static async notifyVoucherExpired(
    dccId: string,
    voucherCode: string
  ): Promise<void> {
    try {
      await NotificationService.sendNotification(
        dccId,
        'VOUCHER_EXPIRED',
        {
          voucherCode
        }
      )

      console.log(`[NOTIFICATIONS] Voucher expired notification sent for voucher ${voucherCode}`)
    } catch (error) {
      console.error('Error sending voucher expired notification:', error)
    }
  }

  /**
   * Send notification when there's insufficient voucher balance
   */
  static async notifyInsufficientVoucherBalance(
    dccId: string,
    orderId: string,
    requiredAmount: number
  ): Promise<void> {
    try {
      await NotificationService.sendNotification(
        dccId,
        'INSUFFICIENT_VOUCHER_BALANCE',
        {
          orderId,
          amount: requiredAmount
        }
      )

      console.log(`[NOTIFICATIONS] Insufficient voucher balance notification sent for order ${orderId}`)
    } catch (error) {
      console.error('Error sending insufficient voucher balance notification:', error)
    }
  }

  /**
   * Send notification for order processing errors
   */
  static async notifyOrderProcessingError(
    dccId: string,
    orderId: string,
    errorMessage: string
  ): Promise<void> {
    try {
      await NotificationService.sendNotification(
        dccId,
        'ORDER_PROCESSING_ERROR',
        {
          orderId,
          errorMessage
        }
      )

      console.log(`[NOTIFICATIONS] Order processing error notification sent for order ${orderId}`)
    } catch (error) {
      console.error('Error sending order processing error notification:', error)
    }
  }

  /**
   * Send notification for transaction timeout
   */
  static async notifyTransactionTimeout(
    dccId: string,
    orderId: string
  ): Promise<void> {
    try {
      await NotificationService.sendNotification(
        dccId,
        'TRANSACTION_TIMEOUT',
        {
          orderId
        }
      )

      console.log(`[NOTIFICATIONS] Transaction timeout notification sent for order ${orderId}`)
    } catch (error) {
      console.error('Error sending transaction timeout notification:', error)
    }
  }

  /**
   * Send notification for validation errors
   */
  static async notifyValidationError(
    dccId: string,
    orderId: string,
    errorMessage: string
  ): Promise<void> {
    try {
      await NotificationService.sendNotification(
        dccId,
        'VALIDATION_ERROR',
        {
          orderId,
          errorMessage
        }
      )

      console.log(`[NOTIFICATIONS] Validation error notification sent for order ${orderId}`)
    } catch (error) {
      console.error('Error sending validation error notification:', error)
    }
  }

  /**
   * Send notification for database errors
   */
  static async notifyDatabaseError(
    dccId: string,
    orderId: string,
    errorMessage: string
  ): Promise<void> {
    try {
      await NotificationService.sendNotification(
        dccId,
        'DATABASE_ERROR',
        {
          orderId,
          errorMessage
        }
      )

      console.log(`[NOTIFICATIONS] Database error notification sent for order ${orderId}`)
    } catch (error) {
      console.error('Error sending database error notification:', error)
    }
  }

  /**
   * Send notification for network errors
   */
  static async notifyNetworkError(
    dccId: string,
    orderId: string
  ): Promise<void> {
    try {
      await NotificationService.sendNotification(
        dccId,
        'NETWORK_ERROR',
        {
          orderId
        }
      )

      console.log(`[NOTIFICATIONS] Network error notification sent for order ${orderId}`)
    } catch (error) {
      console.error('Error sending network error notification:', error)
    }
  }
}
