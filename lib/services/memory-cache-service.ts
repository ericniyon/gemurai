// Redis-based cache service for applications data
// This provides Redis functionality with external Redis server

import { cacheService, CACHE_KEYS, CACHE_TTL } from './redis-service'

interface CacheEntry<T> {
  value: T
  timestamp: number
  ttl: number
}

class MemoryCacheService {
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0
  }

  // Set cache with TTL
  async set(key: string, value: any, ttl: number = 300): Promise<void> {
    try {
      await cacheService.set(key, value, ttl)
      this.stats.sets++
      
      console.log(`💾 Cached data for key: ${key} (TTL: ${ttl}s)`)
    } catch (error) {
      console.error(`❌ Failed to cache data for key ${key}:`, error)
    }
  }

  // Get cache
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await cacheService.get<T>(key)
      
      if (value === null) {
        this.stats.misses++
        return null
      }
      
      this.stats.hits++
      console.log(`📖 Retrieved cached data for key: ${key}`)
      return value
    } catch (error) {
      console.error(`❌ Failed to retrieve cached data for key ${key}:`, error)
      return null
    }
  }

  // Delete cache
  async delete(key: string): Promise<void> {
    try {
      await cacheService.delete(key)
      this.stats.deletes++
      console.log(`🗑️ Deleted cache for key: ${key}`)
    } catch (error) {
      console.error(`❌ Failed to delete cache for key ${key}:`, error)
    }
  }

  // Delete multiple cache keys
  async deleteMultiple(keys: string[]): Promise<void> {
    try {
      await cacheService.deleteMultiple(keys)
      this.stats.deletes += keys.length
      console.log(`🗑️ Deleted multiple cache keys: ${keys.length} keys`)
    } catch (error) {
      console.error(`❌ Failed to delete multiple cache keys:`, error)
    }
  }

  // Clear all applications cache
  async clearApplicationsCache(): Promise<void> {
    try {
      await cacheService.deleteByPattern('applications:*')
      console.log('🧹 Cleared all applications cache')
    } catch (error) {
      console.error('❌ Failed to clear applications cache:', error)
    }
  }

  // Check if Redis is available
  async isAvailable(): Promise<boolean> {
    try {
      return await cacheService.healthCheck()
    } catch (error) {
      console.error('❌ Redis availability check failed:', error)
      return false
    }
  }

  // Get cache statistics
  async getStats(): Promise<{ keys: number; memory: string; hits: number; misses: number; sets: number; deletes: number }> {
    try {
      const redisStats = await cacheService.getStats()
      
      return {
        keys: redisStats.keys,
        memory: redisStats.memory,
        hits: this.stats.hits,
        misses: this.stats.misses,
        sets: this.stats.sets,
        deletes: this.stats.deletes
      }
    } catch (error) {
      console.error('❌ Failed to get cache stats:', error)
      return {
        keys: 0,
        memory: 'Unknown',
        hits: this.stats.hits,
        misses: this.stats.misses,
        sets: this.stats.sets,
        deletes: this.stats.deletes
      }
    }
  }

  // Cleanup expired entries (Redis handles this automatically)
  async cleanup(): Promise<void> {
    try {
      console.log('🧹 Redis handles cleanup automatically')
    } catch (error) {
      console.error('❌ Cleanup failed:', error)
    }
  }

  // Get cache keys by pattern
  async getKeysByPattern(pattern: string): Promise<string[]> {
    try {
      // This would require direct Redis access, but we'll use a simpler approach
      console.log(`🔍 Pattern search requested: ${pattern}`)
      return []
    } catch (error) {
      console.error('❌ Failed to get keys by pattern:', error)
      return []
    }
  }

  // Get cache size
  async getSize(): Promise<number> {
    try {
      const stats = await cacheService.getStats()
      return stats.keys
    } catch (error) {
      console.error('❌ Failed to get cache size:', error)
      return 0
    }
  }

  // Get cache memory usage
  async getMemoryUsage(): Promise<string> {
    try {
      const stats = await cacheService.getStats()
      return stats.memory
    } catch (error) {
      console.error('❌ Failed to get memory usage:', error)
      return 'Unknown'
    }
  }

  // Clear all cache
  async clearAll(): Promise<void> {
    try {
      await cacheService.clearAll()
      console.log('🧹 Cleared all cache')
    } catch (error) {
      console.error('❌ Failed to clear all cache:', error)
    }
  }
}

// Create singleton instance
const memoryCacheService = new MemoryCacheService()

// Export the singleton instance
export { memoryCacheService as cacheService }

// Helper functions for applications caching
export const cacheApplications = async (applications: any[]): Promise<void> => {
  await cacheService.set(CACHE_KEYS.APPLICATIONS, applications, CACHE_TTL.MEDIUM)
}

export const getCachedApplications = async (): Promise<any[] | null> => {
  return await cacheService.get<any[]>(CACHE_KEYS.APPLICATIONS)
}

export const cacheApplicationsByStatus = async (status: string, applications: any[]): Promise<void> => {
  const key = `applications:${status}`
  await cacheService.set(key, applications, CACHE_TTL.MEDIUM)
}

export const getCachedApplicationsByStatus = async (status: string): Promise<any[] | null> => {
  const key = `applications:${status}`
  return await cacheService.get<any[]>(key)
}

export const cacheGoogleSheetsData = async (data: any): Promise<void> => {
  await cacheService.set('google_sheets_data', data, CACHE_TTL.SHORT)
}

export const getCachedGoogleSheetsData = async (): Promise<any | null> => {
  return await cacheService.get('google_sheets_data')
}

export const getLastGoogleSheetsFetch = async (): Promise<number | null> => {
  return await cacheService.get<number>('last_google_sheets_fetch')
} 