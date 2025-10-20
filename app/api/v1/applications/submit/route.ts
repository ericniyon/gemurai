import { type NextRequest, NextResponse } from "next/server"
import { ApplicationStatus } from "@prisma/client"
import { cookies } from "next/headers"
import { verifyAuthToken } from "@/lib/api-auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

export async function POST(request: NextRequest) {
  try {
    console.log("📝 Starting application submission...")
    
    // Get the auth token from cookies
    const cookieStore = cookies()
    const token = cookieStore.get("Gemurai_token")
    
    // Verify the token and get the user
    let userId: string | undefined = undefined
    if (token) {
      try {
        const user = await verifyAuthToken(token.value)
        if (user) {
          userId = user.id
          console.log("👤 Authenticated user ID:", userId)
        }
      } catch (error) {
        console.warn("⚠️ Invalid auth token:", error)
      }
    }
    
    // Get request body
    const body = await request.json()
    console.log("📦 Request body:", JSON.stringify(body, null, 2))
    
    const { id, formData, currentStep = 1, status = "TEMPORARY" } = body
    console.log("🔑 Application ID:", id)
    console.log("📊 Status:", status)
    console.log("🔢 Current Step:", currentStep)

    // Extract email and phone from formData
    const email = formData?.q9 || formData?.email || formData?.q7 || null
    const phone = formData?.q10 || formData?.phone || formData?.q8 || ""
    console.log("📧 Email:", email)
    console.log("📱 Phone:", phone)

    // Validate required fields - only phone is required
    if (!phone) {
      console.log("❌ Validation failed - missing phone")
      return NextResponse.json(
        {
          success: false,
          message: "Missing required field: phone is required in formData",
        },
        { status: 400 },
      )
    }

    // Generate a unique application ID if not provided
    const applicationId = id || `APP-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    console.log("🆔 Using application ID:", applicationId)

    try {
      // Dynamic import of database
      const { prisma } = await import("@/lib/database")

      // Create or update application
      console.log("💾 Attempting to save application to database...")
      const result = await prisma.application.upsert({
        where: { 
          id: applicationId
        },
        create: {
          id: applicationId,
          userId: userId, // Use the authenticated user's ID
          phone,
          email: email || undefined,
          status: status.toUpperCase() as ApplicationStatus,
          formData: {
            ...formData,
            phone,
            email: email || undefined,
          },
          currentStep,
          notes: "",
          dccCreated: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        update: {
          userId: userId, // Use the authenticated user's ID
          phone,
          email: email || undefined,
          status: status.toUpperCase() as ApplicationStatus,
          formData: {
            ...formData,
            phone,
            email: email || undefined,
          },
          currentStep,
          updatedAt: new Date()
        }
      })

      console.log("✅ Application saved successfully:", result.id)

      // If status is SUBMITTED, perform evaluations
      if (status.toUpperCase() === ApplicationStatus.SUBMITTED) {
        // Dynamic import of evaluation services
        const { evaluateApplication } = await import("@/lib/services/ai-evaluation")
        const { evaluateVulnerability } = await import("@/lib/services/vulnerability-assessment")

        let vulnerabilityResults = null
        let aiEvaluation = null

        try {
          console.log("🔍 Starting vulnerability assessment...")
          vulnerabilityResults = await evaluateVulnerability(result)
          console.log("✅ Vulnerability assessment completed")
        } catch (vulnError) {
          console.warn("⚠️ Vulnerability assessment failed:", vulnError)
          vulnerabilityResults = {
            score: 50,
            scores: {
              disability: 10,
              householdRoles: 10,
              workExperience: 10,
              healthcareExperience: 10,
              digitalAccess: 10
            },
            overallLevel: "MEDIUM",
            recommendations: ["Manual review recommended"],
            strengths: ["To be evaluated"],
            improvements: ["To be evaluated"],
            details: {
              personalInfo: { score: 0, details: {} },
              disability: { score: 0, details: {} },
              householdRoles: { score: 0, details: {} },
              workExperience: { score: 0, details: {} },
              healthcareExperience: { score: 0, details: {} },
              digitalAccess: { score: 0, details: {} }
            }
          }
        }

        try {
          console.log("🤖 Starting AI evaluation...")
          aiEvaluation = await evaluateApplication(result.id, formData)
          console.log("✅ AI evaluation completed")
        } catch (aiError) {
          console.warn("⚠️ AI evaluation failed:", aiError)
          aiEvaluation = {
            score: 75,
            evaluation: "AI evaluation unavailable. Application will be reviewed manually.",
            strengths: ["To be evaluated"],
            improvements: ["To be evaluated"],
            recommendations: ["Manual review recommended"],
            questionScores: {}
          }
        }

        // Save the evaluation with safe defaults
        try {
          await prisma.applicationEvaluation.create({
            data: {
              applicationId: result.id,
              evaluatorId: "AI_SYSTEM",
              type: "VULNERABILITY",
              score: vulnerabilityResults?.score || 50,
              totalScore: aiEvaluation?.score || 75,
              scores: vulnerabilityResults?.scores || {
                disability: 10,
                householdRoles: 10,
                workExperience: 10,
                healthcareExperience: 10,
                digitalAccess: 10
              },
              overallLevel: vulnerabilityResults?.overallLevel || "MEDIUM",
              recommendations: {
                vulnerabilityRecommendations: vulnerabilityResults?.recommendations || ["Manual review recommended"],
                aiRecommendations: aiEvaluation?.recommendations || ["Manual review recommended"]
              },
              questionScores: {
                vulnerability: vulnerabilityResults?.details || {
                  personalInfo: { score: 0, details: {} },
                  disability: { score: 0, details: {} },
                  householdRoles: { score: 0, details: {} },
                  workExperience: { score: 0, details: {} },
                  healthcareExperience: { score: 0, details: {} },
                  digitalAccess: { score: 0, details: {} }
                },
                ai: aiEvaluation?.questionScores || {}
              },
              metadata: {
                vulnerabilityScore: vulnerabilityResults?.score || 50,
                aiScore: aiEvaluation?.score || 75,
                strengths: [
                  ...(vulnerabilityResults?.strengths || ["To be evaluated"]),
                  ...(aiEvaluation?.strengths || ["To be evaluated"])
                ],
                improvements: [
                  ...(vulnerabilityResults?.improvements || ["To be evaluated"]),
                  ...(aiEvaluation?.improvements || ["To be evaluated"])
                ]
              }
            }
          })
          console.log("✅ Evaluation saved successfully")
        } catch (evalSaveError) {
          console.error("❌ Failed to save evaluation:", evalSaveError)
          // Don't throw error, continue with application submission
        }
      }

      // Send notifications if needed
      if (status.toUpperCase() === ApplicationStatus.SUBMITTED) {
        // Dynamic import of notification services
        const { sendApplicationSubmissionEmail } = await import("@/lib/services/email-service")
        const { sendApplicationSubmissionSMS } = await import("@/lib/services/twilio-service")

        // Send confirmation email only if email is provided and valid
        if (email && email !== "Oya" && email.includes("@")) {
          try {
            await sendApplicationSubmissionEmail(email, formData.firstName || formData.q1)
          } catch (error) {
            console.error("Error sending confirmation email:", error)
          }
        }

        // Send confirmation SMS if phone is provided
        if (phone) {
          try {
            const smsResult = await sendApplicationSubmissionSMS(phone, formData.firstName || formData.q1)
            if (!smsResult.success) {
              console.warn("⚠️ SMS sending failed:", smsResult.message)
            } else {
              console.log("✅ SMS sent successfully:", smsResult.messageId)
            }
          } catch (error) {
            console.error("Error sending confirmation SMS:", error)
            // Don't block application submission on SMS failure
          }
        }
      }

      return NextResponse.json({
        success: true,
        application: result
      }, { status: 201 })  // Use 201 for resource creation

    } catch (dbError) {
      console.error("❌ Database operation failed:", dbError)
      if (dbError instanceof Error) {
        console.error("Error name:", dbError.name)
        console.error("Error message:", dbError.message)
        console.error("Error stack:", dbError.stack)
      }
      return NextResponse.json(
        { success: false, message: "Failed to save application to database" },
        { status: 503 }  // Service Unavailable for database issues
      )
    }
  } catch (error) {
    console.error("❌ Error submitting application:", error)
    if (error instanceof Error) {
      console.error("Error name:", error.name)
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
