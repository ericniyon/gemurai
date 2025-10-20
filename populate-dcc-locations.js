const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function populateDCCLocations() {
  try {
    console.log('🔧 Populating DCC locations...\n')

    // Get DCC users without applications
    const dccUsersWithoutApps = await prisma.user.findMany({
      where: {
        userRole: {
          role: {
            name: "DCC"
          }
        },
        applications: {
          none: {}
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        dccProfile: {
          select: {
            id: true,
            location: true
          }
        }
      }
    })

    console.log(`📊 Found ${dccUsersWithoutApps.length} DCC users without applications\n`)

    // Sample locations for Rwanda
    const sampleLocations = [
      "Kigali City, Kigali",
      "Nyarugenge, Kigali", 
      "Gasabo, Kigali",
      "Kicukiro, Kigali",
      "Huye, South",
      "Muhanga, South",
      "Ruhango, South",
      "Nyamagabe, South",
      "Nyanza, South",
      "Gisagara, South",
      "Nyaruguru, South",
      "Musanze, North",
      "Burera, North",
      "Gicumbi, North",
      "Rulindo, North",
      "Gakenke, North",
      "Rubavu, West",
      "Nyabihu, West",
      "Ngororero, West",
      "Karongi, West",
      "Rutsiro, West",
      "Nyamasheke, West",
      "Rusizi, West",
      "Kayonza, East",
      "Kirehe, East",
      "Ngoma, East",
      "Bugesera, East",
      "Gatsibo, East",
      "Nyagatare, East",
      "Rwamagana, East"
    ]

    let updated = 0
    for (const user of dccUsersWithoutApps) {
      if (!user.dccProfile?.location) {
        // Assign a random location
        const randomLocation = sampleLocations[Math.floor(Math.random() * sampleLocations.length)]
        
        try {
          // Update or create DCC profile with location
          await prisma.dCCProfile.upsert({
            where: { userId: user.id },
            update: { location: randomLocation },
            create: {
              userId: user.id,
              level: "LEVEL_C",
              rating: 0,
              totalSales: 0,
              monthlySales: 0,
              productsAvailable: 0,
              status: "ACTIVE",
              location: randomLocation,
              specialties: []
            }
          })
          
          console.log(`✅ Updated ${user.name} with location: ${randomLocation}`)
          updated++
        } catch (error) {
          console.log(`❌ Failed to update ${user.name}: ${error.message}`)
        }
      } else {
        console.log(`⏭️  ${user.name} already has location: ${user.dccProfile.location}`)
      }
    }

    console.log(`\n📊 Updated ${updated} DCC users with locations`)
    console.log('\n🌐 Now test the page at: http://localhost:3000/superadmin/dccs')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

populateDCCLocations()
