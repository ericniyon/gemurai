const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testDCCUsersWithLocation() {
  try {
    console.log('🔍 Testing DCC users with location data...\n')

    // Test the enhanced location extraction function
    const getLocationFromFormData = (formData) => {
      if (!formData) return {}
      if (typeof formData === 'string') {
        try { formData = JSON.parse(formData) } catch {
          return {}
        }
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

    // Test with sample form data
    const testFormData = {
      q11: {
        province: "Kigali",
        district: "Nyarugenge",
        sector: "Nyamirambo"
      },
      province: "Northern Province",
      district: "Musanze",
      sector: "Kinigi"
    }

    console.log('📝 Testing location extraction with sample data:')
    console.log('Sample formData:', JSON.stringify(testFormData, null, 2))
    
    const extractedLocation = getLocationFromFormData(testFormData)
    console.log('✅ Extracted location:', extractedLocation)
    console.log('')

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
        applications: {
          select: {
            id: true,
            formData: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 1 // Get latest application
        }
      },
      take: 5 // Limit to 5 users for testing
    })

    console.log(`📊 Found ${dccUsers.length} DCC users with applications\n`)

    // Process each user and extract location
    dccUsers.forEach((user, index) => {
      console.log(`${index + 1}. User: ${user.name} (${user.email})`)
      
      if (user.applications.length > 0) {
        const application = user.applications[0]
        const location = getLocationFromFormData(application.formData)
        
        console.log(`   📍 Location from application:`)
        console.log(`      Province: ${location.province || 'Not found'}`)
        console.log(`      District: ${location.district || 'Not found'}`)
        console.log(`      Sector: ${location.sector || 'Not found'}`)
        console.log(`   📅 Application created: ${application.createdAt}`)
      } else {
        console.log(`   ❌ No applications found`)
      }
      console.log('')
    })

    // Test API endpoint
    console.log('🌐 Testing API endpoint...')
    console.log('You can test the API with:')
    console.log('curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/v1/users/dcc')
    console.log('')
    console.log('Expected response format:')
    console.log(JSON.stringify({
      success: true,
      data: [{
        id: "user_id",
        name: "User Name",
        email: "user@example.com",
        province: "Kigali",
        district: "Nyarugenge", 
        sector: "Nyamirambo",
        dccProfile: { /* DCC profile data */ }
      }],
      meta: { /* pagination info */ }
    }, null, 2))

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDCCUsersWithLocation()
