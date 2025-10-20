import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuthToken } from "@/lib/token"

export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        message: "Authentication required" 
      }, { status: 401 })
    }

    const user = await verifyAuthToken(token)
    console.log("[USERS_DCCS_GET] Token verification result:", user ? "success" : "failed")
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid token" 
      }, { status: 401 })
    }

    // Check if user has permission to view DCCs
    const userRole = user.role
    console.log("[USERS_DCCS_GET] User role:", userRole)
    if (!["ADMIN", "SUPER_ADMIN", "EMPLOYER"].includes(userRole)) {
      console.log("[USERS_DCCS_GET] Access denied for role:", userRole)
      return NextResponse.json({ 
        success: false, 
        message: "Access denied. Insufficient permissions." 
      }, { status: 403 })
    }

    console.log("[USERS_DCCS_GET] User:", user.id, "Role:", userRole)

    // Support environments where the Prisma Client hasn't regenerated yet
    const hasUserModel = Boolean((prisma as any).user)

    let dccs: any[] = []

    if (hasUserModel) {
      // Get all DCC users through role assignment
      dccs = await (prisma as any).user.findMany({
        where: {
          userRole: {
            role: {
              name: "DCC"
            }
          }
        },
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true
        },
        orderBy: {
          name: 'asc'
        }
      })
    } else {
      // Fallback to raw SQL queries
      const dccsRaw: any[] = await (prisma as any).$queryRawUnsafe(`
        SELECT u.id, u.name, u.email, u."isActive" as status
        FROM "users" u
        JOIN "user_role_assignments" ura ON u.id = ura."userId"
        JOIN "roles" r ON ura."roleId" = r.id
        WHERE r.name = 'DCC' AND ura."isActive" = true
        ORDER BY u.name ASC
      `)

      dccs = dccsRaw.map(row => ({
        id: row.id,
        name: row.name,
        email: row.email,
        status: row.status
      }))
    }

    console.log("[USERS_DCCS_GET] Successfully fetched DCCs:", dccs.length)
    
    return NextResponse.json({
      success: true,
      data: dccs
    })
  } catch (error) {
    console.error("[USERS_DCCS_GET] Error:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Internal server error" 
    }, { status: 500 })
  }
}
