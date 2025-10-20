import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createMultipleDCCUsers() {
  try {
    console.log('🔄 Creating multiple DCC users...')

    // Check if DCC role exists, if not create it
    let dccRole = await prisma.role.findUnique({
      where: { name: 'DCC' }
    })

    if (!dccRole) {
      console.log('📝 Creating DCC role...')
      dccRole = await prisma.role.create({
        data: {
          name: 'DCC',
          description: 'Digital Community Champion',
          isSystem: true,
          isActive: true
        }
      })
      console.log('✅ DCC role created:', dccRole.id)
    } else {
      console.log('✅ DCC role already exists:', dccRole.id)
    }

    // DCC users to create
    const dccUsers = [
      {
        email: 'dcc1@djyh.rw',
        name: 'DCC User 1',
        phone: '+250700000001',
        password: 'Login@123'
      },
      {
        email: 'dcc2@djyh.rw',
        name: 'DCC User 2',
        phone: '+250700000002',
        password: 'Login@123'
      },
      {
        email: 'dcc3@djyh.rw',
        name: 'DCC User 3',
        phone: '+250700000003',
        password: 'Login@123'
      }
    ]

    for (const userData of dccUsers) {
      try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: userData.email }
        })

        if (existingUser) {
          console.log(`✅ User ${userData.email} already exists:`, existingUser.id)
          
          // Check if role is assigned
          const existingRoleAssignment = await prisma.userRoleAssignment.findUnique({
            where: { userId: existingUser.id }
          })

          if (!existingRoleAssignment) {
            console.log(`📝 Assigning DCC role to ${userData.email}...`)
            await prisma.userRoleAssignment.create({
              data: {
                userId: existingUser.id,
                roleId: dccRole.id,
                isActive: true
              }
            })
            console.log(`✅ DCC role assigned to ${userData.email}`)
          }

          // Check if wallet exists
          const existingWallet = await prisma.wallet.findUnique({
            where: { userId: existingUser.id }
          })

          if (!existingWallet) {
            console.log(`📝 Creating wallet for ${userData.email}...`)
            const wallet = await prisma.wallet.create({
              data: {
                userId: existingUser.id,
                balance: 0,
                minimumBalance: 1000,
                status: 'ACTIVE'
              }
            })
            console.log(`✅ Wallet created for ${userData.email}:`, wallet.id)
          }
        } else {
          // Create new user
          const hashedPassword = await bcrypt.hash(userData.password, 12)
          
          const newUser = await prisma.user.create({
            data: {
              email: userData.email,
              name: userData.name,
              password: hashedPassword,
              phone: userData.phone,
              isActive: true
            }
          })

          console.log(`✅ Created user ${userData.email}:`, newUser.id)

          // Assign DCC role
          await prisma.userRoleAssignment.create({
            data: {
              userId: newUser.id,
              roleId: dccRole.id,
              isActive: true
            }
          })

          console.log(`✅ DCC role assigned to ${userData.email}`)

          // Create wallet
          const wallet = await prisma.wallet.create({
            data: {
              userId: newUser.id,
              balance: 0,
              minimumBalance: 1000,
              status: 'ACTIVE'
            }
          })

          console.log(`✅ Wallet created for ${userData.email}:`, wallet.id)
        }
      } catch (error) {
        console.error(`❌ Error creating user ${userData.email}:`, error)
      }
    }

    console.log('\n🎉 Multiple DCC Users created successfully!')
    console.log('📧 Emails: dcc1@djyh.rw, dcc2@djyh.rw, dcc3@djyh.rw')
    console.log('🔑 Password: Login@123')

  } catch (error) {
    console.error('❌ Error creating multiple DCC users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
createMultipleDCCUsers() 