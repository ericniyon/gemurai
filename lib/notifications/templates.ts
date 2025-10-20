import { NotificationTemplate, NotificationType, NotificationPriority, NotificationChannel } from './types'

export const notificationTemplates: Record<NotificationType, NotificationTemplate> = {
  // DCC Notifications
  ORDER_CREATED: {
    type: 'ORDER_CREATED',
    title: 'Order Submitted Successfully',
    message: 'Your stock order #{orderId} has been submitted successfully. Total amount: {amount} RWF',
    priority: 'MEDIUM',
    channels: ['IN_APP', 'EMAIL']
  },
  
  PAYMENT_CONFIRMED: {
    type: 'PAYMENT_CONFIRMED',
    title: 'Payment Confirmed',
    message: 'Your stock order #{orderId} payment has been confirmed using voucher {voucherCode}',
    priority: 'HIGH',
    channels: ['IN_APP', 'EMAIL', 'SMS']
  },
  
  ORDER_APPROVED: {
    type: 'ORDER_APPROVED',
    title: 'Order Approved',
    message: 'Your stock order #{orderId} has been approved by {employerName}. Stock will be added to your inventory.',
    priority: 'HIGH',
    channels: ['IN_APP', 'EMAIL', 'SMS']
  },
  
  ORDER_REJECTED: {
    type: 'ORDER_REJECTED',
    title: 'Order Rejected',
    message: 'Your stock order #{orderId} has been rejected by {employerName}. Reason: {notes}',
    priority: 'HIGH',
    channels: ['IN_APP', 'EMAIL', 'SMS']
  },
  
  ORDER_COMPLETED: {
    type: 'ORDER_COMPLETED',
    title: 'Order Completed',
    message: 'Your stock order #{orderId} has been completed and delivered successfully.',
    priority: 'MEDIUM',
    channels: ['IN_APP', 'EMAIL']
  },
  
  ORDER_CANCELLED: {
    type: 'ORDER_CANCELLED',
    title: 'Order Cancelled',
    message: 'Your stock order #{orderId} has been cancelled. Stock has been restored.',
    priority: 'HIGH',
    channels: ['IN_APP', 'EMAIL', 'SMS']
  },

  // Employer Notifications
  NEW_ORDER_RECEIVED: {
    type: 'NEW_ORDER_RECEIVED',
    title: 'New Stock Order Received',
    message: 'New stock order #{orderId} received from DCC {dccName} ({dccEmail}). Total amount: {amount} RWF',
    priority: 'HIGH',
    channels: ['IN_APP', 'EMAIL', 'SMS']
  },
  
  PAYMENT_PENDING: {
    type: 'PAYMENT_PENDING',
    title: 'Payment Pending',
    message: 'Stock order #{orderId} payment is pending confirmation from DCC {dccName}',
    priority: 'MEDIUM',
    channels: ['IN_APP', 'EMAIL']
  },
  
  ORDER_REQUIRES_APPROVAL: {
    type: 'ORDER_REQUIRES_APPROVAL',
    title: 'Order Requires Approval',
    message: 'Stock order #{orderId} is ready for approval. Please review and approve/reject the order.',
    priority: 'HIGH',
    channels: ['IN_APP', 'EMAIL', 'SMS']
  },
  
  ORDER_COMPLETED_EMPLOYER: {
    type: 'ORDER_COMPLETED_EMPLOYER',
    title: 'Order Completed',
    message: 'Stock order #{orderId} has been completed successfully. Payment received: {amount} RWF',
    priority: 'MEDIUM',
    channels: ['IN_APP', 'EMAIL']
  },

  // System/Admin Notifications
  LOW_STOCK_ALERT: {
    type: 'LOW_STOCK_ALERT',
    title: 'Low Stock Alert',
    message: 'Product "{productName}" stock is running low. Only {stockRemaining} units remaining.',
    priority: 'HIGH',
    channels: ['IN_APP', 'EMAIL', 'SMS']
  },
  
  OUT_OF_STOCK_ALERT: {
    type: 'OUT_OF_STOCK_ALERT',
    title: 'Out of Stock Alert',
    message: 'Product "{productName}" is out of stock. Please restock immediately.',
    priority: 'CRITICAL',
    channels: ['IN_APP', 'EMAIL', 'SMS']
  },
  
  ORDER_PROCESSING_ERROR: {
    type: 'ORDER_PROCESSING_ERROR',
    title: 'Order Processing Error',
    message: 'Error processing stock order #{orderId}: {errorMessage}',
    priority: 'CRITICAL',
    channels: ['IN_APP', 'EMAIL', 'SMS']
  },
  
  PAYMENT_FAILED: {
    type: 'PAYMENT_FAILED',
    title: 'Payment Failed',
    message: 'Payment failed for stock order #{orderId}. Please check payment details.',
    priority: 'HIGH',
    channels: ['IN_APP', 'EMAIL', 'SMS']
  },

  // Voucher-Related Notifications
  VOUCHER_USED: {
    type: 'VOUCHER_USED',
    title: 'Voucher Used',
    message: 'Voucher {voucherCode} has been used for stock order #{orderId}. Amount used: {amount} RWF',
    priority: 'MEDIUM',
    channels: ['IN_APP', 'EMAIL']
  },
  
  VOUCHER_EXPIRED: {
    type: 'VOUCHER_EXPIRED',
    title: 'Voucher Expired',
    message: 'Voucher {voucherCode} has expired and cannot be used for new orders.',
    priority: 'MEDIUM',
    channels: ['IN_APP', 'EMAIL']
  },
  
  INSUFFICIENT_VOUCHER_BALANCE: {
    type: 'INSUFFICIENT_VOUCHER_BALANCE',
    title: 'Insufficient Voucher Balance',
    message: 'Insufficient voucher balance for order #{orderId}. Required: {amount} RWF',
    priority: 'HIGH',
    channels: ['IN_APP', 'EMAIL', 'SMS']
  },

  // Stock Management Notifications
  STOCK_DEDUCTED: {
    type: 'STOCK_DEDUCTED',
    title: 'Stock Deducted',
    message: 'Stock deducted for order #{orderId}: {productName} -{quantity} units. Remaining: {stockRemaining}',
    priority: 'MEDIUM',
    channels: ['IN_APP']
  },
  
  STOCK_ADDED_TO_DCC: {
    type: 'STOCK_ADDED_TO_DCC',
    title: 'Stock Added to DCC',
    message: 'Stock added to DCC {dccName} inventory for order #{orderId}: {productName} +{quantity} units',
    priority: 'MEDIUM',
    channels: ['IN_APP']
  },
  
  STOCK_RESTORED: {
    type: 'STOCK_RESTORED',
    title: 'Stock Restored',
    message: 'Stock restored for cancelled order #{orderId}: {productName} +{quantity} units',
    priority: 'MEDIUM',
    channels: ['IN_APP']
  },

  // Delivery/Logistics Notifications
  ORDER_SHIPPED: {
    type: 'ORDER_SHIPPED',
    title: 'Order Shipped',
    message: 'Stock order #{orderId} has been shipped and is on its way to delivery.',
    priority: 'MEDIUM',
    channels: ['IN_APP', 'EMAIL', 'SMS']
  },
  
  ORDER_DELIVERED: {
    type: 'ORDER_DELIVERED',
    title: 'Order Delivered',
    message: 'Stock order #{orderId} has been delivered successfully.',
    priority: 'MEDIUM',
    channels: ['IN_APP', 'EMAIL', 'SMS']
  },
  
  DELIVERY_FAILED: {
    type: 'DELIVERY_FAILED',
    title: 'Delivery Failed',
    message: 'Delivery failed for stock order #{orderId}. Please contact support.',
    priority: 'HIGH',
    channels: ['IN_APP', 'EMAIL', 'SMS']
  },

  // Financial Notifications
  PAYMENT_RECEIVED: {
    type: 'PAYMENT_RECEIVED',
    title: 'Payment Received',
    message: 'Payment received for stock order #{orderId}: {amount} RWF',
    priority: 'MEDIUM',
    channels: ['IN_APP', 'EMAIL']
  },
  
  COMMISSION_CALCULATED: {
    type: 'COMMISSION_CALCULATED',
    title: 'Commission Calculated',
    message: 'Commission calculated for order #{orderId}: {commission} RWF',
    priority: 'LOW',
    channels: ['IN_APP']
  },
  
  WALLET_UPDATED: {
    type: 'WALLET_UPDATED',
    title: 'Wallet Updated',
    message: 'Wallet balance updated for order #{orderId}. New balance: {amount} RWF',
    priority: 'LOW',
    channels: ['IN_APP']
  },

  // Status Change Notifications
  STATUS_UPDATED: {
    type: 'STATUS_UPDATED',
    title: 'Status Updated',
    message: 'Stock order #{orderId} status changed from {oldStatus} to {newStatus}',
    priority: 'MEDIUM',
    channels: ['IN_APP', 'EMAIL']
  },
  
  PRIORITY_CHANGED: {
    type: 'PRIORITY_CHANGED',
    title: 'Priority Changed',
    message: 'Stock order #{orderId} priority changed to {priority}',
    priority: 'MEDIUM',
    channels: ['IN_APP']
  },
  
  NOTES_ADDED: {
    type: 'NOTES_ADDED',
    title: 'Notes Added',
    message: 'Notes added to stock order #{orderId}: {notes}',
    priority: 'LOW',
    channels: ['IN_APP']
  },

  // Bulk Operations Notifications
  BULK_ORDER_CREATED: {
    type: 'BULK_ORDER_CREATED',
    title: 'Bulk Order Created',
    message: 'Bulk order created with {quantity} items. Total amount: {amount} RWF',
    priority: 'MEDIUM',
    channels: ['IN_APP', 'EMAIL']
  },
  
  BULK_ORDER_APPROVED: {
    type: 'BULK_ORDER_APPROVED',
    title: 'Bulk Order Approved',
    message: 'Bulk order approved with {quantity} items',
    priority: 'MEDIUM',
    channels: ['IN_APP', 'EMAIL']
  },
  
  BULK_ORDER_REJECTED: {
    type: 'BULK_ORDER_REJECTED',
    title: 'Bulk Order Rejected',
    message: 'Bulk order rejected with {quantity} items. Reason: {notes}',
    priority: 'HIGH',
    channels: ['IN_APP', 'EMAIL', 'SMS']
  },

  // Error/Exception Notifications
  DATABASE_ERROR: {
    type: 'DATABASE_ERROR',
    title: 'Database Error',
    message: 'Database error occurred while processing order #{orderId}: {errorMessage}',
    priority: 'CRITICAL',
    channels: ['IN_APP', 'EMAIL', 'SMS']
  },
  
  TRANSACTION_TIMEOUT: {
    type: 'TRANSACTION_TIMEOUT',
    title: 'Transaction Timeout',
    message: 'Transaction timeout for order #{orderId}. Please retry the operation.',
    priority: 'CRITICAL',
    channels: ['IN_APP', 'EMAIL', 'SMS']
  },
  
  VALIDATION_ERROR: {
    type: 'VALIDATION_ERROR',
    title: 'Validation Error',
    message: 'Validation error for order #{orderId}: {errorMessage}',
    priority: 'HIGH',
    channels: ['IN_APP', 'EMAIL']
  },
  
  NETWORK_ERROR: {
    type: 'NETWORK_ERROR',
    title: 'Network Error',
    message: 'Network error while processing order #{orderId}. Please check your connection.',
    priority: 'HIGH',
    channels: ['IN_APP', 'EMAIL', 'SMS']
  }
}

export function getNotificationTemplate(type: NotificationType): NotificationTemplate {
  return notificationTemplates[type]
}

export function formatNotificationMessage(template: NotificationTemplate, data: any): string {
  let message = template.message
  
  // Replace placeholders with actual data
  Object.keys(data).forEach(key => {
    const placeholder = `{${key}}`
    if (message.includes(placeholder)) {
      message = message.replace(new RegExp(placeholder, 'g'), data[key] || '')
    }
  })
  
  return message
}
