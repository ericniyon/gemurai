import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/api-auth"
import { prisma } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.success) {
      return NextResponse.json({ success: false, message: auth.message }, { status: auth.status })
    }

    // Check if user has BRANCH_MANAGER role assignment
    const userRoleAssignment = await prisma.userRoleAssignment.findFirst({
      where: {
        userId: auth.user.id,
        isActive: true,
        role: { name: "BRANCH_MANAGER" }
      },
      include: { role: true }
    })

    return NextResponse.json({
      success: true,
      isBranchManager: !!userRoleAssignment,
      role: userRoleAssignment?.role?.name || null
    })

  } catch (error: any) {
    console.error("Error checking user role:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to check user role", 
        error: error.message 
      },
      { status: 500 }
    )
  }
}
