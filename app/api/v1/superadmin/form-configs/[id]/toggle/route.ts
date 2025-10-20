import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyAuthToken } from "@/lib/token"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const toggleSchema = z.object({
  isActive: z.boolean(),
})

// PATCH /api/v1/superadmin/form-configs/[id]/toggle
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log("🔍 Toggle form config API called for ID:", params.id)
    
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
    const { isActive } = toggleSchema.parse(body)

    // If activating this config, deactivate all others first
    if (isActive) {
      await prisma.formConfig.updateMany({
        where: {
          isActive: true,
        },
        data: {
          isActive: false,
        },
      })
    }

    const formConfig = await prisma.formConfig.update({
      where: { id: params.id },
      data: { isActive },
    })

    console.log("✅ Form config toggle updated:", formConfig.id, "isActive:", formConfig.isActive)

    return NextResponse.json({ success: true, config: formConfig })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("❌ Error toggling form config:", error)
    return NextResponse.json(
      { success: false, message: "Failed to toggle form configuration" },
      { status: 500 }
    )
  }
} 