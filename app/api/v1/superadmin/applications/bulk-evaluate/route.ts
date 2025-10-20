import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { evaluateApplication } from "@/lib/ai-evaluation-service"
import { evaluateVulnerability } from "@/lib/vulnerability-evaluation-service"
import { verifyAuthToken } from "@/lib/token"
import { cookies } from "next/headers"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies()
    const token = cookieStore.get("Gemurai_token")

    if (!token) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await verifyAuthToken(token.value)
    if (!user || user.role !== "SUPER_ADMIN") {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // Get application IDs from request body
    const { applicationIds } = await request.json()
    
    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return new NextResponse("Invalid request: applicationIds array required", { status: 400 })
    }

    // Get the specified applications
    const applications = await prisma.application.findMany({
      where: {
        id: { in: applicationIds }
      },
      include: {
        evaluations: true,
        user: true
      }
    })

    console.log(`Found ${applications.length} applications to evaluate`)

    const results = []

    // Process applications sequentially to avoid rate limits
    for (const application of applications) {
      try {
        // Check if application already has AI evaluation
        const existingEvaluation = application.evaluations.find(evaluation => evaluation.type === "AI")
        if (existingEvaluation) {
          results.push({
            applicationId: application.id,
            success: false,
            error: "Application already has AI evaluation"
          })
          continue
        }

        // First do vulnerability assessment
        const vulnerabilityResults = await evaluateVulnerability(application.id, user.id)
        
        // Then do AI evaluation
        const aiEvaluation = await evaluateApplication(application.formData, vulnerabilityResults.scores)

        // Save combined evaluation
        const evaluation = await prisma.applicationEvaluation.create({
          data: {
            applicationId: application.id,
            evaluatorId: user.id,
            type: "AI",
            score: aiEvaluation.score,
            totalScore: aiEvaluation.score,
            questionScores: {
              ...vulnerabilityResults.scores,
              ...aiEvaluation.questionScores
            },
            feedback: aiEvaluation.feedback,
            metadata: {
              vulnerabilityScore: vulnerabilityResults.totalScore,
              aiScore: aiEvaluation.score,
              strengths: [...vulnerabilityResults.strengths, ...aiEvaluation.strengths],
              improvements: [...vulnerabilityResults.improvements, ...aiEvaluation.improvements],
              recommendations: vulnerabilityResults.recommendations
            }
          }
        })

        // Update application status
        await prisma.application.update({
          where: { id: application.id },
          data: {
            status: "EVALUATED",
            lastEvaluatedAt: new Date()
          }
        })

        results.push({
          applicationId: application.id,
          success: true,
          evaluation
        })

        // Add a delay between evaluations to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`Error evaluating application ${application.id}:`, error)
        results.push({
          applicationId: application.id,
          success: false,
          error: error.message
        })
      }
    }

    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length

    return NextResponse.json({
      message: `Processed ${applications.length} applications. Success: ${successful}, Failed: ${failed}`,
      results
    })
  } catch (error) {
    console.error("Error in bulk AI evaluation:", error)
    return NextResponse.json(
      { error: "Failed to process applications" },
      { status: 500 }
    )
  }
} 