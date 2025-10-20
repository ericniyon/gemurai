import { NextRequest, NextResponse } from 'next/server'
import { withDatabase } from '@/lib/db-utils'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { cacheService, CACHE_KEYS, CACHE_TTL } from '@/lib/services/redis-service'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20') // Reduced from 50 to 20 for faster loading
    const search = searchParams.get('search') || ''
    const skip = (page - 1) * limit

    // Create cache key based on parameters
    const cacheKey = `applications:${status || 'all'}:${page}:${limit}:${search}`

    // Try to get from cache first
    const cachedData = await cacheService.get(cacheKey)
    if (cachedData) {
      console.log('📖 Retrieved applications from cache')
      return NextResponse.json(cachedData)
    }

    // Build where clause with optimized conditions
    const where: any = {}
    if (status) {
      where.status = status
    }

    // Add search functionality
    if (search) {
      where.OR = [
        {
          user: {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          user: {
            email: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          formData: {
            path: ['Phone Number'],
            string_contains: search
          }
        }
      ]
    }

    // Optimized query with selective includes and ordering
    const [applications, total] = await withDatabase(async (prisma) => {
      return await Promise.all([
        prisma.application.findMany({
        where,
        select: {
          id: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          formData: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              isActive: true,
            }
          },
          // Only get the latest evaluation for performance
          evaluations: {
            select: {
              id: true,
              type: true,
              score: true,
              totalScore: true,
              feedback: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 1
          },
          // Only get the latest interview score for performance
          interviewScores: {
            select: {
              id: true,
              totalScore: true,
              totalPossibleScore: true,
              overallScore: true,
              submittedAt: true,
              submittedBy: true,
            },
            orderBy: {
              submittedAt: 'desc'
            },
            take: 1
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit,
      }),
      prisma.application.count({ where })
    ])
    })

    // Transform data for response with optimized calculations
    const transformedApplications = applications.map(app => {
      // Calculate total score from evaluations or interview scores
      let totalScore = 0
      if (app.evaluations && app.evaluations.length > 0) {
        totalScore = app.evaluations[0].score || 0
      } else if (app.interviewScores && app.interviewScores.length > 0) {
        totalScore = app.interviewScores[0].totalScore || 0
      }

      return {
        ...app,
        totalScore,
        // Extract key form data for faster access
        phoneNumber: app.formData?.['Phone Number'] || '',
        district: app.formData?.['district'] || '',
        sector: app.formData?.['Sector'] || '',
        age: app.formData?.['Age'] || '',
        gender: app.formData?.['Gender1'] || '',
        education: app.formData?.['Education'] || '',
        vulnerabilityCategory: app.formData?.['Vulnerability Category'] || '',
      }
    })

    const response = {
      applications: transformedApplications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    }

    // Cache the response for 5 minutes
    await cacheService.set(cacheKey, response, CACHE_TTL.SHORT)

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { status } = body

    // Clear applications cache when new data is posted
    await cacheService.deleteByPattern('applications:*')

    // Build where clause
    const where: any = {}
    if (status) {
      where.status = status
    }

    // Fetch applications from database
    const applications = await prisma.application.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          }
        },
        evaluations: {
          select: {
            id: true,
            type: true,
            score: true,
            totalScore: true,
            feedback: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        },
        interviewScores: {
          select: {
            id: true,
            totalScore: true,
            totalPossibleScore: true,
            overallScore: true,
            scores: true,
            submittedAt: true,
            submittedBy: true,
            applicationId: true
          },
          orderBy: {
            submittedAt: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
    })

    // Transform data for response
    const transformedApplications = applications.map(app => {
      // Calculate total score from multiple sources - prioritize Google Sheets Total Score
      let totalScore = 0
      
      // First, try to get score from form data (Google Sheets Total Score)
      if (app.formData && app.formData['Total Score'] !== undefined) {
        totalScore = Number(app.formData['Total Score']) || 0
        console.log('🔍 V1 app using formData Total Score:', totalScore)
      } else if (app.formData) {
        // Try different possible score field names
        totalScore = Number(app.formData['totalScore']) || 
                    Number(app.formData['Score']) || 
                    Number(app.formData.score) || 
                    0
        if (totalScore > 0) {
          console.log('🔍 V1 app using alternative formData score:', totalScore)
        }
      } else if (app.evaluations && app.evaluations.length > 0) {
        totalScore = app.evaluations[0].score || 0
        console.log('🔍 V1 app using evaluation score:', totalScore)
      } else if (app.interviewScores && app.interviewScores.length > 0) {
        totalScore = app.interviewScores.reduce((sum, score) => sum + (score.totalScore || 0), 0)
        console.log('🔍 V1 app using interview scores as fallback:', totalScore)
      }

      return {
        ...app,
        totalScore,
        formData: app.formData || {},
        createdAt: app.createdAt?.toISOString(),
        updatedAt: app.updatedAt?.toISOString(),
        user: app.user || null,
        evaluations: app.evaluations || [],
        interviewScores: app.interviewScores || []
      }
    })

    return NextResponse.json({
      success: true,
      applications: transformedApplications
    })
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
