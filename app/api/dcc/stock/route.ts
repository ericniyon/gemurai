import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/token"
import { DCCStockService } from "@/lib/services/DCCStockService"
import { Prisma } from "@prisma/client"
import { cookies } from "next/headers"

export async function GET(req: NextRequest) {
  try {
    // Get token from multiple sources
    let token = req.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) {
      token = req.cookies.get("Gemurai_token")?.value
    }

    if (!token) {
      return NextResponse.json(
        { success: false, error: "No authentication token found" },
        { status: 401 }
      )
    }

    const user = await verifyAuthToken(token)
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 401 }
      )
    }

    try {
      const dccStock = await DCCStockService.getDCCStock(user)
      
      return NextResponse.json({
        success: true,
        dccStock
      })
    } catch (error) {
      console.error("Error fetching DCC stock:", error)
      
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle Prisma-specific errors
        if (error.code === "P2001") {
          return NextResponse.json(
            { success: false, error: "Record not found" },
            { status: 404 }
          )
        }
        if (error.code === "P2002") {
          return NextResponse.json(
            { success: false, error: "Unique constraint violation" },
            { status: 409 }
          )
        }
        if (error.code === "P2025") {
          return NextResponse.json(
            { success: false, error: "Record not found" },
            { status: 404 }
          )
        }
      }

      if (error instanceof Error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json(
        { success: false, error: "Failed to fetch DCC stock" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error in DCC stock API:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
} 