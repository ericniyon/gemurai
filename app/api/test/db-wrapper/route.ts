import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/prisma"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Testing db wrapper...")
    console.log("🔍 db:", typeof db)
    console.log("🔍 db.application:", typeof db.application)
    
    if (!db || !db.application) {
      return NextResponse.json({
        success: false,
        message: "db wrapper is not properly initialized",
        db: typeof db,
        application: db?.application ? typeof db.application : "undefined"
      }, { status: 500 })
    }
    
    const count = await db.application.count()
    
    return NextResponse.json({
      success: true,
      message: "db wrapper working correctly",
      count: count
    })
    
  } catch (error) {
    console.error("❌ db wrapper test failed:", error)
    return NextResponse.json({
      success: false,
      message: "db wrapper test failed",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
