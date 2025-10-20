import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuthToken } from "@/lib/token"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authorization
    const authHeader = request.headers.get("Authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const adminUser = await verifyAuthToken(token)

    if (!adminUser || !["SUPER_ADMIN", "ADMIN"].includes(adminUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { role } = await request.json()

    // Validate role
    const validRole = await prisma.role.findFirst({
      where: { name: role },
    })

    if (!validRole) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    // Update user's role
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { roleId: validRole.id },
      include: {
        role: true,
      },
    })

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        action: "UPDATE_USER_ROLE",
        userId: adminUser.id,
        details: `Changed user ${updatedUser.id} role to ${role}`,
        metadata: {
          oldRole: updatedUser.role.name,
          newRole: role,
          targetUserId: updatedUser.id,
        },
      },
    })

    return NextResponse.json({
      message: "Role updated successfully",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role.name,
      },
    })
  } catch (error) {
    console.error("Error updating user role:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 