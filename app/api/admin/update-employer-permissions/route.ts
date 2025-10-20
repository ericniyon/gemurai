import { NextRequest, NextResponse } from "next/server"
import type { User } from "@prisma/client"

// Mark as server-side runtime
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type UpdatedUser = Pick<User, "id" | "email" | "permissions">

export async function POST(request: NextRequest) {
  try {
    // Dynamic import of auth module
    const { verifyAuth } = await import("@/lib/api-auth")

    // Verify admin authentication
    const authResult = await verifyAuth(request, ["admin.users", "admin.system"])
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.message }, 
        { status: authResult.status }
      )
    }

    // Dynamic import of database to ensure server-side only
    const { prisma } = await import("@/lib/database")

    // Define the correct permissions for EMPLOYER role
    const employerPermissions = [
      "dashboard.view",
      "jobs.view", 
      "jobs.post", 
      "jobs.manage", 
      "users.view",
      "applications.view",
      "applications.review",
      "applications.manage",
      "products.view",
      "products.create",
      "products.edit",
      "products.delete",
      "products.manage",
      "orders.view",
      "orders.manage"
    ]

    // Find all users with EMPLOYER role
    const employerUsers = await prisma.user.findMany({
      where: { role: "EMPLOYER" },
      select: { id: true, email: true, permissions: true }
    })

    console.log(`📊 Found ${employerUsers.length} EMPLOYER users`)

    // Update each employer user's permissions
    const updatedUsers: UpdatedUser[] = []
    for (const user of employerUsers) {
      console.log(`🔧 Updating permissions for ${user.email}...`)
      
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { permissions: employerPermissions },
        select: { id: true, email: true, permissions: true }
      })
      
      updatedUsers.push(updatedUser)
      console.log(`✅ Updated permissions for ${user.email}`)
    }

    return NextResponse.json({
      success: true,
      message: `Updated permissions for ${employerUsers.length} EMPLOYER users`,
      data: {
        usersUpdated: employerUsers.length,
        updatedUsers: updatedUsers,
        newPermissions: employerPermissions
      }
    })

  } catch (error) {
    console.error("Error updating employer permissions:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" }, 
      { status: 500 }
    )
  } finally {
    // Ensure we disconnect from the database
    const { prisma } = await import("@/lib/database")
    await prisma.$disconnect()
  }
} 