import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { applicationId, employerId } = await request.json()

    if (!applicationId || !employerId) {
      return NextResponse.json(
        { message: 'Application ID and Employer ID are required' },
        { status: 400 }
      )
    }

    // Test creating interview scores with submittedBy field
    const testScores = {
      applicationId,
      totalScore: 85,
      totalPossibleScore: 100,
      overallScore: "Points Scored: 85.0 points",
      scores: {
        communication: 8.5,
        technical: 9.0,
        problem_solving: 8.0
      },
      subScores: {
        communication: {
          clarity: 9,
          confidence: 8
        }
      },
      sections: {
        technical: 30,
        communication: 25,
        problem_solving: 45
      },
      submittedAt: new Date(),
      submittedBy: employerId, // This should now work
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Check if this employer has already submitted scores
    const existingScores = await prisma.interviewScores.findFirst({
      where: {
        applicationId: applicationId,
        submittedBy: employerId
      }
    })

    if (existingScores) {
      return NextResponse.json({
        success: false,
        message: 'This employer has already submitted scores for this application',
        existingScores
      })
    }

    // Create new scores
    const newScores = await prisma.interviewScores.create({
      data: testScores
    })

    return NextResponse.json({
      success: true,
      message: 'Interview scores created successfully',
      data: newScores
    })

  } catch (error) {
    console.error('Error in test interview scores:', error)
    return NextResponse.json({
      success: false,
      message: 'Error creating interview scores',
      error: error.message,
      details: error
    }, { status: 500 })
  }
} 