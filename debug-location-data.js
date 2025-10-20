const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function debugLocationData() {
  try {
    console.log('🔍 Debugging location data extraction...\n')

    // Get a few DCC users with their applications
    const dccUsers = await prisma.user.findMany({
      where: {
        userRole: {
          role: {
            name: "DCC"
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        applications: {
          select: {
            formData: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      take: 3
    })

    console.log(`📊 Found ${dccUsers.length} DCC users with applications\n`)

    dccUsers.forEach((user, index) => {
      console.log(`${index + 1}. User: ${user.name} (${user.email})`)
      
      if (user.applications.length > 0) {
        const application = user.applications[0]
        const formData = application.formData
        
        console.log(`   📅 Application created: ${application.createdAt}`)
        console.log(`   📋 FormData structure:`)
        console.log(`   ${JSON.stringify(formData, null, 2)}`)
        
        // Test current location extraction
        const getLocationFromFormData = (formData) => {
          if (!formData) return {}
          if (typeof formData === 'string') {
            try { formData = JSON.parse(formData) } catch { return {} }
          }

          const location = { province: undefined, district: undefined, sector: undefined }

          // Direct field access
          const directFields = {
            province: [formData.province, formData.Province, formData.PROVINCE],
            district: [formData.district, formData.District, formData.DISTRICT],
            sector: [formData.sector, formData.Sector, formData.SECTOR, formData.q13, formData.q_sector]
          }

          for (const [key, values] of Object.entries(directFields)) {
            for (const value of values) {
              if (typeof value === 'string' && value.trim()) {
                location[key] = value.trim()
                break
              }
            }
          }

          // Nested object access
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
            if (!location[key]) {
              for (const value of values) {
                if (typeof value === 'string' && value.trim()) {
                  location[key] = value.trim()
                  break
                }
              }
            }
          }

          return location
        }

        const extractedLocation = getLocationFromFormData(formData)
        console.log(`   📍 Extracted location:`, extractedLocation)
        
        // Check for any location-related fields
        console.log(`   🔍 Location-related fields found:`)
        const locationFields = []
        const searchForLocationFields = (obj, path = '') => {
          if (obj && typeof obj === 'object') {
            for (const [key, value] of Object.entries(obj)) {
              const currentPath = path ? `${path}.${key}` : key
              if (typeof value === 'string' && value.trim()) {
                if (/province|district|sector|location|address/i.test(key)) {
                  locationFields.push(`${currentPath}: "${value}"`)
                }
              } else if (value && typeof value === 'object') {
                searchForLocationFields(value, currentPath)
              }
            }
          }
        }
        
        searchForLocationFields(formData)
        if (locationFields.length > 0) {
          locationFields.forEach(field => console.log(`      ${field}`))
        } else {
          console.log(`      No location fields found`)
        }
      } else {
        console.log(`   ❌ No applications found`)
      }
      console.log('')
    })

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugLocationData()
