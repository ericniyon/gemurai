import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/database"

export async function GET(req: NextRequest) {
  try {
    console.log("=== TEST USERS API CALLED ===")
    
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      },
      take: 5 // Limit to 5 users
    })
    
    console.log("Users found:", users.length)
    
    return NextResponse.json({
      success: true,
      users: users
    })
  } catch (error) {
    console.error("=== ERROR IN TEST USERS API ===")
    console.error("Error:", error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to get users",
        details: error instanceof Error ? error.stack : "No stack trace"
      },
      { status: 500 }
    )
  }
} 