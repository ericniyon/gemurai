import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await req.json()
    const { applicationScore, vulnerabilityCategory } = body

    // Validate applicationScore if provided
    if (applicationScore !== null && applicationScore !== undefined) {
      const score = parseFloat(applicationScore)
      if (isNaN(score) || score < 0 || score > 100) {
        return NextResponse.json({
          success: false,
          message: 'Application score must be a number between 0 and 100'
        }, { status: 400 })
      }
    }

    // Check if application exists
    const existingApplication = await prisma.application.findUnique({
      where: { id },
      select: { id: true }
    })

    if (!existingApplication) {
      return NextResponse.json({
        success: false,
        message: 'Application not found'
      }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {}
    
    if (applicationScore !== null && applicationScore !== undefined) {
      updateData.applicationScore = parseFloat(applicationScore)
    }
    
    if (vulnerabilityCategory !== null && vulnerabilityCategory !== undefined) {
      updateData.vulnerabilityCategory = vulnerabilityCategory
    }

    // Update the application using raw SQL
    await prisma.$executeRaw`
      UPDATE applications 
      SET application_score = ${updateData.applicationScore || null},
          vulnerability_category = ${updateData.vulnerabilityCategory || null},
          updated_at = NOW()
      WHERE id = ${id}
    `

    // Get the updated application
    const updatedApplication = await prisma.$queryRaw`
      SELECT 
        id,
        application_score as "applicationScore",
        vulnerability_category as "vulnerabilityCategory",
        form_data as "formData",
        updated_at as "updatedAt"
      FROM applications 
      WHERE id = ${id}
    ` as any[]

    return NextResponse.json({
      success: true,
      message: 'Application updated successfully',
      data: {
        id: updatedApplication[0].id,
        applicationScore: updatedApplication[0].applicationScore,
        vulnerabilityCategory: updatedApplication[0].vulnerabilityCategory,
        updatedAt: updatedApplication[0].updatedAt
      }
    })

  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to update application',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
