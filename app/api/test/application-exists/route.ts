import { NextRequest, NextResponse } from "next/server"
import { db, ensureDatabaseConnected } from "@/lib/prisma"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"


export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Testing application existence...")
    
    const url = new URL(request.url)
    const applicationId = url.searchParams.get('id')
    
    if (!applicationId) {
      return NextResponse.json({
        success: false,
        message: "Application ID is required"
      }, { status: 400 })
    }

    console.log("🔍 Looking for application ID:", applicationId)

    console.log("🔍 Testing database connection...")
    
    // Ensure database is connected using the proper function
    try {
      await ensureDatabaseConnected()
      console.log("✅ Database connected successfully")
    } catch (connectError) {
      console.error("❌ Failed to connect to database:", connectError)
      return NextResponse.json({
        success: false,
        message: "Database connection failed",
        error: connectError instanceof Error ? connectError.message : "Unknown connection error"
      }, { status: 503 })
    }
    
    // First, let's check if we can query the applications table at all
    console.log("🔍 Testing basic database query...")
    let totalCount = 0
    try {
      totalCount = await db.application.count()
      console.log("🔍 Total applications in database:", totalCount)
    } catch (countError) {
      console.error("❌ Error counting applications:", countError)
      throw countError
    }
    
    // Check if application exists
    console.log("🔍 Checking if application exists:", applicationId)
    const application = await db.application.findUnique({
      where: { id: applicationId },
      select: { 
        id: true, 
        status: true, 
        email: true, 
        formData: true,
        phone: true,
        createdAt: true,
        updatedAt: true
      }
    })

    console.log("🔍 Application found:", !!application)
    if (application) {
      console.log("🔍 Application details:", { id: application.id, status: application.status })
    }

    if (!application) {
      // Get some sample applications to help debug
      const sampleApplications = await db.application.findMany({
        select: { id: true, status: true },
        take: 5
      })

      return NextResponse.json({
        success: false,
        message: "Application not found",
        requestedId: applicationId,
        sampleApplications,
        totalApplications: totalCount
      }, { status: 404 })
    }

    // Get interviews for this application
    const interviews = await db.applicationInterview.findMany({
      where: { applicationId },
      select: { id: true, status: true, interviewerId: true }
    })

    return NextResponse.json({
      success: true,
      application: application,
      interviews: interviews,
      interviewCount: interviews.length
    })

  } catch (error) {
    console.error("❌ Error in test endpoint:", error)
    console.error("❌ Error stack:", error instanceof Error ? error.stack : "No stack trace")
    console.error("❌ Error name:", error instanceof Error ? error.name : "Unknown")
    
    // Check if it's a database connection error
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("❌ Error message:", errorMessage)
    
    if (errorMessage.includes("Can't reach database server") || 
        errorMessage.includes("P1001") ||
        errorMessage.includes("P1002") ||
        errorMessage.includes("P1003") ||
        errorMessage.includes("P1008") ||
        errorMessage.includes("P1017") ||
        errorMessage.includes("Engine is not yet connected") ||
        errorMessage.includes("database is not yet connected") ||
        errorMessage.includes("not yet connected")) {
      
      return NextResponse.json({
        success: false,
        message: "Database connection issue. Please try again in a moment.",
        error: errorMessage,
        retryable: true
      }, { status: 503 })
    }
    

    // Handle other Prisma errors
    if (errorMessage.includes("P2002") || errorMessage.includes("P2003") || errorMessage.includes("P2025")) {
      return NextResponse.json({
        success: false,
        message: "Database constraint error",
        error: errorMessage
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: errorMessage
    }, { status: 500 })
  }
} 