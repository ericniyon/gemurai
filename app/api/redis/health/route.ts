import { NextRequest, NextResponse } from 'next/server'
import { cacheService } from '@/lib/services/redis-service'

export async function GET(request: NextRequest) {
  try {
    // Check Redis health
    const isHealthy = await cacheService.healthCheck()
    
    if (!isHealthy) {
      return NextResponse.json({
        success: false,
        status: 'unhealthy',
        message: 'Redis is not responding'
      }, { status: 503 })
    }

    // Get cache statistics
    const stats = await cacheService.getStats()

    return NextResponse.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      stats: {
        keys: stats.keys,
        memory: stats.memory,
        uptime: process.uptime()
      }
    })

  } catch (error) {
    console.error('Redis health check error:', error)
    return NextResponse.json({
      success: false,
      status: 'error',
      message: 'Failed to check Redis health',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'clear_all':
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
          message: 'Invalid action. Use "clear_all" or "stats"'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Redis action error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to perform Redis action',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 