import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { verifyAuthToken } from "@/lib/token"
import { cookies } from "next/headers"
import { NotificationService } from "@/lib/notifications/service"
import { NotificationPreferences } from "@/lib/notifications/types"

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

    // Get user notification preferences
    const preferences = await NotificationService.getUserPreferences(user.id)

    return NextResponse.json({
      success: true,
      data: preferences
    })
  } catch (error) {
    console.error("Error fetching notification preferences:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Failed to fetch notification preferences" 
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
    const preferences: Partial<NotificationPreferences> = body

    // Update user notification preferences
    const updatedPreferences = await NotificationService.updateUserPreferences(user.id, preferences)

    return NextResponse.json({
      success: true,
      data: updatedPreferences,
      message: "Notification preferences updated successfully"
    })
  } catch (error) {
    console.error("Error updating notification preferences:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Failed to update notification preferences" 
    }, { status: 500 })
  }
}
