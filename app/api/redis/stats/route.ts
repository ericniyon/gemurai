import { NextRequest, NextResponse } from 'next/server'
import { cacheService } from '@/lib/services/redis-service'

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Redis stats requested')

    // Check Redis health first
    const isHealthy = await cacheService.healthCheck()
    
    if (!isHealthy) {
      return NextResponse.json({
        success: false,
        status: 'unhealthy',
        message: 'Redis is not responding',
        timestamp: new Date().toISOString()
      }, { status: 503 })
    }

    // Get basic cache statistics
    const basicStats = await cacheService.getStats()

    // Get additional Redis information if available
    let redisInfo: {
      version: string;
      uptime: string;
      connected_clients: string;
      used_memory_human: string;
      total_commands_processed: string;
      keyspace_hits: string;
      keyspace_misses: string;
    } | null = null
    let performance = {
      hit_rate: '0.00%',
      total_requests: 0,
      hits: 0,
      misses: 0
    }

    try {
      // Try to get Redis INFO command data
      const { redis } = await import('@/lib/services/redis-service')
      if (redis) {
        // Get Redis server information
        const info = await redis.info()
        redisInfo = {
          version: info.match(/redis_version:([^\r\n]+)/)?.[1] || 'unknown',
          uptime: info.match(/uptime_in_seconds:([^\r\n]+)/)?.[1] || 'unknown',
          connected_clients: info.match(/connected_clients:([^\r\n]+)/)?.[1] || '0',
          used_memory_human: info.match(/used_memory_human:([^\r\n]+)/)?.[1] || 'unknown',
          total_commands_processed: info.match(/total_commands_processed:([^\r\n]+)/)?.[1] || '0',
          keyspace_hits: info.match(/keyspace_hits:([^\r\n]+)/)?.[1] || '0',
          keyspace_misses: info.match(/keyspace_misses:([^\r\n]+)/)?.[1] || '0'
        }

        // Calculate hit rate
        const hits = parseInt(redisInfo.keyspace_hits || '0')
        const misses = parseInt(redisInfo.keyspace_misses || '0')
        const totalRequests = hits + misses
        const hitRate = totalRequests > 0 ? ((hits / totalRequests) * 100).toFixed(2) : '0.00'

        performance = {
          hit_rate: `${hitRate}%`,
          total_requests: totalRequests,
          hits,
          misses
        }
      }
    } catch (redisError) {
      console.log('⚠️ Could not fetch detailed Redis info:', redisError)
    }

    return NextResponse.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      stats: {
        basic: {
          keys: basicStats.keys,
          memory: basicStats.memory,
          uptime: process.uptime()
        },
        redis: redisInfo,
        performance
      }
    })

  } catch (error) {
    console.error('❌ Redis stats error:', error)
    return NextResponse.json({
      success: false,
      status: 'error',
      message: 'Failed to get Redis statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, key, value, ttl } = body

    switch (action) {
      case 'set':
        if (!key || value === undefined) {
          return NextResponse.json({
            success: false,
            message: 'Key and value are required for set action'
          }, { status: 400 })
        }
        await cacheService.set(key, value, ttl || 3600)
        return NextResponse.json({
          success: true,
          message: `Cache set successfully: ${key}`
        })

      case 'get':
        if (!key) {
          return NextResponse.json({
            success: false,
            message: 'Key is required for get action'
          }, { status: 400 })
        }
        const cachedValue = await cacheService.get(key)
        return NextResponse.json({
          success: true,
          key,
          value: cachedValue,
          exists: cachedValue !== null
        })

      case 'delete':
        if (!key) {
          return NextResponse.json({
            success: false,
            message: 'Key is required for delete action'
          }, { status: 400 })
        }
        await cacheService.delete(key)
        return NextResponse.json({
          success: true,
          message: `Cache deleted successfully: ${key}`
        })

      case 'clear':
        await cacheService.clearAll()
        return NextResponse.json({
          success: true,
          message: 'All cache cleared successfully'
        })

      case 'stats':
        const stats = await cacheService.getStats()
        return NextResponse.json({
          success: true,
          stats
        })

      default:
        return NextResponse.json({
          success: false,
          message: 'Invalid action. Use "set", "get", "delete", "clear", or "stats"'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('❌ Redis action error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to perform Redis action',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 