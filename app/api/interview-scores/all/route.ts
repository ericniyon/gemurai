import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyAuthToken } from '@/lib/api-auth'
import { cacheService, CACHE_KEYS, CACHE_TTL } from '@/lib/services/redis-service'

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
      console.error('User object missing ID:', user)
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

    // Check if user has permission to view scores
    if (user.role !== "EMPLOYER" && user.role !== "INTERVIEWER" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { message: 'Access denied. Only interviewers and employers can view scores.' },
        { status: 403 }
      )
    }

    // Try to get from cache first
    const cacheKey = CACHE_KEYS.INTERVIEW_SCORES(applicationId)
    const cachedScores = await cacheService.get(cacheKey)
    if (cachedScores) {
      console.log('📖 Retrieved interview scores from cache')
      return NextResponse.json(cachedScores)
    }

    // Get all scores for this application
    const scores = await prisma.interviewScores.findMany({
      where: {
        applicationId: applicationId
      },
      orderBy: {
        submittedAt: 'desc'
      }
    })

    // Fetch interviewer information for each score
    const scoresWithInterviewers = await Promise.all(
      scores.map(async (score) => {
        const interviewer = await prisma.user.findUnique({
          where: { id: score.submittedBy },
          select: { id: true, name: true, email: true }
        })

        return {
          ...score,
          interviewer: interviewer
        }
      })
    )

    const response = {
      success: true,
      scores: scoresWithInterviewers
    }

    // Cache the response for 10 minutes
    await cacheService.set(cacheKey, response, CACHE_TTL.MEDIUM)

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching all interview scores:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 