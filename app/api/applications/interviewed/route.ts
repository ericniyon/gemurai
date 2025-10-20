import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Get all applications with status INTERVIEWED
    const applications = await prisma.application.findMany({
      where: { status: "INTERVIEWED" },
      select: {
        id: true,
        email: true,
        status: true,
        interviewScores: {
          select: {
            totalScore: true,
            overallScore: true,
            submittedBy: true,
            submittedAt: true
          }
        }
      }
    })
    // Group scores by interviewer for each application and compute total score and interviewer names
    const result = await Promise.all(applications.map(async app => {
      // Map of interviewerId -> { interviewer, scores: [...] }
      const scoresByInterviewer: Record<string, { interviewer: { id: string, name: string, email: string } | null, scores: any[] }> = {}
      let totalInterviewScore = 0
      const interviewerNames: string[] = []
      for (const score of app.interviewScores) {
        totalInterviewScore += score.totalScore || 0
        if (!scoresByInterviewer[score.submittedBy]) {
          const user = await prisma.user.findUnique({
            where: { id: score.submittedBy },
            select: { id: true, name: true, email: true }
          })
          scoresByInterviewer[score.submittedBy] = {
            interviewer: user ? { id: user.id, name: user.name, email: user.email } : null,
            scores: []
          }
          if (user && user.name) {
            interviewerNames.push(user.name)
          }
        }
        scoresByInterviewer[score.submittedBy].scores.push(score)
      }
      return {
        id: app.id,
        email: app.email,
        status: app.status,
        totalInterviewScore,
        interviewerNames,
        scoresByInterviewer
      }
    }))
    return NextResponse.json({
      success: true,
      applications: result
    })
  } catch (error) {
    console.error("Error fetching interviewed applications:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
} 