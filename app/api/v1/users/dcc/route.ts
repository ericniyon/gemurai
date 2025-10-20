import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { verifyAuthToken } from "@/lib/api-auth"

async function getAuthenticatedUser(request: NextRequest) {
  // Try NextAuth session first
  const session = await getServerSession(authOptions)
  if (session?.user?.id) {
    return { userId: session.user.id, method: 'session' }
  }

  // Try custom token from Authorization header
  const authHeader = request.headers.get("authorization")
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7)
    const user = await verifyAuthToken(token)
    if (user) {
      return { userId: user.id, method: 'token' }
    }
  }

  // Try token from cookies (for superadmin routes)
  const cookieToken = request.cookies.get("Gemurai_token")?.value
  if (cookieToken) {
    const user = await verifyAuthToken(cookieToken)
    if (user) {
      return { userId: user.id, method: 'cookie' }
    }
  }

  return null
}

export async function GET(request: NextRequest) {
  try {
    console.log("👥 Starting DCC users fetch...")
    
    // Authenticate user (any authenticated user can access)
    const auth = await getAuthenticatedUser(request)
    if (!auth) {
      console.log("❌ Authentication failed")
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    console.log("✅ User authenticated:", auth.userId)

    // Parse query parameters
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get("page") || "1")
    const limit = parseInt(url.searchParams.get("limit") || "10")
    const search = url.searchParams.get("search") || ""
    const isActive = url.searchParams.get("isActive")

    const skip = (page - 1) * limit

    // Build where clause for DCC role users
    const where: any = {
      userRole: {
        role: {
          name: "DCC"
        }
      }
    }

    // Add search filter if provided
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Add active filter if provided
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    console.log("📝 Query parameters:", { page, limit, search, isActive, where })

    // Fetch DCC users with pagination
    const [dccUsers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          national_id: true,
          avatar: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          userRole: {
            select: {
              role: {
                select: {
                  name: true,
                  description: true
                }
              },
              assignedAt: true,
              isActive: true
            }
          },
          // Include DCC profile information if available
          dccProfile: {
            select: {
              id: true,
              level: true,
              rating: true,
              totalSales: true,
              monthlySales: true,
              productsAvailable: true,
              status: true,
              location: true,
              specialties: true
            }
          }
        },
        orderBy: [
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ])

    console.log("✅ DCC users fetched successfully:", dccUsers.length, "total:", total)

    // Fetch latest applications for these users to derive location data
    const userIds = dccUsers.map(u => u.id)
    const userPhones = dccUsers.map(u => u.phone).filter(Boolean)
    const userNationalIds = dccUsers.map(u => u.national_id).filter(Boolean)
    
    // Try to find applications by userId first
    const applicationsByUserId = await prisma.application.findMany({
      where: { userId: { in: userIds } },
      select: { userId: true, formData: true, createdAt: true, phone: true },
      orderBy: { createdAt: 'desc' }
    })

    // Always try phone number matching as well, even if we found applications by userId
    let applicationsByPhone = []
    if (userPhones.length > 0) {
      console.log("🔍 Trying phone number matching for additional applications...")
      
      // Create comprehensive phone number variations for matching
      const normalizePhone = (phone: string): string => {
        if (!phone) return ''
        
        // Remove all non-digit characters
        const digits = phone.replace(/\D/g, '')
        
        // Handle different formats
        if (digits.startsWith('250')) {
          return digits.substring(3) // Remove 250 prefix
        } else if (digits.startsWith('0')) {
          return digits.substring(1) // Remove leading 0
        }
        
        return digits
      }

      const generatePhoneVariations = (phone: string): string[] => {
        if (!phone) return []
        
        const normalized = normalizePhone(phone)
        const variations = new Set<string>()
        
        // Add normalized version
        variations.add(normalized)
        
        // Add with leading 0
        variations.add('0' + normalized)
        
        // Add with 250 prefix
        variations.add('250' + normalized)
        
        // Add with +250 prefix
        variations.add('+250' + normalized)
        
        // Add with spaces (common in applications)
        if (normalized.length >= 9) {
          const spaced = normalized.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3')
          variations.add(spaced)
          variations.add('0' + spaced)
          variations.add('250' + spaced)
          variations.add('+250' + spaced)
        }
        
        return Array.from(variations)
      }

      const phoneVariations = []
      for (const phone of userPhones) {
        if (phone) {
          const variations = generatePhoneVariations(phone)
          phoneVariations.push(...variations)
        }
      }
      
      console.log(`📱 Phone variations for matching: ${phoneVariations.slice(0, 10).join(', ')}...`)
      
      applicationsByPhone = await prisma.application.findMany({
        where: { 
          phone: { in: phoneVariations }
          // Remove userId: null filter to include all applications
        },
        select: { userId: true, formData: true, createdAt: true, phone: true },
        orderBy: { createdAt: 'desc' }
      })
    }

    // Try national ID matching as well
    let applicationsByNationalId = []
    if (userNationalIds.length > 0) {
      console.log("🔍 Trying national ID matching for additional applications...")
      console.log(`🆔 National IDs for matching: ${userNationalIds.slice(0, 5).join(', ')}...`)
      
      // Get all applications and filter by national ID in formData
      const allApplications = await prisma.application.findMany({
        select: { userId: true, formData: true, createdAt: true, phone: true },
        orderBy: { createdAt: 'desc' }
      })
      
      // Filter applications that have matching national IDs in formData
      applicationsByNationalId = allApplications.filter(app => {
        if (!app.formData) return false
        
        let formData = app.formData
        if (typeof formData === 'string') {
          try { formData = JSON.parse(formData) } catch { return false }
        }
        
        const appNationalId = formData.q5 // National ID is stored in q5 field
        if (!appNationalId || typeof appNationalId !== 'string') return false
        
        return userNationalIds.includes(appNationalId.trim())
      })
      
      console.log(`🆔 Found ${applicationsByNationalId.length} applications by national ID matching`)
    }

    const userIdToApplication = new Map<string, any>()
    const phoneToApplication = new Map<string, any>()
    const nationalIdToApplication = new Map<string, any>()

    // Map applications by userId
    for (const app of applicationsByUserId) {
      if (!userIdToApplication.has(app.userId)) {
        userIdToApplication.set(app.userId, app)
      }
    }

    // Map applications by phone number
    for (const app of applicationsByPhone) {
      if (!phoneToApplication.has(app.phone)) {
        phoneToApplication.set(app.phone, app)
      }
    }

    // Map applications by national ID
    for (const app of applicationsByNationalId) {
      if (!app.formData) continue
      
      let formData = app.formData
      if (typeof formData === 'string') {
        try { formData = JSON.parse(formData) } catch { continue }
      }
      
      const appNationalId = formData.q5
      if (appNationalId && typeof appNationalId === 'string') {
        if (!nationalIdToApplication.has(appNationalId.trim())) {
          nationalIdToApplication.set(appNationalId.trim(), app)
        }
      }
    }

    console.log(`📊 Found ${applicationsByUserId.length} applications by userId, ${applicationsByPhone.length} by phone, ${applicationsByNationalId.length} by national ID`)

    const parseLocationParts = (location?: string | null): string[] => {
      if (!location) return []
      const raw = String(location)
      const parts = raw.split(/[\,\|\/-]+/)
      return parts
        .map(p => p
          .replace(/\b(Province|District|Sector|Cell|Country)\b[:\-]?/gi, "")
          .trim())
        .filter(Boolean)
    }

    const getSectorFromLocation = (location?: string | null): string | undefined => {
      if (!location) return undefined
      const labeled = /sector\s*[:\-]?\s*([A-Za-z\s]+)/i.exec(location)
      if (labeled?.[1]?.trim()) return labeled[1].trim()
      const parts = parseLocationParts(location)
      if (parts.length >= 3) return parts[2]
      if (parts.length >= 1) return parts[parts.length - 1]
      return undefined
    }

    const getLocationFromFormData = (formData?: any): { province?: string, district?: string, sector?: string } => {
      if (!formData) return {}
      if (typeof formData === 'string') {
        try { formData = JSON.parse(formData) } catch {
          return {}
        }
      }

      const location: { province?: string, district?: string, sector?: string } = {}

      // Direct field access - these are the most common field names
      const directFields = {
        province: [formData.province, formData.Province, formData.PROVINCE],
        district: [formData.district, formData.District, formData.DISTRICT],
        sector: [formData.sector, formData.Sector, formData.SECTOR, formData.q13, formData.q_sector]
      }

      for (const [key, values] of Object.entries(directFields)) {
        for (const value of values) {
          if (typeof value === 'string' && value.trim()) {
            location[key as keyof typeof location] = value.trim()
            break
          }
        }
      }

      // Nested object access (q11 is the dependent dropdown object)
      const nestedFields = {
        province: [
          formData.q11?.province, formData.q11?.Province,
          formData.address?.province, formData.address?.Province,
          formData.location?.province, formData.location?.Province
        ],
        district: [
          formData.q11?.district, formData.q11?.District,
          formData.address?.district, formData.address?.District,
          formData.location?.district, formData.location?.District
        ],
        sector: [
          formData.q11?.sector, formData.q11?.Sector,
          formData.address?.sector, formData.address?.Sector,
          formData.location?.sector, formData.location?.Sector
        ]
      }

      for (const [key, values] of Object.entries(nestedFields)) {
        if (!location[key as keyof typeof location]) {
          for (const value of values) {
            if (typeof value === 'string' && value.trim()) {
              location[key as keyof typeof location] = value.trim()
              break
            }
          }
        }
      }

      // Deep search for any remaining fields
      if (!location.province || !location.district || !location.sector) {
      const stack: any[] = [formData]
      while (stack.length) {
        const current = stack.pop()
        if (current && typeof current === 'object') {
          for (const [key, value] of Object.entries(current)) {
              if (typeof value === 'string' && value.trim()) {
                if (/province/i.test(key) && !location.province) {
                  location.province = value.trim()
                } else if (/district/i.test(key) && !location.district) {
                  location.district = value.trim()
                } else if (/sector/i.test(key) && !location.sector) {
                  location.sector = value.trim()
                }
            } else if (value && typeof value === 'object') {
              stack.push(value)
              }
            }
          }
        }
      }

      return location
    }

    // Enhanced location extraction that tries userId first, then phone number
    const getLocationFromUser = (user: any): { province?: string, district?: string, sector?: string } => {
      // First try application by userId
      let application = userIdToApplication.get(user.id)
      
      // If no application found by userId, try by phone number with comprehensive matching
      if (!application && user.phone) {
        // Use the same comprehensive phone matching logic
        const normalizePhone = (phone: string): string => {
          if (!phone) return ''
          const digits = phone.replace(/\D/g, '')
          if (digits.startsWith('250')) {
            return digits.substring(3)
          } else if (digits.startsWith('0')) {
            return digits.substring(1)
          }
          return digits
        }

        const generatePhoneVariations = (phone: string): string[] => {
          if (!phone) return []
          const normalized = normalizePhone(phone)
          const variations = new Set<string>()
          variations.add(normalized)
          variations.add('0' + normalized)
          variations.add('250' + normalized)
          variations.add('+250' + normalized)
          if (normalized.length >= 9) {
            const spaced = normalized.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3')
            variations.add(spaced)
            variations.add('0' + spaced)
            variations.add('250' + spaced)
            variations.add('+250' + spaced)
          }
          return Array.from(variations)
        }

        const phoneVariations = generatePhoneVariations(user.phone)
        
        // Try each variation against all applications
        for (const phoneVariation of phoneVariations) {
          application = phoneToApplication.get(phoneVariation)
          if (application) {
            console.log(`📱 Found application for ${user.name} by phone variation: ${phoneVariation}`)
            break
          }
        }
        
        // If still no match, try normalized matching
        if (!application) {
          const userNormalized = normalizePhone(user.phone)
          for (const [appPhone, app] of phoneToApplication.entries()) {
            const appNormalized = normalizePhone(appPhone)
            if (userNormalized === appNormalized) {
              application = app
              console.log(`📱 Found application for ${user.name} by normalized phone: ${appPhone}`)
              break
            }
          }
        }
      }

      // If still no application found, try by national ID
      if (!application && user.national_id) {
        application = nationalIdToApplication.get(user.national_id)
        if (application) {
          console.log(`🆔 Found application for ${user.name} by national ID: ${user.national_id}`)
        }
      }

      // Extract location from application formData
      if (application?.formData) {
        const formLocation = getLocationFromFormData(application.formData)
        if (formLocation.province || formLocation.district || formLocation.sector) {
          console.log(`📍 Extracted location for ${user.name} from application:`, formLocation)
          return formLocation
        }
      }

      // Fallback to DCC profile location
      if (user.dccProfile?.location) {
        const profileLocation = user.dccProfile.location
        // Try to parse location string (format: "District, Province" or "Sector, District, Province")
        const parts = profileLocation.split(',').map(p => p.trim())
        if (parts.length >= 2) {
          const location = {
            district: parts[0],
            province: parts[1],
            sector: parts[2] || undefined
          }
          console.log(`📍 Extracted location for ${user.name} from DCC profile:`, location)
          return location
        }
      }

      console.log(`❌ No location data found for ${user.name}`)
      return {}
    }

    // Transform data for response, including location information
    const transformedUsers = dccUsers.map(user => {
      const location = getLocationFromUser(user)

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        avatar: user.avatar,
        isActive: user.isActive,
        role: user.userRole?.role?.name || 'DCC',
        roleDescription: user.userRole?.role?.description,
        roleAssignedAt: user.userRole?.assignedAt,
        roleActive: user.userRole?.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        // Location information from application formData
        province: location.province,
        district: location.district,
        sector: location.sector,
        // Include DCC profile data if available
        dccProfile: user.dccProfile ? {
          id: user.dccProfile.id,
          level: user.dccProfile.level,
          rating: user.dccProfile.rating,
          totalSales: user.dccProfile.totalSales,
          monthlySales: user.dccProfile.monthlySales,
          productsAvailable: user.dccProfile.productsAvailable,
          status: user.dccProfile.status,
          location: user.dccProfile.location,
          specialties: user.dccProfile.specialties
        } : null
      }
    })

    return NextResponse.json({
      success: true,
      data: transformedUsers,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      message: `Found ${total} DCC users`
    })
  } catch (error) {
    console.error("❌ Error fetching DCC users:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch DCC users", error: error.message },
      { status: 500 }
    )
  }
} 