import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/token"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// GET /api/v1/superadmin/interview-criteria
export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Interview criteria API called")
    
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

    if (!user) {
      console.log("❌ Access denied")
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      )
    }

    // Get all active interview criteria
    const criteria = await prisma.interviewCriteria.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })

    console.log(`✅ Found ${criteria.length} interview criteria`)

    return NextResponse.json({
      success: true,
      criteria: criteria
    })

  } catch (error) {
    console.error("❌ Error fetching interview criteria:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
} 