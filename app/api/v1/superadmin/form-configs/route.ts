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

// GET /api/v1/superadmin/form-configs
export async function GET() {
  try {
    console.log("🔍 Form configs API called")
    
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

    console.log("✅ Super admin authenticated, fetching form configs...")

    // Get all form configs
    const formConfigs = await prisma.formConfig.findMany({
      orderBy: { createdAt: "desc" },
    })

    console.log(`📊 Found ${formConfigs.length} form configs`)

    return NextResponse.json({ success: true, configs: formConfigs })
  } catch (error) {
    console.error("❌ Error fetching form configs:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/v1/superadmin/form-configs
export async function POST(request: Request) {
  try {
    console.log("🔍 Create form config API called")
    
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

    // Create new form config
    const formConfig = await prisma.formConfig.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        sections: validatedData.sections,
        isActive: false, // New configs are inactive by default
      },
    })

    console.log("✅ Form config created successfully:", formConfig.id)

    return NextResponse.json({ success: true, config: formConfig })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("❌ Error creating form config:", error)
    return NextResponse.json(
      { success: false, message: "Failed to create form configuration" },
      { status: 500 }
    )
  }
} 