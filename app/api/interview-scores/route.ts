import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyAuthToken } from '@/lib/token'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const cookieStore = await cookies()
    const token = cookieStore.get("Gemurai_token")

    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await verifyAuthToken(token.value)
    if (!user) {
      console.error('Token verification failed for token:', token.value.substring(0, 20) + '...')
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      )
    }

    // Validate that user has an ID
    if (!user.id) {
      console.error('User object missing ID:', user)
      return NextResponse.json(
        { message: 'User ID not found in token' },
        { status: 401 }
      )
    }

    console.log('User object for interview scores:', { id: user.id, role: user.role, email: user.email })

    // Check if user is an interviewer (EMPLOYER role or specific interviewers)
    if (user.role !== "EMPLOYER" && user.role !== "INTERVIEWER" && user.role !== "SUPER_ADMIN") {
      console.log('Access denied for user role:', user.role)
      return NextResponse.json(
        { message: 'Access denied. Only interviewers can submit scores.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    console.log('🔍 API Request Body:', JSON.stringify(body, null, 2))
    
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

    console.log('🔍 API Extracted Values:', {
      applicationId,
      totalScore,
      totalPossibleScore,
      isUpdate,
      scoresKeys: Object.keys(scores || {}),
      subScoresKeys: Object.keys(subScores || {}),
      commentsKeys: Object.keys(comments || {})
    })

    // Calculate overall score in the required format
    const overallScore = `Points Scored: ${totalScore.toFixed(1)} points`

    // Validate required fields
    if (!applicationId) {
      return NextResponse.json(
        { message: 'Application ID is required' },
        { status: 400 }
      )
    }

    // Use the application ID directly since Apps Script ID is the same as database ID
    let actualApplicationId = applicationId

    // Check if this specific user has already submitted scores for this application
    const existingScores = await prisma.interviewScores.findFirst({
      where: {
        applicationId: actualApplicationId,
        submittedBy: user.id // Add submittedBy field to track who submitted
      }
    })

    if (existingScores && !isUpdate) {
      return NextResponse.json(
        { message: 'You have already submitted interview scores for this application. Use edit mode to update your scores.' },
        { status: 409 }
      )
    }

    if (!existingScores && isUpdate) {
      return NextResponse.json(
        { message: 'No existing scores found to update.' },
        { status: 404 }
      )
    }

    // For EMPLOYER role, allow any employer to interview any application
    // For INTERVIEWER role, check if they are assigned to this application
    let interviewAssignment = null
    
    if (user.role === "INTERVIEWER") {
      interviewAssignment = await prisma.applicationInterview.findFirst({
        where: {
          applicationId: actualApplicationId,
          interviewerId: user.id // user.id contains the user ID
        }
      })

      if (!interviewAssignment) {
        return NextResponse.json(
          { message: 'You are not assigned as an interviewer for this application.' },
          { status: 403 }
        )
      }

      // Check if this specific interviewer has already completed their interview
      if (interviewAssignment.status === "COMPLETED") {
        return NextResponse.json(
          { message: 'You have already completed your interview for this application.' },
          { status: 409 }
        )
      }
    }

    // Create or update interview scores with the user ID who submitted
    let newScores
    console.log('🔍 Database Operation:', {
      isUpdate,
      hasExistingScores: !!existingScores,
      existingScoresId: existingScores?.id
    })
    
    if (isUpdate && existingScores) {
      // Update existing scores
      console.log('📝 Updating existing scores with ID:', existingScores.id)
      newScores = await prisma.interviewScores.update({
        where: {
          id: existingScores.id
        },
        data: {
          totalScore,
          totalPossibleScore,
          overallScore,
          scores: scores,
          subScores: subScores,
          comments: comments || null, // Handle undefined comments
          sections: sections,
          submittedAt: new Date(submittedAt),
          updatedAt: new Date()
        }
      })
      console.log('✅ Successfully updated scores:', newScores.id)
    } else {
      // Create new scores
      console.log('📝 Creating new scores for application:', actualApplicationId)
      newScores = await prisma.interviewScores.create({
        data: {
          applicationId: actualApplicationId,
          totalScore,
          totalPossibleScore,
          overallScore,
          scores: scores,
          subScores: subScores,
          comments: comments || null, // Handle undefined comments
          sections: sections,
          submittedAt: new Date(submittedAt),
          submittedBy: user.id, // Track who submitted the scores
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      console.log('✅ Successfully created new scores:', newScores.id)
    }

    // Update the interview status to COMPLETED for this specific interviewer
    // Only update if there's an interview assignment (for INTERVIEWER role)
    if (interviewAssignment) {
      await prisma.applicationInterview.update({
        where: {
          id: interviewAssignment.id
        },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          overallScore: totalScore,
          overallComment: overallScore,
          updatedAt: new Date()
        }
      })
    }

    // Check if application has been scored 2 times and update status to INTERVIEWED
    const totalScoresForApplication = await prisma.interviewScores.count({
      where: {
        applicationId: actualApplicationId
      }
    })

    if (totalScoresForApplication >= 2) {
      await prisma.application.update({
        where: {
          id: actualApplicationId
        },
        data: {
          status: "INTERVIEWED",
          updatedAt: new Date()
        }
      })
      console.log(`✅ Application ${actualApplicationId} status updated to INTERVIEWED after ${totalScoresForApplication} scores`)
    }

    return NextResponse.json({
      message: isUpdate 
        ? 'Interview scores updated successfully and interview marked as complete'
        : 'Interview scores saved successfully and interview marked as complete',
      data: newScores,
      isUpdate: isUpdate
    })

  } catch (error) {
    console.error('Error saving interview scores:', error)
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    })
    return NextResponse.json(
      { message: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const cookieStore = await cookies()
    const token = cookieStore.get("Gemurai_token")

    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await verifyAuthToken(token.value)
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      )
    }

    // Validate that user has an ID
    if (!user.id) {
      return NextResponse.json(
        { message: 'User ID not found in token' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const applicationId = searchParams.get('applicationId')

    if (!applicationId) {
      return NextResponse.json(
        { message: 'Application ID is required' },
        { status: 400 }
      )
    }

    // Use the application ID directly since Apps Script ID is the same as database ID
    let actualApplicationId = applicationId

    // Check if user is an interviewer or has permission to view scores
    if (user.role !== "EMPLOYER" && user.role !== "INTERVIEWER" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { message: 'Access denied. Only interviewers can view scores.' },
        { status: 403 }
      )
    }

    // For INTERVIEWER role, check if they are assigned to this application
    // For EMPLOYER role, allow viewing scores for any application
    if (user.role === "INTERVIEWER") {
              const interviewAssignment = await prisma.applicationInterview.findFirst({
          where: {
            applicationId: actualApplicationId,
            interviewerId: user.id
          }
        })

      if (!interviewAssignment) {
        return NextResponse.json(
          { message: 'You are not assigned as an interviewer for this application.' },
          { status: 403 }
        )
      }
    }

    // Get the scores submitted by this specific user
    const scores = await prisma.interviewScores.findFirst({
      where: {
        applicationId: actualApplicationId,
        submittedBy: user.id // Only get scores submitted by this user
      }
    })

    // If no scores found, return empty result
    if (!scores) {
      return NextResponse.json({
        data: null,
        message: 'No interview scores found for this application'
      })
    }

    return NextResponse.json({
      data: scores
    })

  } catch (error) {
    console.error('Error fetching interview scores:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 