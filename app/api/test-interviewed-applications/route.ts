import { NextResponse } from "next/server"
import { getInterviewedApplicationsFromDb } from "@/app/[lang]/dashboard/applications/actions"

export async function GET() {
  try {
    console.log("🧪 Testing interviewed applications data...")
    
    const data = await getInterviewedApplicationsFromDb()
    
    return NextResponse.json({
      success: true,
      count: data.length,
      applications: data.slice(0, 5).map(app => ({
        id: app.id,
        totalScore: app.totalScore,
        phoneNumber: app.formData?.phone || app.formData?.Phone || app.formData?.q10,
        googleSheetsData: app.formData,
        interviewScores: app.interviewScores?.length || 0
      })),
      debug: {
        timestamp: new Date().toISOString(),
        totalApplications: data.length,
        applicationsWithScores: data.filter(app => app.totalScore > 0).length,
        applicationsWithoutScores: data.filter(app => !app.totalScore || app.totalScore === 0).length
      }
    })
  } catch (error) {
    console.error("❌ Error testing interviewed applications:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
