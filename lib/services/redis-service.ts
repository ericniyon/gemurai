import Redis from 'ioredis'

// Redis configuration
const redisConfig = {
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

// In-memory fallback cache
class InMemoryCache {
  private cache = new Map<string, { value: any; expires: number }>()

  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    const expires = Date.now() + (ttlSeconds * 1000)
    this.cache.set(key, { value, expires })
    console.log(`💾 In-memory cached: ${key} (TTL: ${ttlSeconds}s)`)
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key)
    if (!entry) return null
    
    if (Date.now() > entry.expires) {
      this.cache.delete(key)
      return null
    }
    
    console.log(`📖 Retrieved from in-memory cache: ${key}`)
    return entry.value as T
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key)
    console.log(`🗑️ Deleted in-memory cache: ${key}`)
  }

  async deleteMultiple(keys: string[]): Promise<void> {
    keys.forEach(key => this.cache.delete(key))
    console.log(`🗑️ Deleted multiple in-memory cache keys: ${keys.length} keys`)
  }

  async deleteByPattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern.replace('*', '.*'))
    const keysToDelete: string[] = []
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key)
      }
    }
    
    await this.deleteMultiple(keysToDelete)
  }

  async exists(key: string): Promise<boolean> {
    return this.cache.has(key)
  }

  async getTTL(key: string): Promise<number> {
    const entry = this.cache.get(key)
    if (!entry) return -1
    return Math.max(0, Math.floor((entry.expires - Date.now()) / 1000))
  }

  async increment(key: string, value: number = 1): Promise<number> {
    const current = await this.get<number>(key) || 0
    const newValue = current + value
    await this.set(key, newValue, 3600)
    return newValue
  }

  async setNX(key: string, value: any, ttlSeconds: number = 3600): Promise<boolean> {
    if (await this.exists(key)) return false
    await this.set(key, value, ttlSeconds)
    return true
  }

  async getOrSet<T>(key: string, fetchFunction: () => Promise<T>, ttlSeconds: number = 3600): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached !== null) return cached
    
    console.log(`🔄 In-memory cache miss for ${key}, fetching from source...`)
    const data = await fetchFunction()
    await this.set(key, data, ttlSeconds)
    return data
  }

  async clearAll(): Promise<void> {
    this.cache.clear()
    console.log('🧹 Cleared all in-memory cache')
  }

  async getStats(): Promise<{ keys: number; memory: string }> {
    return {
      keys: this.cache.size,
      memory: `${this.cache.size} entries in memory`
    }
  }

  async healthCheck(): Promise<boolean> {
    return true
  }

  async close(): Promise<void> {
    this.cache.clear()
    console.log('🔌 In-memory cache closed')
  }
}

// Create Redis client with fallback
let redis: Redis | null = null
let useInMemoryFallback = false

// Check if Redis is disabled
if (process.env.REDIS_DISABLED === 'true') {
  console.log('🚫 Redis disabled by environment variable')
  useInMemoryFallback = true
} else {
  try {
    redis = new Redis(redisConfig)
    
    // Handle Redis events
    redis.on('connect', () => {
      console.log('✅ Redis connected successfully')
      useInMemoryFallback = false
    })

    redis.on('error', (error) => {
      console.error('❌ Redis connection error:', error)
      console.log('🔄 Falling back to in-memory cache')
      useInMemoryFallback = true
    })

    redis.on('close', () => {
      console.log('🔌 Redis connection closed')
      useInMemoryFallback = true
    })

    redis.on('reconnecting', () => {
      console.log('🔄 Redis reconnecting...')
    })
  } catch (error) {
    console.error('❌ Failed to initialize Redis, using in-memory fallback:', error)
    useInMemoryFallback = true
  }
}

// Cache service class
export class CacheService {
  private static instance: CacheService
  private redis: Redis | null
  private inMemoryCache: InMemoryCache

