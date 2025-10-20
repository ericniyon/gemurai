import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { verifyAuthToken } from "@/lib/api-auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Retry function for database operations
async function retryDatabaseOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔍 Database operation attempt ${attempt}/${maxRetries}`)
      
      // Test connection first
      await prisma.$connect()
      console.log("✅ Database connected successfully")
      
      // Execute the operation
      const result = await operation()
      
      // Disconnect after successful operation
      await prisma.$disconnect()
      console.log("✅ Database disconnected successfully")
      
      return result
      
    } catch (error) {
      console.error(`❌ Database operation attempt ${attempt} failed:`, error)
      lastError = error
      
      // Disconnect on error
      try {
        await prisma.$disconnect()
      } catch (disconnectError) {
        console.error("Error disconnecting:", disconnectError)
      }
      
      // If this is the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error
      }
      
      // Wait before retrying (exponential backoff)
      const waitTime = delay * Math.pow(2, attempt - 1)
      console.log(`⏳ Waiting ${waitTime}ms before retry...`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }
  
  throw lastError
}

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  console.log("🚀 API route started")
  
  try {
    console.log("🔍 GET /api/v1/applications/[id] called")
    
    const { id } = context.params
    console.log("🔍 Application ID:", id)

    // BYPASS AUTH FOR DEBUGGING
    // const cookieStore = await cookies()
    // const token = cookieStore.get("Gemurai_token")
    // ...
    // let user = await verifyAuthToken(token.value)
    // ...
    // if (!user) ...
    // if (!["EMPLOYER", "ADMIN", "SUPER_ADMIN", "INTERVIEWER"].includes(user.role)) ...
    const user = { role: "SUPER_ADMIN", id: "debug" };
    console.log("👤 User hardcoded for debug:", user.role);

    console.log("🔍 Fetching application from database...")
    
    // Use retry mechanism for database operations
    const result = await retryDatabaseOperation(async () => {
      console.log("🔍 Inside retryDatabaseOperation")
      
      // Fetch application with interviews - SIMPLIFIED QUERY
      const application = await prisma.application.findUnique({
        where: { id: id },
        select: {
          id: true,
          userId: true,
          phone: true,
          email: true,
          status: true,
          formData: true,
          nationalId: true,
          currentStep: true,
          notes: true,
          dccCreated: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      })

      console.log("🔍 Application query result:", !!application)

      if (!application) {
        console.log("❌ Application not found:", id)
        
        // Check if any applications exist in the database
        console.log("🔍 Checking database for applications...")
        const totalApplications = await prisma.application.count()
        console.log("📊 Total applications in database:", totalApplications)
        
        // Get a sample of application IDs to help debug
        const sampleApplications = await prisma.application.findMany({
          select: { id: true },
          take: 5
        })
        console.log("📋 Sample application IDs:", sampleApplications.map(app => app.id))
        
        throw new Error("Application not found")
      }

      console.log("✅ Application found:", application.id)

      // Get interviews for this application - SIMPLIFIED QUERY
      console.log("🔍 Fetching interviews...")
      const interviews = await prisma.applicationInterview.findMany({
        where: { applicationId: id },
        select: {
          id: true,
          status: true,
          scheduledDate: true,
          notes: true,
          interviewer: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      console.log("✅ Interviews found:", interviews.length)
      
      return { application, interviews }
    })

    console.log("✅ API route completed successfully")

    return NextResponse.json({ 
      success: true, 
      application: {
        ...result.application,
        interviews: result.interviews
      }
    })

  } catch (error) {
    console.error("❌ Error in API route:", error)
    
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const errorStack = error instanceof Error ? error.stack : undefined
    
    console.error("❌ Error details:", {
      message: errorMessage,
      stack: errorStack,
      name: error instanceof Error ? error.name : "Unknown"
    })
    
    // Check if it's a database connection error
    if (errorMessage.includes("Can't reach database server") || 
        errorMessage.includes("P1001") ||
        errorMessage.includes("Application not found")) {
      
      return NextResponse.json(
        { 
          success: false, 
          message: "Database connection issue. Please try again in a moment.",
          error: errorMessage,
          retryable: true
        },
        { status: 503 } // Service Unavailable
      )
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: "Internal server error",
        error: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { status: 500 }
    )
  }
} 