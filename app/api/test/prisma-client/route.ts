import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Testing prisma client...")
    console.log("🔍 prisma:", typeof prisma)
    console.log("🔍 prisma.application:", typeof prisma.application)
    
    if (!prisma || !prisma.application) {
      return NextResponse.json({
        success: false,
        message: "prisma client is not properly initialized",
        prisma: typeof prisma,
        application: prisma?.application ? typeof prisma.application : "undefined"
      }, { status: 500 })
    }
    
    const count = await prisma.application.count()
    
    return NextResponse.json({
      success: true,
      message: "prisma client working correctly",
      count: count
    })
    
  } catch (error) {
    console.error("❌ prisma client test failed:", error)
    return NextResponse.json({
      success: false,
      message: "prisma client test failed",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