  private constructor() {
    this.redis = redis
    this.inMemoryCache = new InMemoryCache()
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService()
    }
    return CacheService.instance
  }

  private async getActiveCache() {
    if (this.redis && !useInMemoryFallback) {
      try {
        await this.redis.ping()
        return this.redis
      } catch (error) {
        console.log('🔄 Redis unavailable, switching to in-memory cache')
        useInMemoryFallback = true
      }
    }
    return this.inMemoryCache
  }

  // Set cache with TTL
  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    const cache = await this.getActiveCache()
    
    // If it's the in-memory cache, use its set method
    if (cache instanceof InMemoryCache) {
      await cache.set(key, value, ttlSeconds)
      return
    }
    
    // If it's Redis, use Redis SET command with EX option
    if (cache && typeof cache.set === 'function') {
      const serializedValue = JSON.stringify(value)
      await cache.set(key, serializedValue, 'EX', ttlSeconds)
      return
    }
    
    throw new Error('No valid cache available')
  }

  // Get cache
  async get<T>(key: string): Promise<T | null> {
    const cache = await this.getActiveCache()
    
    // If it's the in-memory cache, use its get method
    if (cache instanceof InMemoryCache) {
      return await cache.get<T>(key)
    }
    
    // If it's Redis, use Redis GET command
    if (cache && typeof cache.get === 'function') {
      try {
        const value = await cache.get(key)
        if (value === null) return null
        
        // Try to parse as JSON, fallback to string
        try {
          return JSON.parse(value) as T
        } catch {
          return value as T
        }
      } catch (error) {
        console.error('Redis get error:', error)
        return null
      }
    }
    
    return null
  }

  // Delete cache
  async delete(key: string): Promise<void> {
    const cache = await this.getActiveCache()
    
    // If it's the in-memory cache, use its delete method
    if (cache instanceof InMemoryCache) {
      await cache.delete(key)
      return
    }
    
    // If it's Redis, use Redis DEL command
    if (cache && typeof cache.del === 'function') {
      await cache.del(key)
      return
    }
    
    throw new Error('No valid cache available')
  }

  // Delete multiple cache keys
  async deleteMultiple(keys: string[]): Promise<void> {
    const cache = await this.getActiveCache()
    await cache.deleteMultiple(keys)
  }

  // Delete cache by pattern
  async deleteByPattern(pattern: string): Promise<void> {
    const cache = await this.getActiveCache()
    await cache.deleteByPattern(pattern)
  }

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    const cache = await this.getActiveCache()
    return await cache.exists(key)
  }

  // Get TTL for a key
  async getTTL(key: string): Promise<number> {
    const cache = await this.getActiveCache()
    return await cache.getTTL(key)
  }

  // Increment counter
  async increment(key: string, value: number = 1): Promise<number> {
    const cache = await this.getActiveCache()
    return await cache.increment(key, value)
  }

  // Set cache with TTL if not exists
  async setNX(key: string, value: any, ttlSeconds: number = 3600): Promise<boolean> {
    const cache = await this.getActiveCache()
    return await cache.setNX(key, value, ttlSeconds)
  }

  // Get or set cache (cache-aside pattern)
  async getOrSet<T>(key: string, fetchFunction: () => Promise<T>, ttlSeconds: number = 3600): Promise<T> {
    const cache = await this.getActiveCache()
    return await cache.getOrSet(key, fetchFunction, ttlSeconds)
  }

  // Clear all cache
  async clearAll(): Promise<void> {
    const cache = await this.getActiveCache()
    
    // If it's the in-memory cache, use its clearAll method
    if (cache instanceof InMemoryCache) {
      await cache.clearAll()
      return
    }
    
    // If it's Redis, use Redis FLUSHDB command
    if (cache && typeof cache.flushdb === 'function') {
      await cache.flushdb()
      return
    }
    
    throw new Error('No valid cache available')
  }

  // Get cache statistics
  async getStats(): Promise<{ keys: number; memory: string }> {
    const cache = await this.getActiveCache()
    
    // If it's the in-memory cache, use its getStats method
    if (cache instanceof InMemoryCache) {
      return await cache.getStats()
    }
    
    // If it's Redis, get statistics from Redis
    if (cache && typeof cache.info === 'function') {
      try {
        const info = await cache.info()
        const keysMatch = info.match(/db0:keys=(\d+)/)
        const keys = keysMatch ? parseInt(keysMatch[1]) : 0
        
        return {
          keys,
          memory: 'Redis server'
        }
      } catch (error) {
        console.error('Failed to get Redis stats:', error)
        return {
          keys: 0,
          memory: 'Redis server (error getting stats)'
        }
      }
    }
    
    // Fallback
    return {
      keys: 0,
      memory: 'Unknown cache type'
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    const cache = await this.getActiveCache()
    
    // Check if the cache has a healthCheck method
    if (typeof cache.healthCheck === 'function') {
      return await cache.healthCheck()
    }
    
    // For Redis client, try ping
    if (cache && typeof cache.ping === 'function') {
      try {
        await cache.ping()
        return true
      } catch (error) {
        console.error('Redis ping failed:', error)
        return false
      }
    }
    
    // Fallback: assume healthy if we got this far
    return true
  }

  // Close Redis connection
  async close(): Promise<void> {
    if (this.redis) {
      await this.redis.quit()
    }
    await this.inMemoryCache.close()
  }
}

// Export singleton instance
export const cacheService = CacheService.getInstance()

// Export Redis client for direct access if needed
export { redis }

// Cache keys constants
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

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  SHORT: 300,      // 5 minutes
  MEDIUM: 1800,    // 30 minutes
  LONG: 3600,      // 1 hour
  VERY_LONG: 7200, // 2 hours
  DAY: 86400,      // 24 hours
} as const 