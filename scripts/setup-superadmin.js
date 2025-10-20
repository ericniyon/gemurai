const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const readline = require('readline')

const prisma = new PrismaClient()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer)
    })
  })
}

async function setupSuperAdmin() {
  try {
    console.log('🔐 Setting up Super Admin...')
    
    // Find existing admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@ihuzo.rw' },
      include: {
        userRole: {
          include: {
            role: true
          }
        }
      }
    })
    
    if (!adminUser) {
      console.log('❌ Admin user not found. Creating new admin user...')
      
      // Create new admin user
      const newPassword = await askQuestion('Enter password for new admin user: ')
      const hashedPassword = await bcrypt.hash(newPassword, 10)
      
      const newAdmin = await prisma.user.create({
        data: {
          email: 'admin@ihuzo.rw',
          name: 'Super Admin',
          password: hashedPassword,
          isActive: true
        }
      })
      
      console.log('✅ Created new admin user:', newAdmin.email)
      
      // Assign SUPER_ADMIN role
      const superAdminRole = await prisma.role.findUnique({
        where: { name: 'SUPER_ADMIN' }
      })
      
      if (superAdminRole) {
        await prisma.userRoleAssignment.create({
          data: {
            userId: newAdmin.id,
            roleId: superAdminRole.id,
            assignedBy: null, // System assignment
            assignedAt: new Date()
          }
        })
        console.log('✅ Assigned SUPER_ADMIN role to new admin user')
      }
      
    } else {
      console.log('👤 Found existing admin user:', adminUser.email)
      console.log('📝 Current role:', adminUser.userRole?.role?.name || 'No role assigned')
      
      // Check if already SUPER_ADMIN
      if (adminUser.userRole?.role?.name === 'SUPER_ADMIN') {
        console.log('✅ User is already SUPER_ADMIN')
      } else {
        console.log('🔄 Promoting user to SUPER_ADMIN...')
        
        // Get SUPER_ADMIN role
        const superAdminRole = await prisma.role.findUnique({
          where: { name: 'SUPER_ADMIN' }
        })
        
        if (superAdminRole) {
          // Delete existing role assignment
          if (adminUser.userRole) {
            await prisma.userRoleAssignment.delete({
              where: { id: adminUser.userRole.id }
            })
          }
          
          // Create new SUPER_ADMIN assignment
          await prisma.userRoleAssignment.create({
            data: {
              userId: adminUser.id,
              roleId: superAdminRole.id,
              assignedBy: null, // System assignment
              assignedAt: new Date()
            }
          })
          
          console.log('✅ Promoted user to SUPER_ADMIN')
        }
      }
      
      // Ask if they want to reset password
      const resetPassword = await askQuestion('Do you want to reset the password? (y/n): ')
      
      if (resetPassword.toLowerCase() === 'y' || resetPassword.toLowerCase() === 'yes') {
        const newPassword = await askQuestion('Enter new password: ')
        const hashedPassword = await bcrypt.hash(newPassword, 10)
        
        await prisma.user.update({
          where: { id: adminUser.id },
          data: { password: hashedPassword }
        })
        
        console.log('✅ Password updated successfully')
      }
    }
    
    // Display login credentials
    console.log('\n🎉 Super Admin setup complete!')
    console.log('📧 Email: admin@ihuzo.rw')
    console.log('🔑 Password: [The password you just set]')
    console.log('🌐 Login at: https://app.ictchamber.rw/login')
    
    // Verify the setup
    const finalUser = await prisma.user.findUnique({
      where: { email: 'admin@ihuzo.rw' },
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
    
    if (finalUser) {
      console.log('\n📊 User Details:')
      console.log('- Email:', finalUser.email)
      console.log('- Name:', finalUser.name)
      console.log('- Role:', finalUser.userRole?.role?.name || 'No role')
      console.log('- Permissions:', finalUser.userRole?.role?.rolePermissions?.length || 0)
    }
    
  } catch (error) {
    console.error('❌ Error setting up super admin:', error)
    throw error
  } finally {
    rl.close()
    await prisma.$disconnect()
  }
}

// Run the setup
setupSuperAdmin()
  .then(() => {
    console.log('✅ Setup completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  }) 