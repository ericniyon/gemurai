import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/token"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// GET /api/v1/superadmin/interviewers
export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Interviewers API called")
    
    // Verify superadmin authentication
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
        { success: false, message: "Access denied" },
        { status: 403 }
      )
    }

    // Get all active users who can be interviewers (EMPLOYER role or specific interviewers)
    const interviewers = await prisma.user.findMany({
      where: {
        isActive: true,
        OR: [
          {
            roleAssignments: {
              some: {
                role: {
                  name: "EMPLOYER"
                },
                isActive: true
              }
            }
          },
          {
            email: {
              in: ["interviewer1@djyh.rw", "interviewer2@djyh.rw"]
            }
          }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        roleAssignments: {
          where: {
            isActive: true
          },
          select: {
            role: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    // Transform the data to include role information
    const transformedInterviewers = interviewers.map(interviewer => ({
      id: interviewer.id,
      name: interviewer.name,
      email: interviewer.email,
      role: interviewer.roleAssignments[0]?.role.name || "USER"
    }))

    console.log(`✅ Found ${transformedInterviewers.length} available interviewers`)

    return NextResponse.json({
      success: true,
      interviewers: transformedInterviewers
    })

  } catch (error) {
    console.error("❌ Error fetching interviewers:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
} 