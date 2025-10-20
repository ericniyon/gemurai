import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/token"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// GET /api/v1/admin/interview-criteria
// Get all interview criteria
export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Get interview criteria API called")
    
    // Verify authentication
    const cookieStore = await cookies()
    const token = cookieStore.get("Gemurai_token")

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
        { success: false, message: "Access denied. Only SUPER_ADMIN can manage interview criteria." },
        { status: 403 }
      )
    }

    const criteria = await prisma.interviewCriteria.findMany({
      orderBy: { name: 'asc' }
    })

    console.log("✅ Interview criteria retrieved successfully")

    return NextResponse.json({ 
      success: true, 
      criteria
    })

  } catch (error) {
    console.error("❌ Error getting interview criteria:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error", error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/v1/admin/interview-criteria
// Create new interview criteria
export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Create interview criteria API called")
    
    // Verify authentication
    const cookieStore = await cookies()
    const token = cookieStore.get("Gemurai_token")

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
        { success: false, message: "Access denied. Only SUPER_ADMIN can create interview criteria." },
        { status: 403 }
      )
    }

    const { name, description, maxScore, weight } = await request.json()

    if (!name || !description) {
      return NextResponse.json(
        { success: false, message: "Name and description are required" },
        { status: 400 }
      )
    }

    // Check if criteria with same name already exists
    const existingCriteria = await prisma.interviewCriteria.findFirst({
      where: { name: name.trim() }
    })

    if (existingCriteria) {
      return NextResponse.json(
        { success: false, message: "Interview criteria with this name already exists" },
        { status: 409 }
      )
    }

    const newCriteria = await prisma.interviewCriteria.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        maxScore: maxScore || 10,
        weight: weight || 1.0,
        isActive: true
      }
    })

    console.log("✅ Interview criteria created successfully:", newCriteria.name)

    return NextResponse.json({ 
      success: true, 
      message: "Interview criteria created successfully",
      criteria: newCriteria
    })

  } catch (error) {
    console.error("❌ Error creating interview criteria:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error", error: error.message },
      { status: 500 }
    )
  }
} 