import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyAuthToken } from "@/lib/token"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const courseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  duration: z.string().min(1, "Duration is required"),
  level: z.enum(["Beginner", "Intermediate", "Advanced"]),
  category: z.enum(["Technical", "Business", "Soft Skills", "Other"]),
  price: z.number().min(0, "Price must be 0 or greater"),
  isPublished: z.boolean(),
})

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log("🔍 Update course API called for ID:", params.id)
    
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
    const validatedData = courseSchema.parse(body)

    // Transform data to match database schema
    const courseData = {
      title: validatedData.title,
      description: validatedData.description,
      duration: validatedData.duration,
      level: validatedData.level,
      category: validatedData.category,
      price: validatedData.price,
      isActive: validatedData.isPublished, // Map isPublished to isActive
    }

    const course = await prisma.course.update({
      where: { id: params.id },
      data: courseData,
    })

    console.log("✅ Course updated successfully:", course.id)

    return NextResponse.json({ success: true, course })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("❌ Error updating course:", error)
    return NextResponse.json(
      { success: false, message: "Failed to update course" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log("🔍 Delete course API called for ID:", params.id)
    
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

    await prisma.course.delete({
      where: { id: params.id },
    })

    console.log("✅ Course deleted successfully:", params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("❌ Error deleting course:", error)
    return NextResponse.json(
      { success: false, message: "Failed to delete course" },
      { status: 500 }
    )
  }
} 