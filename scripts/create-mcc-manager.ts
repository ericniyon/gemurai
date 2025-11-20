import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

interface CreateMCCManagerOptions {
  email?: string
  name?: string
  phone?: string
  password?: string
  mccId?: string
  mccName?: string
  mccLocation?: string
  mccCode?: string
}

async function createMCCManager(options: CreateMCCManagerOptions = {}) {
  try {
    console.log('🔄 Creating MCC Manager user...')

    const {
      email = 'mcc.manager@gemura.rw',
      name = 'MCC Manager',
      phone = '+250780000000',
      password = 'Pass123',
      mccId,
      mccName = 'Milk Collection Center',
      mccLocation = 'Kigali',
      mccCode,
    } = options

    // Check if MCC_MANAGER role exists, if not create it
    let mccManagerRole = await prisma.role.findUnique({
      where: { name: 'MCC_MANAGER' }
    })

    if (!mccManagerRole) {
      console.log('📝 Creating MCC_MANAGER role...')
      mccManagerRole = await prisma.role.create({
        data: {
          name: 'MCC_MANAGER',
          description: 'MCC Manager - Administrator for a Milk Collection Center',
          isSystem: true,
          isActive: true
        }
      })
      console.log('✅ MCC_MANAGER role created:', mccManagerRole.id)
    } else {
      console.log('✅ MCC_MANAGER role already exists:', mccManagerRole.id)
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      console.log('⚠️ User already exists:', existingUser.id)
      
      // Check if role is assigned
      const existingRoleAssignment = await prisma.userRoleAssignment.findFirst({
        where: { 
          userId: existingUser.id,
          role: {
            name: 'MCC_MANAGER'
          }
        },
        include: {
          role: true
        }
      })

      if (!existingRoleAssignment) {
        console.log('📝 Assigning MCC_MANAGER role to existing user...')
        await prisma.userRoleAssignment.create({
          data: {
            userId: existingUser.id,
            roleId: mccManagerRole.id,
            isActive: true,
            assignedAt: new Date()
          }
        })
        console.log('✅ MCC_MANAGER role assigned to existing user')
      } else {
        console.log('✅ MCC_MANAGER role already assigned to user')
      }

      // Check if user is linked to an MCC
      let targetMccId = mccId || existingUser.mccId
      
      if (!targetMccId) {
        // Find or create an MCC
        let mcc = await prisma.mccs.findFirst({
          where: { isActive: true }
        })

        if (!mcc) {
          console.log('📝 Creating MCC...')
          const mccCodeToUse = mccCode || `MCC-${Date.now().toString(36).toUpperCase()}`
          mcc = await prisma.mccs.create({
            data: {
              name: mccName,
              code: mccCodeToUse,
              location: mccLocation,
              isActive: true
            }
          })
          console.log('✅ MCC created:', mcc.id)
        } else {
          console.log('✅ Using existing MCC:', mcc.id)
        }

        targetMccId = mcc.id
      }

      // Update user with MCC ID
      if (existingUser.mccId !== targetMccId) {
        console.log('📝 Linking user to MCC...')
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { mccId: targetMccId }
        })
        console.log('✅ User linked to MCC')
      }

      // Update MCC with manager
      const mcc = await prisma.mccs.findUnique({
        where: { id: targetMccId }
      })

      if (mcc && mcc.managerUserId !== existingUser.id) {
        console.log('📝 Setting user as MCC manager...')
        await prisma.mccs.update({
          where: { id: targetMccId },
          data: { managerUserId: existingUser.id }
        })
        console.log('✅ User set as MCC manager')
      }

      console.log('\n🎉 MCC Manager User already exists and is properly configured!')
      console.log('📧 Email:', email)
      console.log('🔑 Password:', password)
      console.log('👤 User ID:', existingUser.id)
      console.log('🏢 MCC ID:', targetMccId)
      return {
        user: existingUser,
        mccId: targetMccId
      }
    }

    // Find or create an MCC
    let targetMccId = mccId
    let mcc = null

    if (targetMccId) {
      mcc = await prisma.mccs.findUnique({
        where: { id: targetMccId }
      })
      if (!mcc) {
        console.log('⚠️ Specified MCC not found, creating new one...')
        targetMccId = null
      }
    }

    if (!targetMccId) {
      // Find an existing MCC without a manager
      mcc = await prisma.mccs.findFirst({
        where: { 
          isActive: true,
          managerUserId: null
        }
      })

      if (!mcc) {
        console.log('📝 Creating new MCC...')
        const mccCodeToUse = mccCode || `MCC-${Date.now().toString(36).toUpperCase()}`
        mcc = await prisma.mccs.create({
          data: {
            name: mccName,
            code: mccCodeToUse,
            location: mccLocation,
            isActive: true
          }
        })
        console.log('✅ MCC created:', mcc.id)
      } else {
        console.log('✅ Using existing MCC without manager:', mcc.id)
      }
      targetMccId = mcc.id
    }

    // Create the MCC Manager user
    const hashedPassword = await bcrypt.hash(password, 12)
    
    const mccManagerUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name: name,
        password: hashedPassword,
        phone: phone,
        mccId: targetMccId,
        isActive: true
      }
    })

    console.log('✅ MCC Manager user created:', mccManagerUser.id)

    // Assign MCC_MANAGER role to the user
    const userRoleAssignment = await prisma.userRoleAssignment.create({
      data: {
        userId: mccManagerUser.id,
        roleId: mccManagerRole.id,
        isActive: true,
        assignedAt: new Date()
      }
    })

    console.log('✅ MCC_MANAGER role assigned to user:', userRoleAssignment.id)

    // Set user as manager of the MCC
    await prisma.mccs.update({
      where: { id: targetMccId },
      data: { managerUserId: mccManagerUser.id }
    })

    console.log('✅ User set as MCC manager')

    console.log('\n🎉 MCC Manager User created successfully!')
    console.log('📧 Email:', email)
    console.log('🔑 Password:', password)
    console.log('👤 User ID:', mccManagerUser.id)
    console.log('🏢 MCC ID:', targetMccId)
    console.log('🏢 MCC Name:', mcc?.name)
    console.log('🏢 MCC Code:', mcc?.code)

    return {
      user: mccManagerUser,
      mccId: targetMccId,
      mcc: mcc
    }

  } catch (error) {
    console.error('❌ Error creating MCC Manager user:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
if (require.main === module) {
  createMCCManager()
    .then(() => {
      console.log('\n✅ Script completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error)
      process.exit(1)
    })
}

export { createMCCManager }

