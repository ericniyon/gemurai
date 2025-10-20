import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { evaluateApplication } from "@/lib/ai-evaluation-service"
import { evaluateVulnerability } from "@/lib/vulnerability-evaluation-service"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const runtime = "nodejs"

export async function POST() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get all applications without AI evaluations
    const applications = await prisma.application.findMany({
      where: {
        status: "SUBMITTED",
        NOT: {
          evaluations: {
            some: {
              type: "AI"
            }
          }
        }
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
        // First do vulnerability assessment
        const vulnerabilityResults = await evaluateVulnerability(application.id, "cmcv36wln0000dd01moxtiex9")
        
        // Then do AI evaluation
        const aiEvaluation = await evaluateApplication(application.formData, vulnerabilityResults.scores)

        // Save combined evaluation
        const evaluation = await prisma.applicationEvaluation.create({
          data: {
            applicationId: application.id,
            evaluatorId: "cmcv36wln0000dd01moxtiex9",
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