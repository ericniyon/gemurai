const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testLocationFix() {
  try {
    console.log('🔍 Testing location extraction fix...\n')

    // Get DCC users with their applications
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
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        applications: {
          select: {
            formData: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        dccProfile: {
          select: {
            location: true
          }
        }
      },
      take: 5
    })

    console.log(`📊 Found ${dccUsers.length} DCC users\n`)

    // Enhanced location extraction function
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

    const getLocationFromUser = (user, application) => {
      // First try application formData
      if (application?.formData) {
        const formLocation = getLocationFromFormData(application.formData)
        if (formLocation.province || formLocation.district || formLocation.sector) {
          return formLocation
        }
      }

      // Fallback to DCC profile location
      if (user.dccProfile?.location) {
        const profileLocation = user.dccProfile.location
        const parts = profileLocation.split(',').map(p => p.trim())
        if (parts.length >= 2) {
          return {
            district: parts[0],
            province: parts[1],
            sector: parts[2] || undefined
          }
        }
      }

      return {}
    }

    // Test the enhanced location extraction
    dccUsers.forEach((user, index) => {
      console.log(`${index + 1}. User: ${user.name} (${user.email})`)
      
      const application = user.applications[0]
      const location = getLocationFromUser(user, application)
      
      console.log(`   📍 Location extracted:`)
      console.log(`      Province: ${location.province || 'N/A'}`)
      console.log(`      District: ${location.district || 'N/A'}`)
      console.log(`      Sector: ${location.sector || 'N/A'}`)
      
      if (application) {
        console.log(`   📋 Has application: Yes (${application.createdAt})`)
        if (application.formData) {
          const formData = application.formData
          console.log(`   📋 FormData location fields:`)
          console.log(`      province: ${formData.province || 'N/A'}`)
          console.log(`      district: ${formData.district || 'N/A'}`)
          console.log(`      sector: ${formData.sector || 'N/A'}`)
        }
      } else {
        console.log(`   📋 Has application: No`)
      }
      
      if (user.dccProfile?.location) {
        console.log(`   🏢 DCC Profile location: ${user.dccProfile.location}`)
      } else {
        console.log(`   🏢 DCC Profile location: N/A`)
      }
      
      console.log('')
    })

    console.log('🌐 Testing API endpoint...')
    try {
      const response = await fetch('http://localhost:3000/api/v1/users/dcc')
      const data = await response.json()
      console.log(`   Status: ${response.status}`)
      console.log(`   Success: ${data.success}`)
      console.log(`   Data count: ${data.data?.length || 0}`)
      
      if (data.data && data.data.length > 0) {
        console.log(`   Sample DCC with location:`)
        const sampleDCC = data.data[0]
        console.log(`   Name: ${sampleDCC.name}`)
        console.log(`   Province: ${sampleDCC.province || 'N/A'}`)
        console.log(`   District: ${sampleDCC.district || 'N/A'}`)
        console.log(`   Sector: ${sampleDCC.sector || 'N/A'}`)
      }
    } catch (error) {
      console.log(`   Error: ${error.message}`)
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testLocationFix()
