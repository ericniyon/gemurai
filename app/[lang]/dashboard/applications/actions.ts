'use server'

import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { verifyAuthToken } from "@/lib/api-auth"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { GoogleSheetsService } from "@/lib/services/google-sheets-service"
import { 
  cacheApplications, 
  getCachedApplications, 
  cacheGoogleSheetsData, 
  getCachedGoogleSheetsData,
  getLastGoogleSheetsFetch,
  cacheService 
} from "@/lib/services/memory-cache-service"

export async function getApplicationsWithAuth() {
  try {
    // Check if Redis is available
    const isRedisAvailable = await cacheService.isAvailable()
    
    // Try to get session from NextAuth first
    const session = await getServerSession(authOptions)
    if (session?.user?.id) {
      // Get user with role information
      const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
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

      // Determine filtering based on user role
      let whereClause = {}
      if (currentUser?.userRole?.role?.name === 'EMPLOYER') {
        // Employers can see all applications (no filtering)
        whereClause = {}
      } else if (currentUser?.userRole?.role?.name === 'ADMIN' || currentUser?.userRole?.role?.name === 'SUPER_ADMIN') {
        // Admins can see all applications (no filtering)
        whereClause = {}
      } else {
        // Other users can only see their own applications
        whereClause = { userId: session.user.id }
      }

      // Try to get cached applications first with shorter timeout
      if (isRedisAvailable) {
        console.log('🔍 Checking Redis cache for applications...')
        try {
          const cachedApplications = await Promise.race([
            getCachedApplications(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Cache timeout')), 2000)
            )
          ])
          if (cachedApplications && cachedApplications.length > 0) {
            console.log('✅ Retrieved applications from cache:', cachedApplications.length, 'applications')
            return cachedApplications
          } else {
            console.log('⚠️ Cache is empty or returning 0 applications, proceeding with fresh fetch')
          }
        } catch (error) {
          console.log('⚠️ Cache check failed, proceeding with fresh fetch:', error)
        }
      }

      // Fetch from Google Sheets and merge with database status in parallel
      console.log('🔄 Fetching applications from Google Sheets...')
      const googleSheetsPromise = GoogleSheetsService.fetchApplicationsWithFallback()
      
      // Also fetch database applications in parallel
      console.log('🔄 Fetching applications from database...')
      const databasePromise = prisma.application.findMany({
        where: whereClause,
        select: {
          id: true,
          status: true,
          updatedAt: true,
          interviewScores: {
            select: {
              id: true,
              totalScore: true,
              totalPossibleScore: true,
              overallScore: true,
              scores: true,
              submittedAt: true,
              submittedBy: true
            },
            orderBy: {
              submittedAt: 'asc'
            }
          }
        }
      })
      
      // Wait for both promises to complete
      const [googleSheetsResult, databaseApplications] = await Promise.all([
        googleSheetsPromise,
        databasePromise
      ])
      
      console.log('📊 Google Sheets result:', {
        source: googleSheetsResult.source,
        dataLength: googleSheetsResult.data.length,
        error: googleSheetsResult.error
      })
      
      console.log('📊 Database applications found:', databaseApplications.length)
    
      if (googleSheetsResult.source === 'google-sheets') {
        console.log('✅ Successfully fetched from Google Sheets:', googleSheetsResult.data.length, 'applications')
        console.log('🟢 Google Sheets data sample:', JSON.stringify(googleSheetsResult.data.slice(0, 3), null, 2))
        
        console.log('📊 Database applications found:', databaseApplications.length)
        
        // Create a map of Google Sheets data by multiple identifiers for quick lookup
        const googleSheetsMapById = new Map()
        const googleSheetsMapByPhone = new Map()
        const googleSheetsMapByEmail = new Map()
        
        googleSheetsResult.data.forEach(app => {
          // Map by ID
          googleSheetsMapById.set(app.id, app)
          
          // Map by phone number (try different possible field names)
          const phoneNumber = app.formData?.['Phone Number'] || 
                             app.formData?.['Applicant Phone number'] || 
                             app.formData?.['Other Applicant Phone number'] || 
                             app.formData?.phone || 
                             app.formData?.['Phone'] ||
                             app.formData?.cell
          
          if (phoneNumber) {
            // Normalize phone number for matching
            const normalizedPhone = phoneNumber.toString().replace(/\s+/g, '').replace(/^\+250/, '0')
            googleSheetsMapByPhone.set(normalizedPhone, app)
            console.log(`🔍 Mapped Google Sheets app by phone: ${normalizedPhone} -> ${app.id}`)
          }
          
          // Map by email
          const email = app.formData?.email || app.formData?.['Applicant email'] || app.email
          if (email) {
            googleSheetsMapByEmail.set(email.toLowerCase(), app)
            console.log(`🔍 Mapped Google Sheets app by email: ${email} -> ${app.id}`)
          }
          
          console.log(`🔍 Mapped Google Sheets app ID: ${app.id} with Total Score: ${app.formData?.['Total Score'] || 'undefined'}`)
        })
        
        // Start with database applications and search for them in Google Sheets
        const transformedApplications = databaseApplications.map(dbApp => {
          console.log(`🔍 Processing database app ID: ${dbApp.id}`)
          
          // Try to find matching Google Sheets app by multiple identifiers
          let googleSheetsApp = null
          let matchMethod = 'none'
          
          // First, try to match by ID
          googleSheetsApp = googleSheetsMapById.get(dbApp.id)
          if (googleSheetsApp) {
            matchMethod = 'ID'
            console.log(`✅ Found database app ${dbApp.id} in Google Sheets by ID`)
          }
          
          // If not found by ID, try to match by phone number
          if (!googleSheetsApp && dbApp.formData) {
            const dbPhoneNumber = dbApp.formData.phone || 
                                 dbApp.formData.Phone || 
                                 dbApp.formData.q10 || 
                                 dbApp.formData.cell || 
                                 dbApp.formData['Phone Number'] || 
                                 dbApp.formData['Applicant Phone number'] ||
                                 dbApp.formData['phone'] ||
                                 dbApp.formData['Phone number']
            
            if (dbPhoneNumber) {
              const normalizedDbPhone = dbPhoneNumber.toString().replace(/\s+/g, '').replace(/^\+250/, '0')
              googleSheetsApp = googleSheetsMapByPhone.get(normalizedDbPhone)
              if (googleSheetsApp) {
                matchMethod = 'phone'
                console.log(`✅ Found database app ${dbApp.id} in Google Sheets by phone: ${normalizedDbPhone}`)
              }
            }
          }
          
          // If not found by phone, try to match by email
          if (!googleSheetsApp && dbApp.formData) {
            const dbEmail = dbApp.formData.email || dbApp.formData.Email
            if (dbEmail) {
              googleSheetsApp = googleSheetsMapByEmail.get(dbEmail.toLowerCase())
              if (googleSheetsApp) {
                matchMethod = 'email'
                console.log(`✅ Found database app ${dbApp.id} in Google Sheets by email: ${dbEmail}`)
              }
            }
          }
          
          let systemScore = null
          let googleSheetsData = null
          
          if (googleSheetsApp) {
            googleSheetsData = googleSheetsApp.formData || {}
            
            // Extract Total Score from Google Sheets - this is the System Score
            if (googleSheetsData['Total Score'] !== undefined) {
              const raw = googleSheetsData['Total Score']
              const cleaned = typeof raw === 'string' ? raw.replace(/,/g, '') : raw
              systemScore = Number(cleaned)
              console.log(`🔍 Found Google Sheets Total Score for ${dbApp.id} (matched by ${matchMethod}):`, systemScore)
            } else {
              console.log(`⚠️ No Total Score found in Google Sheets for ${dbApp.id}`)
            }
          } else {
            console.log(`❌ Database app ${dbApp.id} not found in Google Sheets by any method`)
          }
          
          return {
              id: dbApp.id,
              formData: googleSheetsData || dbApp.formData || {},
              createdAt: dbApp.createdAt || new Date().toISOString(),
              updatedAt: dbApp.updatedAt || new Date().toISOString(),
              status: dbApp.status || 'SUBMITTED',
              interviewScores: dbApp.interviewScores || [],
              totalScore: systemScore, // This is the System Score from Google Sheets
            user: {
                id: dbApp.id,
                name: googleSheetsApp?.name || 'Unknown',
                email: googleSheetsApp?.email || '',
              userRole: {
                role: {
                  name: 'APPLICANT'
                }
              }
            },
            evaluations: []
          }
        })
        
        console.log('🔍 Applications with INTERVIEW_INVITED status:', transformedApplications.filter(app => app.status === 'INTERVIEW_INVITED').length)
        
        // Cache the applications if Redis is available
        if (isRedisAvailable) {
          console.log('💾 Caching applications in Redis...')
          await cacheApplications(transformedApplications)
        }
        
        return transformedApplications
      } else {
        // If Google Sheets fails, fall back to database applications
        console.log('❌ Google Sheets failed, falling back to database applications')
        
        // Fetch applications from database
        const databaseApplications = await prisma.application.findMany({
          where: whereClause,
          include: {
            user: {
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
            },
            evaluations: true,
            interviewScores: {
              orderBy: {
                submittedAt: 'asc'
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        })
        
        console.log('📊 Database applications found:', databaseApplications.length)
        
        // Try to fetch Google Sheets data for score lookup even in fallback mode
        let googleSheetsMapById = new Map()
        let googleSheetsMapByPhone = new Map()
        let googleSheetsMapByEmail = new Map()
        
        try {
          console.log('🔄 Attempting to fetch Google Sheets data for score lookup...')
          const fallbackGoogleSheetsResult = await GoogleSheetsService.fetchApplicationsWithFallback()
          if (fallbackGoogleSheetsResult.source === 'google-sheets' && fallbackGoogleSheetsResult.data.length > 0) {
            fallbackGoogleSheetsResult.data.forEach(app => {
              // Map by ID
              googleSheetsMapById.set(app.id, app)
              
              // Map by phone number
              const phoneNumber = app.formData?.['Phone Number'] || 
                                 app.formData?.['Applicant Phone number'] || 
                                 app.formData?.['Other Applicant Phone number'] || 
                                 app.formData?.phone || 
                                 app.formData?.['Phone'] ||
                                 app.formData?.cell
              
              if (phoneNumber) {
                const normalizedPhone = phoneNumber.toString().replace(/\s+/g, '').replace(/^\+250/, '0')
                googleSheetsMapByPhone.set(normalizedPhone, app)
              }
              
              // Map by email
              const email = app.formData?.email || app.formData?.['Applicant email'] || app.email
              if (email) {
                googleSheetsMapByEmail.set(email.toLowerCase(), app)
              }
            })
            console.log(`✅ Successfully mapped ${googleSheetsMapById.size} Google Sheets applications for score lookup`)
          }
        } catch (error) {
          console.log('⚠️ Failed to fetch Google Sheets data for score lookup:', error)
        }
        
        // Transform database applications to match expected format
        const transformedApplications = databaseApplications.map(app => {
          console.log(`🔍 Processing database app ID: ${app.id}`)
          
          // Try to find matching Google Sheets app by multiple identifiers
          let googleSheetsApp = null
          let matchMethod = 'none'
          
          // First, try to match by ID
          googleSheetsApp = googleSheetsMapById.get(app.id)
          if (googleSheetsApp) {
            matchMethod = 'ID'
            console.log(`✅ Found database app ${app.id} in Google Sheets by ID`)
          }
          
          // If not found by ID, try to match by phone number
          if (!googleSheetsApp && app.formData) {
            const dbPhoneNumber = app.formData.phone || 
                                 app.formData.Phone || 
                                 app.formData.q10 || 
                                 app.formData.cell || 
                                 app.formData['Phone Number'] || 
                                 app.formData['Applicant Phone number'] ||
                                 app.formData['phone'] ||
                                 app.formData['Phone number']
            
            if (dbPhoneNumber) {
              const normalizedDbPhone = dbPhoneNumber.toString().replace(/\s+/g, '').replace(/^\+250/, '0')
              googleSheetsApp = googleSheetsMapByPhone.get(normalizedDbPhone)
              if (googleSheetsApp) {
                matchMethod = 'phone'
                console.log(`✅ Found database app ${app.id} in Google Sheets by phone: ${normalizedDbPhone}`)
              }
            }
          }
          
          // If not found by phone, try to match by email
          if (!googleSheetsApp && app.formData) {
            const dbEmail = app.formData.email || app.formData.Email
            if (dbEmail) {
              googleSheetsApp = googleSheetsMapByEmail.get(dbEmail.toLowerCase())
              if (googleSheetsApp) {
                matchMethod = 'email'
                console.log(`✅ Found database app ${app.id} in Google Sheets by email: ${dbEmail}`)
              }
            }
          }
          
          let systemScore = null
          let googleSheetsData = null
          
          if (googleSheetsApp) {
            googleSheetsData = googleSheetsApp.formData || {}
            
            // Extract Total Score from Google Sheets - this is the System Score
            if (googleSheetsData['Total Score'] !== undefined) {
              const raw = googleSheetsData['Total Score']
              const cleaned = typeof raw === 'string' ? raw.replace(/,/g, '') : raw
              systemScore = Number(cleaned)
              console.log(`🔍 Found Google Sheets Total Score for ${app.id} (matched by ${matchMethod}):`, systemScore)
            } else {
              console.log(`⚠️ No Total Score found in Google Sheets for ${app.id}`)
            }
          } else {
            console.log(`❌ Database app ${app.id} not found in Google Sheets by any method`)
          }
          
          return {
            ...app,
            formData: googleSheetsData || app.formData || {},
            createdAt: app.createdAt || new Date().toISOString(),
            updatedAt: app.updatedAt || new Date().toISOString(),
            user: app.user || null,
            evaluations: app.evaluations || [],
            interviewScores: app.interviewScores || [],
            totalScore: systemScore // This is the System Score from Google Sheets
          }
        })
        
        console.log('✅ Database applications loaded successfully:', transformedApplications.length)
        
        // Cache the applications if Redis is available
        if (isRedisAvailable) {
          console.log('💾 Caching database applications in Redis...')
          await cacheApplications(transformedApplications)
        }
        
        return transformedApplications
      }
    }

    // If no session, try custom token
    const cookieStore = await cookies()
    const token = await cookieStore.get("Gemurai_token")

    if (!token) {
      console.log('❌ No authentication token found')
      return { 
        error: "Authentication required. Please log in to view applications.", 
        redirect: `/login` 
      }
    }

    const user = await verifyAuthToken(token.value)
    if (!user) {
      console.log('❌ Invalid authentication token')
      return { 
        error: "Invalid authentication token. Please log in again.", 
        redirect: `/login` 
      }
    }

    // Get user with role information
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        roleAssignments: {
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

    // Determine filtering based on user role
    let whereClause = {}
    const userRole = currentUser?.roleAssignments?.[0]?.role?.name
    if (userRole === 'EMPLOYER') {
      // Employers can see all applications (no filtering)
      whereClause = {}
    } else if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
      // Admins can see all applications (no filtering)
      whereClause = {}
    } else {
      // Other users can only see their own applications
      whereClause = { userId: user.id }
    }

    // Try to get cached applications first
    if (isRedisAvailable) {
      console.log('🔍 Checking Redis cache for applications...')
      const cachedApplications = await getCachedApplications()
      if (cachedApplications) {
        console.log('✅ Retrieved applications from cache:', cachedApplications.length, 'applications')
        return cachedApplications
      }
    }

    // Fetch from Google Sheets and merge with database status
    console.log('🔄 Fetching applications from Google Sheets...')
    const googleSheetsResult = await GoogleSheetsService.fetchApplicationsWithFallback()
    
    if (googleSheetsResult.source === 'google-sheets') {
      console.log('✅ Successfully fetched from Google Sheets:', googleSheetsResult.data.length, 'applications')
      
      // Get database applications to merge status information
      const databaseApplications = await prisma.application.findMany({
        where: whereClause,
        select: {
          id: true,
          status: true,
          updatedAt: true,
          interviewScores: {
            select: {
              id: true,
              totalScore: true,
              totalPossibleScore: true,
              overallScore: true,
              scores: true,
              submittedAt: true,
              submittedBy: true
            },
            orderBy: {
              submittedAt: 'asc'
            }
          }
        }
      })
      
      console.log('📊 Database applications found:', databaseApplications.length)
      
      // Create a map of database status by application ID
      const statusMap = new Map()
      databaseApplications.forEach(dbApp => {
        statusMap.set(dbApp.id, {
          status: dbApp.status,
          updatedAt: dbApp.updatedAt,
          interviewScores: dbApp.interviewScores
        })
      })
      
      // Transform Google Sheets data to match our application format
      const transformedApplications = googleSheetsResult.data.map(app => {
        const dbStatus = statusMap.get(app.id)
        return {
          ...app,
          id: app.id || `GS-${Date.now()}-${Math.random()}`,
          formData: app.formData || {},
          createdAt: app.createdAt || new Date().toISOString(),
          updatedAt: dbStatus?.updatedAt || app.updatedAt || new Date().toISOString(),
          status: dbStatus?.status || app.status || 'SUBMITTED', // Use database status if available
          interviewScores: dbStatus?.interviewScores || [],
          user: {
            id: app.id,
            name: app.name,
            email: app.email,
            userRole: {
              role: {
              name: 'APPLICANT'
            }
          }
        },
        evaluations: []
      }
    })
    
    console.log('🔍 Applications with INTERVIEW_INVITED status:', transformedApplications.filter(app => app.status === 'INTERVIEW_INVITED').length)
    
    // Cache the applications if Redis is available
    if (isRedisAvailable) {
      console.log('💾 Caching applications in Redis...')
      await cacheApplications(transformedApplications)
    }
    
    return transformedApplications
  }

    // If Google Sheets fails, fall back to database applications
    console.log('❌ Google Sheets failed, falling back to database applications')
    
    // Fetch applications from database
    const databaseApplications = await prisma.application.findMany({
      where: whereClause,
      include: {
        user: {
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
        },
        evaluations: true,
        interviewScores: {
          orderBy: {
            submittedAt: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log('📊 Database applications found:', databaseApplications.length)
    
    // Transform database applications to match expected format
    const transformedApplications = databaseApplications.map(app => {
      // Extract total score for sorting
      let totalScore = 0
      if (app.formData && app.formData['Total Score'] !== undefined) {
        totalScore = Number(app.formData['Total Score']) || 0
      } else if (app.evaluations && app.evaluations.length > 0) {
        totalScore = app.evaluations[0].score || 0
      }
      
      return {
        ...app,
        formData: app.formData || {},
        createdAt: app.createdAt || new Date().toISOString(),
        updatedAt: app.updatedAt || new Date().toISOString(),
        user: app.user || null,
        evaluations: app.evaluations || [],
        interviewScores: app.interviewScores || [],
        totalScore: totalScore
      }
    })
    
    console.log('✅ Database applications loaded successfully:', transformedApplications.length)
    
    // Cache the applications if Redis is available
    if (isRedisAvailable) {
      console.log('💾 Caching database applications in Redis...')
      await cacheApplications(transformedApplications)
    }
    
    return transformedApplications
  } catch (error) {
    console.error('❌ Error in getApplicationsWithAuth:', error)
    return { 
      error: "Failed to fetch applications. Please try again later.", 
      redirect: `/login` 
    }
  }
}

export async function getInterviewInvitedApplicationsFromDb() {
  try {
    const applications = await prisma.application.findMany({
      where: { status: 'INTERVIEW_INVITED' },
      include: {
        evaluations: true,
        interviewScores: {
          select: {
            id: true,
            totalScore: true,
            totalPossibleScore: true,
            overallScore: true,
            scores: true,
            submittedAt: true,
            submittedBy: true
          },
          orderBy: {
            submittedAt: 'asc'
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
    
    // Try to fetch Google Sheets data for score lookup
    let googleSheetsMap = new Map()
    try {
      console.log('🔄 Fetching Google Sheets data for Interview Invited applications...')
      const googleSheetsResult = await GoogleSheetsService.fetchApplicationsWithFallback()
      if (googleSheetsResult.source === 'google-sheets' && googleSheetsResult.data.length > 0) {
        googleSheetsResult.data.forEach(app => {
          googleSheetsMap.set(app.id, app)
        })
        console.log(`✅ Successfully mapped ${googleSheetsMap.size} Google Sheets applications for Interview Invited lookup`)
      }
    } catch (error) {
      console.log('⚠️ Failed to fetch Google Sheets data for Interview Invited lookup:', error)
    }
    
    return applications.map(app => {
      console.log(`🔍 Processing Interview Invited database app ID: ${app.id}`)
      
      // Search for this database app ID in Google Sheets
      const googleSheetsApp = googleSheetsMap.get(app.id)
      
                let systemScore = null
          let googleSheetsData = null
          
          if (googleSheetsApp) {
            console.log(`✅ Found Interview Invited database app ${app.id} in Google Sheets`)
            googleSheetsData = googleSheetsApp.formData || {}
            
            // Extract Total Score from Google Sheets - this is the System Score
            if (googleSheetsData['Total Score'] !== undefined) {
              systemScore = Number(googleSheetsData['Total Score'])
              console.log(`🔍 Found Google Sheets Total Score for Interview Invited ${app.id}:`, systemScore)
            } else {
              console.log(`⚠️ No Total Score found in Google Sheets for Interview Invited ${app.id}`)
            }
          } else {
            console.log(`❌ Interview Invited database app ${app.id} not found in Google Sheets`)
          }
      
      // Extract vulnerability category from form data
      const formData = googleSheetsData || app.formData || {}
      const vulnerabilityCategory = formData['Vulnerability Category'] || 
                                  formData.vulnerabilityCategory ||
                                  formData.category ||
                                  formData['Category'] ||
                                  formData['Vulnerability'] ||
                                  formData.vulnerability ||
                                  formData['vulnerability category'] ||
                                  formData['Vulnerability category'] ||
                                  ''
      
      console.log('🔍 Extracted vulnerability category:', vulnerabilityCategory)
        console.log('🔍 System Score from Google Sheets:', systemScore)
      
      return {
        ...app,
        formData: formData,
        createdAt: app.createdAt || new Date().toISOString(),
        updatedAt: app.updatedAt || new Date().toISOString(),
        user: null, // Don't include user data as it contains admin info, not applicant info
        evaluations: app.evaluations || [],
        interviewScores: app.interviewScores || [],
          totalScore: systemScore, // This is the System Score from Google Sheets
        vulnerabilityCategory: vulnerabilityCategory
      }
    });
  } catch (error) {
    console.error('❌ Error in getInterviewInvitedApplicationsFromDb:', error);
    return [];
  }
}

export async function getInterviewedApplicationsFromDb() {
  try {
    // Fetch applications from database
    const applications = await prisma.application.findMany({
      where: { status: 'INTERVIEWED' },
      include: {
        evaluations: true,
        interviewScores: {
          select: {
            id: true,
            totalScore: true,
            totalPossibleScore: true,
            overallScore: true,
            scores: true,
            submittedAt: true,
            submittedBy: true
          },
          orderBy: {
            submittedAt: 'asc'
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    // Try to fetch Google Sheets data for score lookup
    let googleSheetsMapById = new Map()
    let googleSheetsMapByPhone = new Map()
    let googleSheetsMapByEmail = new Map()
    
    try {
      console.log('🔄 Fetching Google Sheets data for Interviewed applications...')
      const googleSheetsResult = await GoogleSheetsService.fetchApplicationsWithFallback()
    if (googleSheetsResult.source === 'google-sheets' && googleSheetsResult.data.length > 0) {
              googleSheetsResult.data.forEach(app => {
          // Map by ID
          googleSheetsMapById.set(app.id, app)
          
          // Map by phone number
          const phoneNumber = app.formData?.['Phone Number'] || 
                             app.formData?.['Applicant Phone number'] || 
                             app.formData?.['Other Applicant Phone number'] || 
                             app.formData?.phone || 
                             app.formData?.['Phone'] ||
                             app.formData?.cell
          
          if (phoneNumber) {
            const normalizedPhone = phoneNumber.toString().replace(/\s+/g, '').replace(/^\+250/, '0')
            googleSheetsMapByPhone.set(normalizedPhone, app)
          }
          
          // Map by email
          const email = app.formData?.email || app.formData?.['Applicant email'] || app.email
          if (email) {
            googleSheetsMapByEmail.set(email.toLowerCase(), app)
          }
        })
        console.log(`✅ Successfully mapped ${googleSheetsMapById.size} Google Sheets applications for Interviewed lookup`)
      }
    } catch (error) {
      console.log('⚠️ Failed to fetch Google Sheets data for Interviewed lookup:', error)
    }

    return applications.map(app => {
      console.log(`🔍 Processing Interviewed database app ID: ${app.id}`)
      
      // Try to find matching Google Sheets app by multiple identifiers
      let googleSheetsApp = null
      let matchMethod = 'none'
      
      // First, try to match by ID
      googleSheetsApp = googleSheetsMapById.get(app.id)
      if (googleSheetsApp) {
        matchMethod = 'ID'
        console.log(`✅ Found Interviewed database app ${app.id} in Google Sheets by ID`)
      }
      
      // If not found by ID, try to match by phone number
      if (!googleSheetsApp && app.formData) {
        const dbPhoneNumber = app.formData.phone || 
                             app.formData.Phone || 
                             app.formData.q10 || 
                             app.formData.cell || 
                             app.formData['Phone Number'] || 
                             app.formData['Applicant Phone number'] ||
                             app.formData['phone'] ||
                             app.formData['Phone number']
        
        if (dbPhoneNumber) {
          const normalizedDbPhone = dbPhoneNumber.toString().replace(/\s+/g, '').replace(/^\+250/, '0')
          googleSheetsApp = googleSheetsMapByPhone.get(normalizedDbPhone)
          if (googleSheetsApp) {
            matchMethod = 'phone'
            console.log(`✅ Found Interviewed database app ${app.id} in Google Sheets by phone: ${normalizedDbPhone}`)
          }
        }
      }
      
      // If not found by phone, try to match by email
      if (!googleSheetsApp && app.formData) {
        const dbEmail = app.formData.email || app.formData.Email
        if (dbEmail) {
          googleSheetsApp = googleSheetsMapByEmail.get(dbEmail.toLowerCase())
          if (googleSheetsApp) {
            matchMethod = 'email'
            console.log(`✅ Found Interviewed database app ${app.id} in Google Sheets by email: ${dbEmail}`)
          }
        }
      }
      
      let systemScore = null
      let googleSheetsData = null
      
      if (googleSheetsApp) {
        googleSheetsData = googleSheetsApp.formData || {}
        
        // Extract Total Score from Google Sheets - this is the System Score
        if (googleSheetsData['Total Score'] !== undefined) {
          systemScore = Number(googleSheetsData['Total Score'])
          console.log(`🔍 Found Google Sheets Total Score for Interviewed ${app.id}:`, systemScore)
        } else {
          console.log(`⚠️ No Total Score found in Google Sheets for Interviewed ${app.id}`)
        }
      } else {
        console.log(`❌ Interviewed database app ${app.id} not found in Google Sheets by any method`)
      }
      
      // Extract vulnerability category from form data
      const formData = googleSheetsData || app.formData || {}
      const vulnerabilityCategory = formData['Vulnerability Category'] || 
                                  formData.vulnerabilityCategory ||
                                  formData.category ||
                                  formData['Category'] ||
                                  formData['Vulnerability'] ||
                                  formData.vulnerability ||
                                  formData['vulnerability category'] ||
                                  formData['Vulnerability category'] ||
                                  ''
      
      // Calculate interview score from interview scores
      let interviewScore = 0
      if (app.interviewScores && app.interviewScores.length > 0) {
        interviewScore = app.interviewScores.reduce((sum, score) => sum + (score.totalScore || 0), 0)
      }
      
      console.log('🔍 Extracted vulnerability category:', vulnerabilityCategory)
      console.log('🔍 System Score from Google Sheets:', systemScore)
      console.log('🔍 Calculated interview score:', interviewScore)
      
      return {
        ...app,
        formData: formData,
        createdAt: app.createdAt || new Date().toISOString(),
        updatedAt: app.updatedAt || new Date().toISOString(),
        user: null, // Don't include user data as it contains admin info, not applicant info
        evaluations: app.evaluations || [],
        interviewScores: app.interviewScores || [],
        totalScore: systemScore, // This is the System Score from Google Sheets
        interviewScore: interviewScore,
        vulnerabilityCategory: vulnerabilityCategory
      }
    });
  } catch (error) {
    console.error('❌ Error in getInterviewedApplicationsFromDb:', error);
    return [];
  }
}

export async function triggerAIEvaluation(applicationId: string) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { 
        error: "Unauthorized", 
        redirect: `/login` 
      }
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/v1/applications/${applicationId}/evaluate-ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Failed to trigger AI evaluation')
    }

    // Revalidate the applications page to show updated data
    revalidatePath('/dashboard/applications')
    revalidatePath(`/dashboard/applications/${applicationId}`)

    return { success: true }
  } catch (error) {
    console.error("Error triggering AI evaluation:", error)
    return { 
      error: "Failed to trigger AI evaluation",
      redirect: `/login`
    }
  }
}

export async function triggerBulkAIEvaluation() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { 
        error: "Unauthorized", 
        redirect: `/login` 
      }
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/v1/applications/bulk-evaluate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Failed to trigger bulk AI evaluation')
    }

    const data = await response.json()

    // Revalidate the applications page to show updated data
    revalidatePath('/dashboard/applications')

    return { 
      success: true,
      count: data.results.length
    }
  } catch (error) {
    console.error("Error triggering bulk AI evaluation:", error)
    return { 
      error: "Failed to trigger bulk AI evaluation",
      redirect: `/login`
    }
  }
} 

export async function getSubmittedApplicationsFromGoogleSheets() {
  try {
    console.log('🔄 Fetching submitted applications from Google Sheets...')
    
    // Import GoogleSheetsService
    const { GoogleSheetsService } = await import("@/lib/services/google-sheets-service")
    
    // Fetch submitted applications from Google Sheets
    const result = await GoogleSheetsService.fetchSubmittedApplicationsWithFallback()
    
    console.log('📊 Google Sheets result for submitted applications:', {
      source: result.source,
      dataLength: result.data.length,
      error: result.error
    })
    
    if (result.source === 'google-sheets' && result.data.length > 0) {
      console.log('✅ Successfully fetched submitted applications from Google Sheets:', result.data.length, 'applications')
      
      // Transform the data to match our application format
      const transformedApplications = result.data.map(app => {
        // Extract total score for sorting
        let totalScore = 0
        if (app.formData && app.formData['Total Score'] !== undefined) {
          totalScore = Number(app.formData['Total Score']) || 0
        } else if (app.evaluations && app.evaluations.length > 0) {
          totalScore = app.evaluations[0].score || 0
        }
        
        return {
          ...app,
          id: app.id || `GS-${Date.now()}-${Math.random()}`,
          formData: app.formData || {},
          createdAt: app.createdAt || new Date().toISOString(),
          updatedAt: app.updatedAt || new Date().toISOString(),
          status: app.status || 'SUBMITTED',
          user: {
            id: app.id,
            name: app.name,
            email: app.email,
            userRole: {
              role: {
                name: 'APPLICANT'
              }
            }
          },
          evaluations: app.evaluations || [],
          interviewScores: app.interviewScores || [],
          totalScore: totalScore
        }
      })
      
      console.log('✅ Transformed submitted applications from Google Sheets:', transformedApplications.length)
      return transformedApplications
    } else {
      console.log('❌ No submitted applications found in Google Sheets, returning empty array')
      return []
    }
    
  } catch (error) {
    console.error('❌ Error fetching submitted applications from Google Sheets:', error)
    return []
  }
} 

// Force clear caches to allow live reload from Google Sheets
export async function forceLiveReloadFromGoogleSheets() {
  try {
    // Clear applications cache and any google sheets cached payloads
    await cacheService.clearApplicationsCache()
    await cacheService.delete('google_sheets_data')
    await cacheService.delete('last_google_sheets_fetch')
    // Optionally clear generic applications:* keys already handled by clearApplicationsCache
    return { success: true }
  } catch (error) {
    console.error('❌ Failed to clear cache for live reload:', error)
    return { success: false, error: 'Failed to clear cache' }
  }
}