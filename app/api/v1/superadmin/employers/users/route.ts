import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { verifyAuthToken } from '@/lib/token'
import { cookies } from 'next/headers'

/**
 * API Route: GET /api/v1/superadmin/employers/users
 * Fetches all users with EMPLOYER role for the superadmin employers page.
 */
export async function GET(request: NextRequest) {
  try {
    console.log("Employers API called - fetching all EMPLOYER users")

    // Optional: Add authentication if needed, but for now, allow public access for testing
    // const cookieStore = cookies()
    // const token = cookieStore.get("Gemurai_token")
    // if (!token) {
    //   console.log("Employers API called without authentication - allowing for testing")
    //   // return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    // }
    // const user = token ? await verifyAuthToken(token.value) : null

    // Get EMPLOYER role assignments for specific email
    const employerAssignments = await prisma.userRoleAssignment.findMany({
      where: {
        isActive: true,
        role: {
          name: 'EMPLOYER'
        },
        user: {
          email: 'employer@Gemurai.rw'
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            national_id: true,
            gender: true,
            district: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
          }
        },
        role: {
          select: {
            name: true,
            description: true
          }
        }
      },
      orderBy: {
        assignedAt: 'desc'
      }
    })

    console.log(`Found ${employerAssignments.length} EMPLOYER role assignments`)

    // Transform to match the expected format
    const transformedUsers = employerAssignments.map(assignment => ({
      id: assignment.user.id,
      name: assignment.user.name,
      email: assignment.user.email,
      phone: assignment.user.phone,
      national_id: assignment.user.national_id,
      gender: assignment.user.gender,
      district: assignment.user.district,
      status: assignment.user.isActive ? "active" : "inactive",
      createdAt: assignment.user.createdAt,
      updatedAt: assignment.user.updatedAt,
      role: assignment.role.name,
      roleDescription: assignment.role.description,
      assignedAt: assignment.assignedAt
    }))

    console.log(`Found ${transformedUsers.length} EMPLOYER users`)

    return NextResponse.json({ success: true, employers: transformedUsers })
  } catch (error) {
    console.error("Error fetching EMPLOYER users:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        debug: {
          error: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : "No stack",
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    )
  }
}
