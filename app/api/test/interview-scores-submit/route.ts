import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Testing interview scores submission...')
    
    const body = await request.json()
    console.log('📝 Request body:', JSON.stringify(body, null, 2))
    
    const {
      applicationId,
      totalScore,
      totalPossibleScore,
      scores,
      subScores,
      comments,
      submittedAt,
      sections,
      isUpdate = false
    } = body

    // Validate required fields
    if (!applicationId) {
      return NextResponse.json(
        { message: 'Application ID is required' },
        { status: 400 }
      )
    }

    console.log('✅ Application ID:', applicationId)
    console.log('✅ Total Score:', totalScore)
    console.log('✅ Is Update:', isUpdate)

    // Test database connection
    await prisma.$connect()
    console.log('✅ Database connected')

    // Check if application exists
    const application = await prisma.application.findUnique({
      where: { id: applicationId }
    })

    if (!application) {
      return NextResponse.json(
        { message: 'Application not found' },
        { status: 404 }
      )
    }

    console.log('✅ Application found:', application.id)

    // For testing, create a mock user ID
    const mockUserId = 'test-user-id'

    // Calculate overall score
    const overallScore = `Points Scored: ${totalScore.toFixed(1)} points`

    // Create or update interview scores
    let newScores
    if (isUpdate) {
      // Find existing scores
      const existingScores = await prisma.interviewScores.findFirst({
        where: {
          applicationId: applicationId,
          submittedBy: mockUserId
        }
      })

      if (existingScores) {
        newScores = await prisma.interviewScores.update({
          where: { id: existingScores.id },
          data: {
            totalScore,
            totalPossibleScore,
            overallScore,
            scores: scores,
            subScores: subScores,
            comments: comments || null,
            sections: sections,
            submittedAt: new Date(submittedAt),
            updatedAt: new Date()
          }
        })
        console.log('✅ Updated existing scores')
      } else {
        return NextResponse.json(
          { message: 'No existing scores found to update.' },
          { status: 404 }
        )
      }
    } else {
      // Create new scores
      newScores = await prisma.interviewScores.create({
        data: {
          applicationId: applicationId,
          totalScore,
          totalPossibleScore,
          overallScore,
          scores: scores,
          subScores: subScores,
          comments: comments || null,
          sections: sections,
          submittedAt: new Date(submittedAt),
          submittedBy: mockUserId,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      console.log('✅ Created new scores')
    }

    return NextResponse.json({
      message: isUpdate 
        ? 'Interview scores updated successfully'
        : 'Interview scores saved successfully',
      data: newScores,
      isUpdate: isUpdate
    })

  } catch (error) {
    console.error('❌ Error saving interview scores:', error)
    return NextResponse.json(
      { 
        message: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
