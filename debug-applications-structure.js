const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function debugApplicationsStructure() {
  try {
    console.log('🔍 Debugging applications structure...\n')

    // Check total applications
    const totalApplications = await prisma.application.count()
    console.log(`📊 Total applications in database: ${totalApplications}`)

    // Check applications with users
    const applicationsWithUsers = await prisma.application.count({
      where: {
        userId: {
          not: null
        }
      }
    })
    console.log(`📊 Applications with users: ${applicationsWithUsers}`)

    // Get some sample applications
    const sampleApplications = await prisma.application.findMany({
      select: {
        id: true,
        userId: true,
        phone: true,
        email: true,
        formData: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
            userRole: {
              select: {
                role: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    console.log(`\n📋 Sample applications:`)
    sampleApplications.forEach((app, index) => {
      console.log(`${index + 1}. Application ID: ${app.id}`)
      console.log(`   User ID: ${app.userId || 'NULL'}`)
      console.log(`   User Name: ${app.user?.name || 'N/A'}`)
      console.log(`   User Role: ${app.user?.userRole?.role?.name || 'N/A'}`)
      console.log(`   Phone: ${app.phone}`)
      console.log(`   Email: ${app.email}`)
      console.log(`   Created: ${app.createdAt}`)
      
      if (app.formData) {
        console.log(`   📋 FormData sample:`)
        const formData = app.formData
        console.log(`   ${JSON.stringify(formData, null, 2).substring(0, 500)}...`)
        
        // Check for location fields
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
          console.log(`   📍 Location fields found:`)
          locationFields.forEach(field => console.log(`      ${field}`))
        } else {
          console.log(`   ❌ No location fields found`)
        }
      }
      console.log('')
    })

    // Check if there are any DCC users with applications
    const dccUsersWithApps = await prisma.user.findMany({
      where: {
        userRole: {
          role: {
            name: "DCC"
          }
        },
        applications: {
          some: {}
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        applications: {
          select: {
            id: true,
            formData: true
          },
          take: 1
        }
      },
      take: 3
    })

    console.log(`\n📊 DCC users with applications: ${dccUsersWithApps.length}`)
    if (dccUsersWithApps.length > 0) {
      dccUsersWithApps.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email})`)
        console.log(`   Applications: ${user.applications.length}`)
        if (user.applications.length > 0) {
          const app = user.applications[0]
          console.log(`   FormData: ${JSON.stringify(app.formData, null, 2).substring(0, 300)}...`)
        }
        console.log('')
      })
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugApplicationsStructure()
