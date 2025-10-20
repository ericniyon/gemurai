import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyAuthToken } from "@/lib/token"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const publishSchema = z.object({
  isPublished: z.boolean(),
})

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log("🔍 Publish course API called for ID:", params.id)
    
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
    const { isPublished } = publishSchema.parse(body)

    // Map isPublished to isActive for database
    const course = await prisma.course.update({
      where: { id: params.id },
      data: { isActive: isPublished },
    })

    console.log("✅ Course publish status updated:", course.id, "isActive:", course.isActive)

    return NextResponse.json({ success: true, course })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("❌ Error updating course publish status:", error)
    return NextResponse.json(
      { success: false, message: "Failed to update course publish status" },
      { status: 500 }
    )
  }
} 