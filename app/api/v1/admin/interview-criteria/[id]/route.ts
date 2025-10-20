import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/token"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// PUT /api/v1/admin/interview-criteria/[id]
// Update interview criteria
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("🔍 Update interview criteria API called")
    
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
        { success: false, message: "Access denied. Only SUPER_ADMIN can update interview criteria." },
        { status: 403 }
      )
    }

    const { id } = params
    const { name, description, maxScore, weight, isActive } = await request.json()

    if (!name || !description) {
      return NextResponse.json(
        { success: false, message: "Name and description are required" },
        { status: 400 }
      )
    }

    // Check if criteria exists
    const existingCriteria = await prisma.interviewCriteria.findUnique({
      where: { id }
    })

    if (!existingCriteria) {
      return NextResponse.json(
        { success: false, message: "Interview criteria not found" },
        { status: 404 }
      )
    }

    // Check if name is being changed and if new name already exists
    if (name.trim() !== existingCriteria.name) {
      const nameExists = await prisma.interviewCriteria.findFirst({
        where: { 
          name: name.trim(),
          id: { not: id }
        }
      })

      if (nameExists) {
        return NextResponse.json(
          { success: false, message: "Interview criteria with this name already exists" },
          { status: 409 }
        )
      }
    }

    const updatedCriteria = await prisma.interviewCriteria.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description.trim(),
        maxScore: maxScore || 10,
        weight: weight || 1.0,
        isActive: isActive !== undefined ? isActive : existingCriteria.isActive
      }
    })

    console.log("✅ Interview criteria updated successfully:", updatedCriteria.name)

    return NextResponse.json({ 
      success: true, 
      message: "Interview criteria updated successfully",
      criteria: updatedCriteria
    })

  } catch (error) {
    console.error("❌ Error updating interview criteria:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error", error: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/v1/admin/interview-criteria/[id]
// Delete interview criteria
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("🔍 Delete interview criteria API called")
    
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
        { success: false, message: "Access denied. Only SUPER_ADMIN can delete interview criteria." },
        { status: 403 }
      )
    }

    const { id } = params

    // Check if criteria exists
    const existingCriteria = await prisma.interviewCriteria.findUnique({
      where: { id }
    })

    if (!existingCriteria) {
      return NextResponse.json(
        { success: false, message: "Interview criteria not found" },
        { status: 404 }
      )
    }

    // Check if criteria is being used in any interviews
    const usedInInterviews = await prisma.interviewScore.findFirst({
      where: { criteriaId: id }
    })

    if (usedInInterviews) {
      return NextResponse.json(
        { success: false, message: "Cannot delete criteria that is being used in interviews. Consider deactivating instead." },
        { status: 400 }
      )
    }

    await prisma.interviewCriteria.delete({
      where: { id }
    })

    console.log("✅ Interview criteria deleted successfully:", existingCriteria.name)

    return NextResponse.json({ 
      success: true, 
      message: "Interview criteria deleted successfully"
    })

  } catch (error) {
    console.error("❌ Error deleting interview criteria:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error", error: error.message },
      { status: 500 }
    )
  }
} 