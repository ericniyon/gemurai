import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Use raw SQL to avoid Prisma client issues with new fields
    const applications = await prisma.$queryRaw`
      SELECT 
        id,
        application_score as "applicationScore",
        vulnerability_category as "vulnerabilityCategory",
        form_data as "formData",
        status,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM applications 
      ORDER BY created_at DESC 
      LIMIT ${limit} OFFSET ${offset}
    ` as any[]

    // Transform the data to include name, email, phone from formData
    const transformedApplications = applications.map(app => {
      const formData = app.formData as any || {}
      
      return {
        id: app.id,
        name: formData.name || 
              formData.fullName || 
              formData['Full Name'] || 
              formData['Applicant Name'] ||
              `${formData.firstName || ''} ${formData.lastName || ''}`.trim() ||
              'Unknown',
        email: formData.email || 
               formData.Email || 
               formData['Applicant email'] || 
               formData['Email'] ||
               '',
        phone: formData.phone || 
               formData.Phone || 
               formData.q10 || 
               formData.cell || 
               formData['Phone Number'] || 
               formData['Applicant Phone number'] ||
               formData['phone'] ||
               formData['Phone number'] ||
               '',
        applicationScore: app.applicationScore,
        vulnerabilityCategory: app.vulnerabilityCategory,
        status: app.status,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt
      }
    })

    return NextResponse.json({
      success: true,
      data: transformedApplications,
      total: transformedApplications.length
    })

  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch applications',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
