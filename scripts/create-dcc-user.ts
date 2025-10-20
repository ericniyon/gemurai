import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createDCCUser() {
  try {
    console.log('🔄 Creating DCC user...')

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

    // Check if DCC user already exists
    const existingDccUser = await prisma.user.findUnique({
      where: { email: 'dcc@djyh.rw' }
    })

    if (existingDccUser) {
      console.log('✅ DCC user already exists:', existingDccUser.id)
      
      // Check if role is assigned
      const existingRoleAssignment = await prisma.userRoleAssignment.findUnique({
        where: { userId: existingDccUser.id }
      })

      if (!existingRoleAssignment) {
        console.log('📝 Assigning DCC role to existing user...')
        await prisma.userRoleAssignment.create({
          data: {
            userId: existingDccUser.id,
            roleId: dccRole.id,
            isActive: true
          }
        })
        console.log('✅ DCC role assigned to existing user')
      } else {
        console.log('✅ DCC role already assigned to user')
      }

      // Check if wallet exists
      const existingWallet = await prisma.wallet.findUnique({
        where: { userId: existingDccUser.id }
      })

      if (!existingWallet) {
        console.log('📝 Creating wallet for existing user...')
        const wallet = await prisma.wallet.create({
          data: {
            userId: existingDccUser.id,
            balance: 0,
            minimumBalance: 1000,
            status: 'ACTIVE'
          }
        })
        console.log('✅ Wallet created for existing user:', wallet.id)
      } else {
        console.log('✅ Wallet already exists for user:', existingWallet.id)
      }

      console.log('\n🎉 DCC User already exists and is properly configured!')
      console.log('📧 Email: dcc@djyh.rw')
      console.log('🔑 Password: Login@123')
      console.log('👤 User ID:', existingDccUser.id)
      return
    }

    // Create the DCC user
    const hashedPassword = await bcrypt.hash('Login@123', 12)
    
    const dccUser = await prisma.user.create({
      data: {
        email: 'dcc@djyh.rw',
        name: 'DCC User',
        password: hashedPassword,
        phone: '+250700000100',
        isActive: true
      }
    })

    console.log('✅ DCC user created:', dccUser.id)

    // Assign DCC role to the user
    const userRoleAssignment = await prisma.userRoleAssignment.create({
      data: {
        userId: dccUser.id,
        roleId: dccRole.id,
        isActive: true
      }
    })

    console.log('✅ DCC role assigned to user:', userRoleAssignment.id)

    // Create a wallet for the DCC user
    const wallet = await prisma.wallet.create({
      data: {
        userId: dccUser.id,
        balance: 0,
        minimumBalance: 1000,
        status: 'ACTIVE'
      }
    })

    console.log('✅ Wallet created for DCC user:', wallet.id)

    console.log('\n🎉 DCC User created successfully!')
    console.log('📧 Email: dcc@djyh.rw')
    console.log('🔑 Password: Login@123')
    console.log('👤 User ID:', dccUser.id)
    console.log('💰 Wallet ID:', wallet.id)

  } catch (error) {
    console.error('❌ Error creating DCC user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
createDCCUser() 