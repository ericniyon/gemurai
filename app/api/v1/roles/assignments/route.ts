import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { cookies } from "next/headers"
import { verifyAuthToken } from "@/lib/token"
import { prisma } from "@/lib/prisma"

async function requireAdmin(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get("Gemurai_token")
  const authHeader = request.headers.get("Authorization")
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null
  const tokenValue = token?.value || bearerToken

  if (!tokenValue) {
    return { error: NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 }) }
  }

  const user = await verifyAuthToken(tokenValue)
  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
    return { error: NextResponse.json({ success: false, message: "Access denied" }, { status: 403 }) }
  }

  return { adminId: user.id }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (auth.error) {
      return auth.error
    }

    const url = new URL(request.url)
    const roleFilter = url.searchParams.get("role")?.toUpperCase()
    const search = url.searchParams.get("search")?.toLowerCase()
    const where: any = {}

    if (roleFilter) {
      where.userRole = { role: { name: roleFilter } }
    }

    if (search) {
      where.AND = [
        ...(where.AND ?? []),
        {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        },
      ]
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        userRole: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
            assignedByUser: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const assignments = users.map((user) => {
      const assignment = user.userRole
      return {
        id: assignment?.id ?? `legacy-${user.id}`,
        userId: user.id,
        roleId: assignment?.roleId ?? null,
        userName: user.name ?? "Unknown User",
        userEmail: user.email ?? "unknown@Gemurai.rw",
        roleName: assignment?.role?.name ?? "CONSUMER",
        assignedBy: assignment?.assignedByUser?.name || assignment?.assignedBy || "Legacy Role",
        assignedById: assignment?.assignedByUser?.id || assignment?.assignedBy || null,
        assignedAt: assignment?.assignedAt
          ? assignment.assignedAt.toISOString()
          : user.createdAt.toISOString(),
        updatedAt: assignment?.updatedAt
          ? assignment.updatedAt.toISOString()
          : user.updatedAt.toISOString(),
        isActive: assignment?.isActive ?? user.isActive,
      }
    })

    return NextResponse.json({
      success: true,
      assignments,
    })
  } catch (error) {
    console.error("Error fetching role assignments:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch role assignments" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (auth.error) {
      return auth.error
    }

    const body = await request.json()
    const { userId, roleId } = body

    if (!userId || !roleId) {
      return NextResponse.json(
        { success: false, message: "userId and roleId are required" },
        { status: 400 }
      )
    }

    const [user, role] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.role.findUnique({ where: { id: roleId } }),
    ])

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    if (!role) {
      return NextResponse.json({ success: false, message: "Role not found" }, { status: 404 })
    }

    const assignment = await prisma.userRoleAssignment.upsert({
      where: { userId },
      create: {
        userId,
        roleId,
        assignedBy: auth.adminId,
        isActive: true,
      },
      update: {
        roleId,
        assignedBy: auth.adminId,
        assignedAt: new Date(),
        isActive: true,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, isActive: true },
        },
        role: {
          select: { id: true, name: true, description: true },
        },
        assignedByUser: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    const formattedAssignment = {
      id: assignment.id,
      userId: assignment.userId,
      roleId: assignment.roleId,
      userName: assignment.user?.name ?? "Unknown User",
      userEmail: assignment.user?.email ?? "unknown@Gemurai.rw",
      roleName: assignment.role?.name ?? "UNASSIGNED",
      assignedBy: assignment.assignedByUser?.name || assignment.assignedBy || "System",
      assignedById: assignment.assignedByUser?.id || assignment.assignedBy || null,
      assignedAt: assignment.assignedAt ? assignment.assignedAt.toISOString() : null,
      updatedAt: assignment.updatedAt ? assignment.updatedAt.toISOString() : null,
      isActive: assignment.isActive,
    }

    return NextResponse.json({
      success: true,
      message: `Role ${formattedAssignment.roleName} assigned to ${formattedAssignment.userName}`,
      assignment: formattedAssignment,
    })
  } catch (error) {
    console.error("Error assigning role:", error)
    return NextResponse.json(
      { success: false, message: "Failed to assign role" },
      { status: 500 }
    )
  }
}

