export type NotificationType = 
  // DCC Notifications
  | 'ORDER_CREATED'
  | 'PAYMENT_CONFIRMED'
  | 'ORDER_APPROVED'
  | 'ORDER_REJECTED'
  | 'ORDER_COMPLETED'
  | 'ORDER_CANCELLED'
  
  // Employer Notifications
  | 'NEW_ORDER_RECEIVED'
  | 'PAYMENT_PENDING'
  | 'ORDER_REQUIRES_APPROVAL'
  | 'ORDER_COMPLETED_EMPLOYER'
  
  // System/Admin Notifications
  | 'LOW_STOCK_ALERT'
  | 'OUT_OF_STOCK_ALERT'
  | 'ORDER_PROCESSING_ERROR'
  | 'PAYMENT_FAILED'
  
  // Voucher-Related Notifications
  | 'VOUCHER_USED'
  | 'VOUCHER_EXPIRED'
  | 'INSUFFICIENT_VOUCHER_BALANCE'
  
  // Stock Management Notifications
  | 'STOCK_DEDUCTED'
  | 'STOCK_ADDED_TO_DCC'
  | 'STOCK_RESTORED'
  
  // Delivery/Logistics Notifications
  | 'ORDER_SHIPPED'
  | 'ORDER_DELIVERED'
  | 'DELIVERY_FAILED'
  
  // Financial Notifications
  | 'PAYMENT_RECEIVED'
  | 'COMMISSION_CALCULATED'
  | 'WALLET_UPDATED'
  
  // Status Change Notifications
  | 'STATUS_UPDATED'
  | 'PRIORITY_CHANGED'
  | 'NOTES_ADDED'
  
  // Bulk Operations Notifications
  | 'BULK_ORDER_CREATED'
  | 'BULK_ORDER_APPROVED'
  | 'BULK_ORDER_REJECTED'
  
  // Error/Exception Notifications
  | 'DATABASE_ERROR'
  | 'TRANSACTION_TIMEOUT'
  | 'VALIDATION_ERROR'
  | 'NETWORK_ERROR'

export type NotificationChannel = 
  | 'IN_APP'
  | 'EMAIL'
  | 'SMS'
  | 'PUSH'

export type NotificationPriority = 
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL'

export type NotificationStatus = 
  | 'PENDING'
  | 'SENT'
  | 'DELIVERED'
  | 'READ'
  | 'FAILED'

export interface NotificationData {
  orderId?: string
  productId?: string
  productName?: string
  quantity?: number
  amount?: number
  voucherCode?: string
  dccName?: string
  dccEmail?: string
  employerName?: string
  employerEmail?: string
  oldStatus?: string
  newStatus?: string
  priority?: string
  notes?: string
  errorMessage?: string
  stockRemaining?: number
  commission?: number
  [key: string]: any
}

export interface NotificationTemplate {
  type: NotificationType
  title: string
  message: string
  priority: NotificationPriority
  channels: NotificationChannel[]
  data?: NotificationData
}

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: NotificationData
  status: NotificationStatus
  priority: NotificationPriority
  channels: NotificationChannel[]
  sentAt?: Date
  deliveredAt?: Date
  readAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface NotificationPreferences {
  userId: string
  emailEnabled: boolean
  smsEnabled: boolean
  pushEnabled: boolean
  inAppEnabled: boolean
  types: {
    [key in NotificationType]: boolean
  }
  frequency: 'IMMEDIATE' | 'DAILY' | 'WEEKLY'
  quietHours: {
    enabled: boolean
    start: string // HH:mm format
    end: string // HH:mm format
  }
}
