import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Seeding interview criteria...")
    
    // First, deactivate all existing criteria
    await prisma.interviewCriteria.updateMany({
      data: { isActive: false }
    })
    console.log("✅ Deactivated all existing criteria")

    // Define the criteria with correct max scores
    const criteria = [
      {
        name: "Education and Work Experience",
        description: "Assessment of educational qualifications, work experience, and professional background",
        maxScore: 30,
        weight: 1.0,
        isActive: true
      },
      {
        name: "Socio-Economic and Vulnerability Status",
        description: "Evaluation of economic status, vulnerability factors, and household circumstances",
        maxScore: 10,
        weight: 1.0,
        isActive: true
      },
      {
        name: "C. Digital Access and Literacy (Ubumenyi n’Ikoranabuhanga)",
        description: "Assessment of digital skills, technology access, and digital literacy level",
        maxScore: 15,
        weight: 1.0,
        isActive: true
      },
      {
        name: "Living Environment & Community Connections",
        description: "Evaluation of living conditions, community involvement, and social connections",
        maxScore: 10,
        weight: 1.0,
        isActive: true
      }
    ]

    // Create each criterion
    const createdCriteria = []
    for (const criterion of criteria) {
      const created = await prisma.interviewCriteria.create({
        data: criterion
      })
      createdCriteria.push(created)
      console.log(`✅ Created criterion: ${criterion.name} (maxScore: ${criterion.maxScore})`)
    }

    console.log("🎉 Interview criteria seeded successfully!")

    return NextResponse.json({
      success: true,
      message: "Interview criteria seeded successfully",
      criteria: createdCriteria
    })

  } catch (error) {
    console.error("❌ Error seeding interview criteria:", error)
    return NextResponse.json({
      success: false,
      message: "Failed to seed interview criteria",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 