const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function debugDCCsNotFound() {
  try {
    console.log('🔍 Debugging "No DCCs found" issue...\n')

    // 1. Check if there are any users with DCC role
    console.log('1. Checking users with DCC role...')
    
    // Check new role system
    const newRoleSystemDCCs = await prisma.user.findMany({
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
        userRole: {
          select: {
            role: {
              select: {
                name: true
              }
            },
            isActive: true
          }
        }
      }
    })

    console.log(`   Found ${newRoleSystemDCCs.length} DCC users in new role system`)
    if (newRoleSystemDCCs.length > 0) {
      newRoleSystemDCCs.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.email}) - Role: ${user.userRole?.role?.name}, Active: ${user.userRole?.isActive}`)
      })
    }

    // Check old role system (direct role field)
    const oldRoleSystemDCCs = await prisma.user.findMany({
      where: {
        role: "DCC"
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })

    console.log(`   Found ${oldRoleSystemDCCs.length} DCC users in old role system`)
    if (oldRoleSystemDCCs.length > 0) {
      oldRoleSystemDCCs.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`)
      })
    }

    console.log('')

    // 2. Check role system tables
    console.log('2. Checking role system tables...')
    
    const rolesTableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'roles'
      )
    `
    console.log(`   Roles table exists: ${rolesTableExists[0]?.exists}`)

    const userRoleTableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_role_assignments'
      )
    `
    console.log(`   User role assignments table exists: ${userRoleTableExists[0]?.exists}`)

    // 3. Test the API endpoints
    console.log('\n3. Testing API endpoints...')
    
    // Test /api/v1/users/dcc
    console.log('   Testing /api/v1/users/dcc...')
    try {
      const response = await fetch('http://localhost:3000/api/v1/users/dcc')
      const data = await response.json()
      console.log(`   Status: ${response.status}`)
      console.log(`   Success: ${data.success}`)
      console.log(`   Data count: ${data.data?.length || 0}`)
      if (data.message) console.log(`   Message: ${data.message}`)
    } catch (error) {
      console.log(`   Error: ${error.message}`)
    }

    // Test /api/v1/superadmin/dccs
    console.log('   Testing /api/v1/superadmin/dccs...')
    try {
      const response = await fetch('http://localhost:3000/api/v1/superadmin/dccs')
      const data = await response.json()
      console.log(`   Status: ${response.status}`)
      console.log(`   Success: ${data.success}`)
      console.log(`   DCCs count: ${data.dccs?.length || 0}`)
      if (data.message) console.log(`   Message: ${data.message}`)
    } catch (error) {
      console.log(`   Error: ${error.message}`)
    }

    // 4. Check if there are any applications
    console.log('\n4. Checking applications...')
    const applicationCount = await prisma.application.count()
    console.log(`   Total applications: ${applicationCount}`)

    const applicationsWithUsers = await prisma.application.count({
      where: {
        userId: {
          not: null
        }
      }
    })
    console.log(`   Applications with users: ${applicationsWithUsers}`)

    // 5. Check DCC profiles
    console.log('\n5. Checking DCC profiles...')
    const dccProfileCount = await prisma.dCCProfile.count()
    console.log(`   DCC profiles: ${dccProfileCount}`)

    if (dccProfileCount > 0) {
      const dccProfiles = await prisma.dCCProfile.findMany({
        select: {
          id: true,
          userId: true,
          location: true,
          user: {
            select: {
              name: true,
              email: true
            }
          }
        },
        take: 5
      })
      
      console.log('   Sample DCC profiles:')
      dccProfiles.forEach((profile, index) => {
        console.log(`   ${index + 1}. User: ${profile.user?.name} (${profile.user?.email}) - Location: ${profile.location}`)
      })
    }

    console.log('\n6. Recommendations:')
    console.log('===================')
    
    if (newRoleSystemDCCs.length === 0 && oldRoleSystemDCCs.length === 0) {
      console.log('❌ No DCC users found in either role system')
      console.log('   - Check if users have been assigned DCC role')
      console.log('   - Verify role assignments in user_role_assignments table')
      console.log('   - Check if users have role field set to "DCC"')
    } else if (newRoleSystemDCCs.length > 0) {
      console.log('✅ Found DCC users in new role system')
      console.log('   - The /api/v1/users/dcc endpoint should work')
      console.log('   - Check authentication and session issues')
    } else if (oldRoleSystemDCCs.length > 0) {
      console.log('✅ Found DCC users in old role system')
      console.log('   - The /api/v1/superadmin/dccs endpoint should work')
      console.log('   - Check if the page is using the correct API endpoint')
    }

  } catch (error) {
    console.error('❌ Error during debugging:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugDCCsNotFound()
