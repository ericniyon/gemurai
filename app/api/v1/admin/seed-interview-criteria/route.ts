import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/token"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// POST /api/v1/admin/seed-interview-criteria
// Safely seed interview criteria (only for SUPER_ADMIN)
export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Seed interview criteria API called")
    
    // Verify authentication
    const cookieStore = await cookies()
    const token = cookieStore.get("Gemurai_token")

    if (!token) {
      console.log("❌ No token found")
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await verifyAuthToken(token.value)
    console.log("👤 User verified:", user?.role)

    if (!user || user.role !== "SUPER_ADMIN") {
      console.log("❌ Access denied - not super admin")
      return NextResponse.json(
        { success: false, message: "Access denied. Only SUPER_ADMIN can seed interview criteria." },
        { status: 403 }
      )
    }

    console.log("✅ Super admin authenticated, seeding interview criteria")

    // Check if criteria already exist
    const existingCriteria = await prisma.interviewCriteria.count()
    
    if (existingCriteria > 0) {
      console.log("📋 Interview criteria already exist, skipping seed")
      return NextResponse.json({ 
        success: true, 
        message: "Interview criteria already exist",
        existingCount: existingCriteria
      })
    }

    // Create interview criteria
    const criteria = [
      {
        name: "Technical Skills",
        description: "Assessment of technical knowledge and skills relevant to the position",
        maxScore: 10,
        weight: 1.0
      },
      {
        name: "Communication Skills",
        description: "Ability to express ideas clearly and effectively",
        maxScore: 10,
        weight: 1.0
      },
      {
        name: "Problem Solving",
        description: "Analytical thinking and problem-solving abilities",
        maxScore: 10,
        weight: 1.0
      },
      {
        name: "Teamwork",
        description: "Ability to work effectively in a team environment",
        maxScore: 10,
        weight: 1.0
      },
      {
        name: "Leadership",
        description: "Leadership potential and ability to take initiative",
        maxScore: 10,
        weight: 1.0
      },
      {
        name: "Adaptability",
        description: "Flexibility and ability to adapt to changing situations",
        maxScore: 10,
        weight: 1.0
      },
      {
        name: "Motivation",
        description: "Drive and enthusiasm for the role and organization",
        maxScore: 10,
        weight: 1.0
      },
      {
        name: "Cultural Fit",
        description: "Alignment with company values and culture",
        maxScore: 10,
        weight: 1.0
      },
      {
        name: "Experience",
        description: "Relevant work experience and background",
        maxScore: 10,
        weight: 1.0
      },
      {
        name: "Education",
        description: "Educational background and qualifications",
        maxScore: 10,
        weight: 1.0
      },
      {
        name: "Professionalism",
        description: "Professional demeanor and conduct during interview",
        maxScore: 10,
        weight: 1.0
      },
      {
        name: "Technical Knowledge",
        description: "Depth of technical knowledge in relevant areas",
        maxScore: 10,
        weight: 1.0
      },
      {
        name: "Critical Thinking",
        description: "Ability to analyze situations and make sound decisions",
        maxScore: 10,
        weight: 1.0
      },
      {
        name: "Innovation",
        description: "Creativity and innovative thinking",
        maxScore: 10,
        weight: 1.0
      },
      {
        name: "Stress Management",
        description: "Ability to handle pressure and stressful situations",
        maxScore: 10,
        weight: 1.0
      },
      {
        name: "Customer Focus",
        description: "Understanding of customer needs and service orientation",
        maxScore: 10,
        weight: 1.0
      },
      {
        name: "Quality Orientation",
        description: "Attention to detail and commitment to quality",
        maxScore: 10,
        weight: 1.0
      },
      {
        name: "Learning Ability",
        description: "Capacity to learn new skills and adapt to new technologies",
        maxScore: 10,
        weight: 1.0
      },
      {
        name: "Time Management",
        description: "Ability to prioritize tasks and manage time effectively",
        maxScore: 10,
        weight: 1.0
      },
      {
        name: "Overall Assessment",
        description: "Overall impression and recommendation for the position",
        maxScore: 10,
        weight: 1.0
      }
    ]

    const createdCriteria = []

    for (const criterion of criteria) {
      const created = await prisma.interviewCriteria.create({
        data: criterion
      })
      createdCriteria.push(created)
      console.log(`✅ Created criterion: ${criterion.name}`)
    }

    console.log("🎉 Interview criteria seeded successfully!")

    return NextResponse.json({ 
      success: true, 
      message: `Successfully seeded ${createdCriteria.length} interview criteria`,
      criteria: createdCriteria
    })

  } catch (error) {
    console.error("❌ Error seeding interview criteria:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error", error: error.message },
      { status: 500 }
    )
  }
} 