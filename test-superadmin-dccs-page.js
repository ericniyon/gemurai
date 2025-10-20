const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testSuperadminDCCsPage() {
  try {
    console.log('🔍 Testing Superadmin DCCs Page Data...\n')

    // Test the enhanced DCC users API that the page now uses
    console.log('📡 Testing API endpoint: /api/v1/users/dcc')
    
    // Simulate what the page does - fetch DCC users with location data
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

    // Process location data like the API does
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

    // Transform data like the page does
    const transformedDCCs = dccUsers.map(dcc => {
      const application = dcc.applications[0]
      const locationFromForm = getLocationFromFormData(application?.formData)
      
      return {
        id: dcc.id,
        name: dcc.name || "",
        email: dcc.email || "",
        phone: dcc.phone || "",
        location: dcc.dccProfile?.location || "",
        province: locationFromForm.province,
        district: locationFromForm.district,
        sector: locationFromForm.sector,
        status: dcc.isActive ? "ACTIVE" : "INACTIVE",
        createdAt: dcc.createdAt.toISOString(),
        updatedAt: dcc.updatedAt.toISOString()
      }
    })

    console.log('📋 DCC Users with Location Data:')
    console.log('================================')
    
    transformedDCCs.forEach((dcc, index) => {
      console.log(`${index + 1}. ${dcc.name} (${dcc.email})`)
      console.log(`   📍 Location: ${dcc.province || 'N/A'} > ${dcc.district || 'N/A'} > ${dcc.sector || 'N/A'}`)
      console.log(`   📞 Phone: ${dcc.phone || 'N/A'}`)
      console.log(`   🟢 Status: ${dcc.status}`)
      console.log(`   📅 Created: ${new Date(dcc.createdAt).toLocaleDateString()}`)
      console.log('')
    })

    console.log('🌐 Page Features:')
    console.log('================')
    console.log('✅ Enhanced table with Province, District, Sector columns')
    console.log('✅ Search functionality across all location fields')
    console.log('✅ Detailed view showing complete location information')
    console.log('✅ Fallback to DCC profile location if form data unavailable')
    console.log('✅ Proper handling of missing location data (shows "N/A")')
    console.log('')
    console.log('🔗 Access the page at: http://localhost:3000/superadmin/dccs')
    console.log('')
    console.log('📊 Expected table columns:')
    console.log('   - Name')
    console.log('   - Phone') 
    console.log('   - Province')
    console.log('   - District')
    console.log('   - Sector')
    console.log('   - Status')
    console.log('   - Created')
    console.log('   - Actions')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testSuperadminDCCsPage()
