import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { verifyAuthToken } from "@/lib/token"
import { cookies } from "next/headers"
import { NotificationService } from "@/lib/notifications/service"

export async function GET(req: Request) {
  try {
    let user = null;
    
    // Try token auth first (for DCC users)
    const authHeader = req.headers.get("Authorization")
    let token = null

    // Check Authorization header
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1]
    }
    
    // Try cookie if no Authorization header
    if (!token) {
      const cookieStore = await cookies()
      token = cookieStore.get("Gemurai_token")?.value || cookieStore.get("token")?.value
    }

    if (token) {
      const verifiedUser = await verifyAuthToken(token)
      if (verifiedUser) {
        user = verifiedUser
      }
    }

    // If no token auth, try NextAuth session
    if (!user) {
      const session = await getServerSession(authOptions)
      if (session?.user?.id) {
        user = session.user
      }
    }

    if (!user?.id) {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized. Please log in." 
      }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    // Get user notifications
    let notifications = await NotificationService.getUserNotifications(user.id, limit, offset)
    
    if (unreadOnly) {
      notifications = notifications.filter(n => n.status === 'SENT' || n.status === 'DELIVERED')
    }

    // Get unread count
    const unreadCount = await NotificationService.getUnreadCount(user.id)

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          limit,
          offset,
          hasMore: notifications.length === limit
        }
      }
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Failed to fetch notifications" 
    }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    let user = null;
    
    // Try token auth first (for DCC users)
    const authHeader = req.headers.get("Authorization")
    let token = null

    // Check Authorization header
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1]
    }
    
    // Try cookie if no Authorization header
    if (!token) {
      const cookieStore = await cookies()
      token = cookieStore.get("Gemurai_token")?.value || cookieStore.get("token")?.value
    }

    if (token) {
      const verifiedUser = await verifyAuthToken(token)
      if (verifiedUser) {
        user = verifiedUser
      }
    }

    // If no token auth, try NextAuth session
    if (!user) {
      const session = await getServerSession(authOptions)
      if (session?.user?.id) {
        user = session.user
      }
    }

    if (!user?.id) {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized. Please log in." 
      }, { status: 401 })
    }

    const body = await req.json()
    const { action, notificationId } = body

    if (action === 'markAsRead' && notificationId) {
      await NotificationService.markAsRead(notificationId)
      return NextResponse.json({
        success: true,
        message: "Notification marked as read"
      })
    }

    if (action === 'markAllAsRead') {
      await NotificationService.markAllAsRead(user.id)
      return NextResponse.json({
        success: true,
        message: "All notifications marked as read"
      })
    }

    return NextResponse.json({
      success: false,
      message: "Invalid action"
    }, { status: 400 })
  } catch (error) {
    console.error("Error updating notifications:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Failed to update notifications" 
    }, { status: 500 })
  }
}
