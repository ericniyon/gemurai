const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixDCCLocationsSimple() {
  try {
    console.log('🔧 Fixing DCC locations (simple approach)...\n')

    // Get DCC users and update their profiles with locations
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
        dccProfile: {
          select: {
            id: true,
            location: true
          }
        }
      }
    })

    console.log(`📊 Found ${dccUsers.length} DCC users\n`)

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
    for (const user of dccUsers) {
      // Only update if no location exists
      if (!user.dccProfile?.location) {
        const randomLocation = sampleLocations[Math.floor(Math.random() * sampleLocations.length)]
        
        try {
          // Just update the location field
          await prisma.dCCProfile.updateMany({
            where: { userId: user.id },
            data: { location: randomLocation }
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
    
    // Test the location extraction
    console.log('\n🧪 Testing location extraction...')
    const testUsers = await prisma.user.findMany({
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
        dccProfile: {
          select: {
            location: true
          }
        }
      },
      take: 3
    })

    testUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`)
      if (user.dccProfile?.location) {
        const parts = user.dccProfile.location.split(',').map(p => p.trim())
        console.log(`   📍 Location: ${user.dccProfile.location}`)
        console.log(`   📍 Parsed: District: ${parts[0]}, Province: ${parts[1]}`)
      } else {
        console.log(`   ❌ No location`)
      }
      console.log('')
    })

    console.log('🌐 Now test the page at: http://localhost:3000/superadmin/dccs')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixDCCLocationsSimple()
