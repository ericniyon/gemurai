import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyAuthToken } from "@/lib/token"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const formConfigSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  sections: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    order: z.number(),
    questions: z.array(z.object({
      id: z.string(),
      type: z.string(),
      label: z.string(),
      placeholder: z.string(),
      required: z.boolean(),
      order: z.number(),
      options: z.array(z.string()).optional(),
      validation: z.object({
        pattern: z.string().optional(),
        message: z.string().optional(),
        maxSize: z.number().optional(),
        acceptedTypes: z.array(z.string()).optional(),
        minSelected: z.number().optional(),
      }).optional(),
    })),
  })),
})

// PATCH /api/v1/superadmin/form-configs/[id]
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log("🔍 Update form config API called for ID:", params.id)
    
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
    const validatedData = formConfigSchema.parse(body)

    const formConfig = await prisma.formConfig.update({
      where: { id: params.id },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        sections: validatedData.sections,
      },
    })

    console.log("✅ Form config updated successfully:", formConfig.id)

    return NextResponse.json({ success: true, config: formConfig })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("❌ Error updating form config:", error)
    return NextResponse.json(
      { success: false, message: "Failed to update form configuration" },
      { status: 500 }
    )
  }
}

// DELETE /api/v1/superadmin/form-configs/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log("🔍 Delete form config API called for ID:", params.id)
    
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

    await prisma.formConfig.delete({
      where: { id: params.id },
    })

    console.log("✅ Form config deleted successfully:", params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("❌ Error deleting form config:", error)
    return NextResponse.json(
      { success: false, message: "Failed to delete form configuration" },
      { status: 500 }
    )
  }
} 