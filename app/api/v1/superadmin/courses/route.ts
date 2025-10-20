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

// GET /api/v1/superadmin/courses
export async function GET() {
  try {
    console.log("🔍 Courses API called")
    
    // Verify superadmin authentication
    const cookieStore = await cookies()
    const token = cookieStore.get("Gemurai_token")

    console.log("🍪 Token found:", !!token)

    if (!token) {
      console.log("❌ No token found")
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await verifyAuthToken(token.value)
    console.log("👤 User verified:", user?.role)

    if (!user || user.role !== "SUPER_ADMIN") {
      console.log("❌ Access denied - not super admin")
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      )
    }

    console.log("✅ Super admin authenticated, fetching courses...")

    // Get all courses
    const courses = await prisma.course.findMany({
      orderBy: { createdAt: "desc" },
    })

    console.log(`📊 Found ${courses.length} courses`)

    // Transform courses to match frontend expectations
    const transformedCourses = courses.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      duration: course.duration,
      level: course.level,
      category: course.category,
      price: course.price || 0,
      isPublished: course.isActive, // Map isActive to isPublished
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
    }))

    return NextResponse.json({ success: true, courses: transformedCourses })
  } catch (error) {
    console.error("❌ Error fetching courses:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/v1/superadmin/courses
export async function POST(request: Request) {
  try {
    console.log("🔍 Create course API called")
    
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
      instructor: "System", // Default instructor
    }

    const course = await prisma.course.create({
      data: courseData,
    })

    console.log("✅ Course created successfully:", course.id)

    return NextResponse.json({ success: true, course })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("❌ Error creating course:", error)
    return NextResponse.json(
      { success: false, message: "Failed to create course" },
      { status: 500 }
    )
  }
} 