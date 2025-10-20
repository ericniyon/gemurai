import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuthToken } from "@/lib/token"

export async function GET(request: Request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("Authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const userData = await verifyAuthToken(token)

    if (!userData) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Fetch user's role and its permissions from the database
    const userRole = await prisma.role.findFirst({
      where: { name: userData.role },
      include: { permissions: true },
    })

    if (!userRole) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 })
    }

    // Extract permission names
    const permissions = userRole.permissions.map((p) => p.name)

    return NextResponse.json({ permissions })
  } catch (error) {
    console.error("Error fetching permissions:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 