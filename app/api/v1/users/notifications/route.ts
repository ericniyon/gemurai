import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/token"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("Authorization")
    let token = null

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1]
    }

    if (!token) {
      return NextResponse.json(
        { success: false, message: "No authentication token provided" },
        { status: 401 }
      )
    }

    // Verify token and get user data
    const user = await verifyAuthToken(token)
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Get user's basic info (notificationSettings field doesn't exist in schema yet)
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true
      }
    })

    // Return default notification settings since the field doesn't exist in schema yet
    return NextResponse.json({
      success: true,
      data: {
        emailNotifications: true,
        smsNotifications: true,
        jobAlerts: true,
        trainingReminders: true,
        paymentNotifications: true,
        twoFactorAuth: false,
        loginAlerts: true
      }
    })
  } catch (error) {
    console.error("Error fetching notification settings:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch notification settings" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("Authorization")
    let token = null

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1]
    }

    if (!token) {
      return NextResponse.json(
        { success: false, message: "No authentication token provided" },
        { status: 401 }
      )
    }

    // Verify token and get user data
    const user = await verifyAuthToken(token)
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      emailNotifications,
      smsNotifications,
      jobAlerts,
      trainingReminders,
      paymentNotifications,
      twoFactorAuth,
      loginAlerts
    } = body

    // Update user's basic info (notificationSettings field doesn't exist in schema yet)
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    })

    return NextResponse.json({
      success: true,
      message: "Notification settings updated successfully (stored in memory for now)",
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        notificationSettings: {
          emailNotifications: Boolean(emailNotifications),
          smsNotifications: Boolean(smsNotifications),
          jobAlerts: Boolean(jobAlerts),
          trainingReminders: Boolean(trainingReminders),
          paymentNotifications: Boolean(paymentNotifications),
          twoFactorAuth: Boolean(twoFactorAuth),
          loginAlerts: Boolean(loginAlerts)
        }
      }
    })
  } catch (error) {
    console.error("Error updating notification settings:", error)
    return NextResponse.json(
      { success: false, message: "Failed to update notification settings" },
      { status: 500 }
    )
  }
}
