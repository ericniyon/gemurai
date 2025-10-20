// Redis Configuration
export const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
}

// Cache TTL Settings (in seconds)
export const CACHE_TTL = {
  SHORT: 300,      // 5 minutes
  MEDIUM: 1800,    // 30 minutes
  LONG: 3600,      // 1 hour
  VERY_LONG: 7200, // 2 hours
  DAY: 86400,      // 24 hours
} as const

// Cache Keys
export const CACHE_KEYS = {
  APPLICATIONS: 'applications:all',
  APPLICATION: (id: string) => `application:${id}`,
  INTERVIEW_SCORES: (applicationId: string) => `interview_scores:${applicationId}`,
  USER: (id: string) => `user:${id}`,
  USER_PERMISSIONS: (id: string) => `user_permissions:${id}`,
  INTERVIEW_CRITERIA: 'interview_criteria',
  WALLET: (userId: string) => `wallet:${userId}`,
  WALLET_TRANSACTIONS: (userId: string) => `wallet_transactions:${userId}`,
  DCC_PROFILES: 'dcc_profiles',
  PRODUCTS: 'products',
  ORDERS: 'orders',
} as const

// Cache Patterns for bulk operations
export const CACHE_PATTERNS = {
  APPLICATIONS: 'applications:*',
  USERS: 'user:*',
  WALLETS: 'wallet:*',
  INTERVIEW_SCORES: 'interview_scores:*',
} as const 