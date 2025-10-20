import { NextResponse } from "next/server"
import { getInterviewInvitedApplicationsFromDb } from "@/app/[lang]/dashboard/applications/actions"

export async function GET() {
  try {
    console.log("🧪 Testing Interview Invited applications...")
    
    const applications = await getInterviewInvitedApplicationsFromDb()
    
    // Sample a few applications to check their scores
    const sampleApplications = applications.slice(0, 3).map(app => ({
      id: app.id,
      status: app.status,
      totalScore: app.totalScore,
      formDataKeys: Object.keys(app.formData || {}),
      formDataSample: {
        'Total Score': app.formData?.['Total Score'],
        'totalScore': app.formData?.totalScore,
        'Score': app.formData?.Score,
        'score': app.formData?.score
      },
      evaluations: app.evaluations?.length || 0
    }))
    
    return NextResponse.json({
      success: true,
      totalApplications: applications.length,
      sampleApplications,
      debug: {
        timestamp: new Date().toISOString(),
        message: "Interview Invited applications loaded successfully"
      }
    })
  } catch (error) {
    console.error("❌ Error testing Interview Invited applications:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      debug: {
        timestamp: new Date().toISOString(),
        message: "Failed to load Interview Invited applications"
      }
    }, { status: 500 })
  }
}
