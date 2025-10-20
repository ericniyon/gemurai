import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Submitting interview scores...")
    
    const body = await request.json()
    console.log("📊 Request body:", JSON.stringify(body, null, 2))
    
    const { interviewId, scores, overallComment, interviewNotes, temporaryScores } = body

    if (!interviewId || !scores || !Array.isArray(scores)) {
      console.log("❌ Validation failed: interviewId or scores missing")
      return NextResponse.json({
        success: false,
        message: "Interview ID and scores array are required"
      }, { status: 400 })
    }

    console.log("📊 Scores to submit:", JSON.stringify(scores, null, 2))
    if (temporaryScores) {
      console.log("📊 Temporary scores:", JSON.stringify(temporaryScores, null, 2))
    }

    // Validate scores
    for (const score of scores) {
      if (!score.criteriaId || typeof score.score !== 'number' || score.score < 0) {
        return NextResponse.json({
          success: false,
          message: "Each score must have a criteriaId and a non-negative score"
        }, { status: 400 })
      }
    }

    // Calculate total score (sum of all scores)
    const totalScore = scores.reduce((sum, score) => sum + score.score, 0)
    
    // Calculate average score for compatibility (normalized to 0-10 scale)
    // This assumes the max possible total is around 65 (30+15+10+10)
    const maxPossibleTotal = 65 // Education(30) + Digital(15) + Socio(10) + Environment(10)
    const averageScore = (totalScore / maxPossibleTotal) * 10

    // Update interview with scores
    const updatedInterview = await prisma.applicationInterview.update({
      where: { id: interviewId },
      data: {
        status: "COMPLETED",
        overallScore: averageScore,
        overallComment: overallComment || "",
        interviewNotes: interviewNotes || "",
        completedAt: new Date(),
        scores: {
          create: scores.map(score => ({
            criteriaId: score.criteriaId,
            score: score.score,
            comments: score.comments || ""
          }))
        }
      },
      include: {
        interviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        scores: {
          include: {
            criteria: true
          }
        }
      }
    })

    // Get the application ID from the interview
    const interview = await prisma.applicationInterview.findUnique({
      where: { id: interviewId },
      select: { applicationId: true }
    })

    if (interview) {
      // Check if application has been scored 2 times and update status to INTERVIEWED
      const totalScoresForApplication = await prisma.interviewScores.count({
        where: {
          applicationId: interview.applicationId
        }
      })

      if (totalScoresForApplication >= 2) {
        await prisma.application.update({
          where: {
            id: interview.applicationId
          },
          data: {
            status: "INTERVIEWED",
            updatedAt: new Date()
          }
        })
        console.log(`✅ Application ${interview.applicationId} status updated to INTERVIEWED after ${totalScoresForApplication} scores`)
      }
    }

    console.log("✅ Interview scores submitted successfully")

    return NextResponse.json({
      success: true,
      message: "Interview scores submitted successfully",
      interview: updatedInterview
    })

  } catch (error) {
    console.error("❌ Error submitting interview scores:", error)
    return NextResponse.json({
      success: false,
      message: "Failed to submit interview scores",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 