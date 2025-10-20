import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyAuthToken } from "@/lib/token"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { defaultFormConfig } from "@/lib/form-service"

// GET /api/v1/superadmin/form/config
export async function GET() {
  try {
    // Verify superadmin authentication
    const cookieStore = await cookies()
    const token = cookieStore.get("Gemurai_token")

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await verifyAuthToken(token.value)

    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      )
    }

    // Get form config from database
    const formConfig = await prisma.formConfig.findFirst({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // If no config exists, return default config
    if (!formConfig) {
      return NextResponse.json({
        success: true,
        config: defaultFormConfig
      })
    }

    return NextResponse.json({
      success: true,
      config: formConfig
    })
  } catch (error) {
    console.error("Error fetching form config:", error)
    return NextResponse.json({
      success: false,
      message: "Failed to fetch form configuration",
      config: defaultFormConfig // Fallback to default config on error
    })
  }
}

// POST /api/v1/superadmin/form/config
export async function POST(request: Request) {
  try {
    // Verify superadmin authentication
    const cookieStore = await cookies()
    const token = cookieStore.get("Gemurai_token")

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await verifyAuthToken(token.value)

    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { config } = body

    if (!config) {
      return NextResponse.json(
        { success: false, message: "Form configuration is required" },
        { status: 400 }
      )
    }

    // Deactivate all existing configs
    await prisma.formConfig.updateMany({
      where: {
        isActive: true,
      },
      data: {
        isActive: false,
      },
    })

    // Create new config
    const newConfig = await prisma.formConfig.create({
      data: {
        ...config,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      },
    })

    return NextResponse.json({
      success: true,
      config: newConfig
    })
  } catch (error) {
    console.error("Error saving form config:", error)
    return NextResponse.json(
      { success: false, message: "Failed to save form configuration" },
      { status: 500 }
    )
  }
} 