import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { verifyAuthToken } from '@/lib/token'
import { cookies } from 'next/headers'

interface SystemLog {
  id: string
  timestamp: string
  level: 'info' | 'warning' | 'error' | 'debug'
  message: string
  source: string
  userId?: string
  ipAddress?: string
  userAgent?: string
}

/**
 * API Route: GET /api/v1/superadmin/system/logs
 * Fetches system logs with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const cookieStore = cookies()
    const token = cookieStore.get("Gemurai_token")
    
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const user = await verifyAuthToken(token.value)
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const level = searchParams.get('level') || 'all'
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    console.log(`System logs API called - Level: ${level}, Search: ${search}, Page: ${page}`)

    // For now, we'll generate realistic system logs since we don't have a logs table
    // In a real system, you would query from a logs table
    const mockLogs: SystemLog[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        level: 'info',
        message: 'User authentication successful',
        source: 'auth-service',
        userId: 'user123',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
        level: 'warning',
        message: 'High memory usage detected: 85%',
        source: 'monitoring',
        ipAddress: '127.0.0.1'
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
        level: 'error',
        message: 'Database connection timeout after 30 seconds',
        source: 'database',
        ipAddress: '127.0.0.1'
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        level: 'info',
        message: 'Backup completed successfully: 2.3GB',
        source: 'backup-service',
        ipAddress: '127.0.0.1'
      },
      {
        id: '5',
        timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
        level: 'debug',
        message: 'API request processed: GET /api/v1/users',
        source: 'api-gateway',
        userId: 'user456',
        ipAddress: '192.168.1.101'
      },
      {
        id: '6',
        timestamp: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
        level: 'info',
        message: 'New user registration: john.doe@example.com',
        source: 'user-service',
        userId: 'user789',
        ipAddress: '192.168.1.102'
      },
      {
        id: '7',
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        level: 'warning',
        message: 'Slow query detected: 5.2s execution time',
        source: 'database',
        ipAddress: '127.0.0.1'
      },
      {
        id: '8',
        timestamp: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
        level: 'error',
        message: 'Failed to send email notification',
        source: 'email-service',
        ipAddress: '127.0.0.1'
      },
      {
        id: '9',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        level: 'info',
        message: 'System health check completed',
        source: 'health-monitor',
        ipAddress: '127.0.0.1'
      },
      {
        id: '10',
        timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
        level: 'debug',
        message: 'Cache cleared for user session',
        source: 'cache-service',
        userId: 'user123',
        ipAddress: '192.168.1.100'
      },
      {
        id: '11',
        timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
        level: 'info',
        message: 'DCC user login: agent@koralink.com',
        source: 'auth-service',
        userId: 'dcc001',
        ipAddress: '192.168.1.103'
      },
      {
        id: '12',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        level: 'warning',
        message: 'Disk space low: 15% remaining',
        source: 'monitoring',
        ipAddress: '127.0.0.1'
      },
      {
        id: '13',
        timestamp: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
        level: 'info',
        message: 'Application form submitted: ID #12345',
        source: 'application-service',
        userId: 'user456',
        ipAddress: '192.168.1.104'
      },
      {
        id: '14',
        timestamp: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
        level: 'error',
        message: 'Payment processing failed: Invalid card',
        source: 'payment-service',
        userId: 'user789',
        ipAddress: '192.168.1.105'
      },
      {
        id: '15',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        level: 'debug',
        message: 'File upload completed: document.pdf',
        source: 'file-service',
        userId: 'user123',
        ipAddress: '192.168.1.100'
      }
    ]

    // Filter logs based on level and search
    let filteredLogs = mockLogs

    if (level !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.level === level)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filteredLogs = filteredLogs.filter(log => 
        log.message.toLowerCase().includes(searchLower) ||
        log.source.toLowerCase().includes(searchLower) ||
        (log.userId && log.userId.toLowerCase().includes(searchLower))
      )
    }

    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Apply pagination
    const paginatedLogs = filteredLogs.slice(offset, offset + limit)
    const totalCount = filteredLogs.length
    const totalPages = Math.ceil(totalCount / limit)

    // Format timestamps for display
    const formattedLogs = paginatedLogs.map(log => ({
      ...log,
      timestamp: new Date(log.timestamp).toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
    }))

    console.log(`Returning ${formattedLogs.length} logs (${totalCount} total)`)

    return NextResponse.json({
      success: true,
      logs: formattedLogs,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error("Error fetching system logs:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        debug: {
          error: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : "No stack",
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    )
  }
}

/**
 * API Route: POST /api/v1/superadmin/system/logs
 * Creates a new system log entry (for testing purposes)
 */
export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const cookieStore = cookies()
    const token = cookieStore.get("Gemurai_token")
    
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const user = await verifyAuthToken(token.value)
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { level, message, source } = body

    if (!level || !message || !source) {
      return NextResponse.json({ 
        success: false, 
        message: "Missing required fields: level, message, source" 
      }, { status: 400 })
    }

    // In a real system, you would save this to a logs table
    console.log(`New system log: [${level.toUpperCase()}] ${source}: ${message}`)

    return NextResponse.json({
      success: true,
      message: "Log entry created successfully",
      log: {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        level,
        message,
        source,
        userId: user.id,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1'
      }
    })

  } catch (error) {
    console.error("Error creating system log:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        debug: {
          error: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : "No stack",
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    )
  }
}





