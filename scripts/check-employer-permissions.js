const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkEmployerPermissions() {
  try {
    console.log('🔍 Checking EMPLOYER role permissions...')
    
    const employer = await prisma.user.findUnique({
      where: { email: 'employer@Gemurai.rw' },
      include: {
        userRole: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    })

    console.log('Employer:', employer.name)
    console.log('Role:', employer.userRole?.role?.name)
    console.log('\n📋 All permissions:')
    employer.userRole?.role?.rolePermissions?.forEach(rp => {
      console.log(`• ${rp.permission.name}`)
    })

    console.log('\n🛒 Stock order permissions:')
    const stockOrderPermissions = employer.userRole?.role?.rolePermissions?.filter(rp => 
      rp.permission.name.includes('stockorder')
    )
    stockOrderPermissions?.forEach(rp => {
      console.log(`• ${rp.permission.name}`)
    })

    console.log(`\n✅ Total permissions: ${employer.userRole?.role?.rolePermissions?.length || 0}`)
    console.log(`✅ Stock order permissions: ${stockOrderPermissions?.length || 0}`)

  } catch (error) {
    console.error('❌ Error checking permissions:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkEmployerPermissions() 