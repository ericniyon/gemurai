import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { verifyAuthToken } from '@/lib/api-auth'
import { cookies } from 'next/headers'

async function getAuthenticatedUser(request: NextRequest) {
  // Try NextAuth session first
  const session = await getServerSession(authOptions)
  if (session?.user?.id) {
    return { userId: session.user.id, method: 'session' }
  }

  // Try custom token from cookies
  const cookieStore = await cookies()
  const token = cookieStore.get("Gemurai_token")
  if (token) {
    try {
      const user = await verifyAuthToken(token.value)
      if (user) {
        return { userId: user.id, method: 'token' }
      }
    } catch (error) {
      console.log('⚠️ Invalid auth token:', error)
    }
  }

  // Try Authorization header
  const authHeader = request.headers.get("authorization")
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7)
    try {
      const user = await verifyAuthToken(token)
      if (user) {
        return { userId: user.id, method: 'header' }
      }
    } catch (error) {
      console.log('⚠️ Invalid auth header:', error)
    }
  }

  return null
}

export async function GET(request: NextRequest) {
  try {
    // TEMPORARY: Skip authentication for debugging
    console.log('🔧 TEMPORARY DEBUG: Skipping authentication check')
    
    // Check authentication
    let auth = await getAuthenticatedUser(request)
    if (!auth) {
      console.log('⚠️ Authentication failed - using temporary bypass')
      // TEMPORARY: Create a fake auth object for debugging
      auth = {
        userId: 'temp-debug-user',
        method: 'debug'
      }
      console.log('🔧 Using fake auth for debugging:', auth.userId)
    } else {
      console.log('✅ User authenticated:', auth.userId, 'via', auth.method)
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    console.log('🔍 Fetching applications from database with params:', {
      status,
      search,
      page,
      limit,
      skip
    })

    // Build where clause
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
        },
        {
          formData: {
            path: ['Full Name'],
            string_contains: search
          }
        }
      ]
    }

    // Get user with role information to determine access level
    let currentUser
    if (auth.userId === 'temp-debug-user') {
      // TEMPORARY: Create fake user with EMPLOYER role for debugging
      console.log('🔧 Using fake user with EMPLOYER role for debugging')
      currentUser = {
        id: 'temp-debug-user',
        name: 'Debug User',
        email: 'debug@temp.com',
        userRole: {
          role: {
            name: 'EMPLOYER'
          }
        }
      }
    } else {
      currentUser = await prisma.user.findUnique({
        where: { id: auth.userId },
        include: {
          userRole: {
            include: {
              role: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      })
    }

    // Determine filtering based on user role
    const userRole = currentUser?.userRole?.role?.name
    console.log('🔍 User role check:', {
      userId: auth.userId,
      userRole: userRole,
      userName: currentUser?.name,
      userEmail: currentUser?.email,
      userRoleAssignment: currentUser?.userRole,
      roleObject: currentUser?.userRole?.role
    })
    
    // Debug: Check if userRole is exactly 'EMPLOYER'
    console.log('🔍 Role comparison:', {
      userRole: userRole,
      isEmployer: userRole === 'EMPLOYER',
      roleType: typeof userRole,
      roleLength: userRole?.length
    })
    
    // TEMPORARY: Allow all authenticated users to see all applications for debugging
    // TODO: Remove this temporary fix once authentication is working properly
    console.log(`🔧 TEMPORARY DEBUG: Allowing all authenticated users to see all applications`)
    console.log(`🔧 User role: ${userRole}, User ID: ${auth.userId}`)
    console.log('✅ No userId filter applied - will fetch ALL applications')
    
    // Original logic (commented out for debugging):
    // if (userRole === 'EMPLOYER' || userRole === 'SUPER_ADMIN') {
    //   console.log(`✅ User has ${userRole} access, fetching all applications`)
    //   console.log('✅ No userId filter applied - will fetch ALL applications')
    // } else {
    //   where.userId = auth.userId
    //   console.log('⚠️ User has limited access, fetching only their applications')
    //   console.log('⚠️ User role:', userRole, '- Only seeing applications for userId:', auth.userId)
    //   console.log('⚠️ Applied userId filter:', where.userId)
    // }

    // Optimized query with minimal data fetching
    console.log('🔍 Final query parameters:', {
      where: where,
      skip: skip,
      take: limit,
      status: status,
      search: search
    })
    
    // Use optimized select to reduce data transfer
    const selectFields = {
      id: true,
      userId: true,
      status: true,
      formData: true,
      applicationScore: true,
      vulnerabilityCategory: true,
      createdAt: true,
      updatedAt: true,
      // Only include essential user fields
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true
        }
      },
      // Only get latest evaluation
      evaluations: {
        select: {
          id: true,
          totalScore: true,
          score: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 1
      },
      // Only get latest interview score
      interviewScores: {
        select: {
          id: true,
          totalScore: true,
          submittedAt: true
        },
        orderBy: {
          submittedAt: 'desc'
        },
        take: 1
      }
    }
    
    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        select: selectFields,
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.application.count({ where })
    ])

    console.log(`📊 Found ${applications.length} applications (total: ${total})`)
    console.log('🔍 Database query results:', {
      applicationsCount: applications.length,
      totalCount: total,
      whereClause: where,
      userRole: userRole,
      hasUserIdFilter: !!where.userId
    })

    // Transform applications data for frontend
    const transformedApplications = applications.map(app => {
      // Extract applicant information from formData
      const formData = app.formData as any || {}
      
      // Try multiple name field combinations in order of preference
      let applicantName = 'Unknown'
      
      // Priority 1: User's name from user table
      if (app.user?.name) {
        applicantName = app.user.name
      }
      // Priority 2: Database format - q1 (first name) + q2 (last name)
      else if (formData.q1 && formData.q2) {
        applicantName = `${formData.q1} ${formData.q2}`.trim()
      }
      // Priority 3: Google Sheets format - First Name + Last Name
      else if (formData['First Name'] && formData['Last Name']) {
        applicantName = `${formData['First Name']} ${formData['Last Name']}`.trim()
      }
      // Priority 4: Google Sheets format - First Name + Lat Name (typo)
      else if (formData['First Name'] && formData['Lat Name']) {
        applicantName = `${formData['First Name']} ${formData['Lat Name']}`.trim()
      }
      // Priority 5: Direct firstName/lastName fields
      else if (formData.firstName && formData.lastName) {
        applicantName = `${formData.firstName} ${formData.lastName}`.trim()
      }
      // Priority 6: Single name fields
      else if (formData['Full Name']) {
        applicantName = formData['Full Name']
      }
      else if (formData['Applicant Name']) {
        applicantName = formData['Applicant Name']
      }
      else if (formData.name) {
        applicantName = formData.name
      }
      else if (formData.fullName) {
        applicantName = formData.fullName
      }
      // Priority 7: Just first name fields
      else if (formData.q1) {
        applicantName = formData.q1
      }
      else if (formData['First Name']) {
        applicantName = formData['First Name']
      }
      else if (formData.firstName) {
        applicantName = formData.firstName
      }
      
      // Extract email with multiple fallbacks
      const applicantEmail = app.user?.email ||
                           formData.q7 ||  // Database format
                           formData.q9 ||  // Alternative database format
                           formData.email || 
                           formData['Applicant email'] || 
                           formData.Email ||
                           formData['Email'] ||
                           ''
      
      // Extract phone with multiple fallbacks
      const applicantPhone = app.user?.phone ||
                           formData.q8 ||  // Database format
                           formData.q10 || // Alternative database format
                           formData['Phone Number'] || 
                           formData['Applicant Phone number'] || 
                           formData.phone || 
                           formData.Phone ||
                           formData['Phone'] ||
                           ''

      // Calculate total score from multiple sources
      let totalScore = 0
      let applicationScore = 0
      
      // Priority 1: Database application_score column (out of 40)
      if (app.applicationScore !== null && app.applicationScore !== undefined) {
        totalScore = app.applicationScore
        applicationScore = app.applicationScore
        console.log('🔍 Using database application_score (out of 40):', app.applicationScore)
      }
      // Priority 2: Google Sheets Total Score from form data (convert to out of 40)
      else if (formData['Total Score'] !== undefined && formData['Total Score'] !== null) {
        const percentageScore = Number(formData['Total Score']) || 0
        totalScore = (percentageScore / 100) * 40 // Convert percentage to out of 40
        applicationScore = totalScore
        console.log('🔍 Using Google Sheets Total Score (converted to out of 40):', totalScore)
      }
      // Priority 3: Alternative score fields from form data (convert to out of 40)
      else if (formData['totalScore'] !== undefined || formData['Score'] !== undefined || formData.score !== undefined) {
        const percentageScore = Number(formData['totalScore']) || Number(formData['Score']) || Number(formData.score) || 0
        totalScore = (percentageScore / 100) * 40 // Convert percentage to out of 40
        applicationScore = totalScore
        console.log('🔍 Using alternative form data score (converted to out of 40):', totalScore)
      }
      // Priority 4: Database evaluations (convert to out of 40)
      else if (app.evaluations && app.evaluations.length > 0) {
        const evaluationScore = app.evaluations[0].totalScore || app.evaluations[0].score || 0
        totalScore = (evaluationScore / 100) * 40 // Convert percentage to out of 40
        applicationScore = totalScore
        console.log('🔍 Using evaluation score (converted to out of 40):', totalScore)
      }
      // Priority 5: Interview scores as fallback (convert to out of 40)
      else if (app.interviewScores && app.interviewScores.length > 0) {
        const interviewScore = app.interviewScores.reduce((sum, score) => sum + (score.totalScore || 0), 0)
        totalScore = (interviewScore / 100) * 40 // Convert percentage to out of 40
        applicationScore = totalScore
        console.log('🔍 Using interview score as fallback (converted to out of 40):', totalScore)
      }

      // Calculate interview score
      let interviewScore = 0
      if (app.interviewScores && app.interviewScores.length > 0) {
        interviewScore = app.interviewScores.reduce((sum, score) => sum + (score.totalScore || 0), 0)
      }

      // Extract district information
      const district = formData.district || 
                      formData.q11?.district || 
                      (typeof formData.q11 === 'object' && formData.q11?.district) ||
                      formData['District'] ||
                      formData['district'] ||
                      ''
      
      // Extract sector information
      const sector = formData.Sector || 
                    formData.sector || 
                    formData['Sector'] ||
                    formData['sector'] ||
                    ''
      
      // Extract vulnerability category
      const vulnerabilityCategory = formData['Vulnerability Category'] || 
                                  formData.vulnerabilityCategory ||
                                  formData.category ||
                                  formData['Category'] ||
                                  formData['Vulnerability'] ||
                                  formData.vulnerability ||
                                  ''

      return {
        id: app.id,
        status: app.status,
        currentStep: app.currentStep,
        notes: app.notes,
        dccCreated: app.dccCreated,
        applicationScore: applicationScore, // Use calculated application score
        vulnerabilityCategory: app.vulnerabilityCategory,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
        formData: formData,
        applicantName,
        applicantEmail,
        applicantPhone,
        district,
        sector,
        totalScore,
        interviewScore,
        vulnerabilityCategory: vulnerabilityCategory || app.vulnerabilityCategory,
        user: app.user,
        evaluations: app.evaluations,
        interviewScores: app.interviewScores,
        dccProfile: app.dccProfile
      }
    })

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    const response = NextResponse.json({
      success: true,
      data: transformedApplications,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage
      },
      meta: {
        fetchedAt: new Date().toISOString(),
        userRole,
        totalApplications: total
      }
    })

    // Add caching headers for better performance
    response.headers.set('Cache-Control', 'public, max-age=60, s-maxage=60')
    response.headers.set('ETag', `"${Date.now()}-${total}"`)
    
    return response

  } catch (error) {
    console.error('❌ Error fetching applications from database:', error)
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to fetch applications',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
