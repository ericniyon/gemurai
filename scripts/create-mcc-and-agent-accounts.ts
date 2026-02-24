import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🔐 Creating MCC Manager and Agent accounts...\n')

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash('Login@123', 12)

    // Get or create necessary role records
    const mccManagerRole = await prisma.role.upsert({
      where: { name: 'MCC_MANAGER' },
      update: {},
      create: {
        name: 'MCC_MANAGER',
        description: 'MCC Manager role - manages milk collection center',
        isActive: true,
        isSystem: true
      }
    })

    const agentRole = await prisma.role.upsert({
      where: { name: 'AGENT' },
      update: {},
      create: {
        name: 'AGENT',
        description: 'Agent role - collects milk from farmers',
        isActive: true,
        isSystem: true
      }
    })

    // Get an existing MCC or create one
    let mcc = await prisma.mccs.findFirst({
      where: { isActive: true }
    })

    if (!mcc) {
      mcc = await prisma.mccs.create({
        data: {
          code: 'MCC-UMAK',
          name: 'Umak MCC',
          location: 'Kigali',
          region: 'Kigali',
          isActive: true,
          contactInfo: {
            phone: '+250788000001',
            email: 'umak@gemurai.rw'
          },
          settings: {
            defaultPrice: 350,
            collectionFee: 20
          },
          gpsLatitude: -1.9403,
          gpsLongitude: 29.8739,
          updatedAt: new Date()
        }
      })
      console.log('✅ Created MCC: Umak MCC')
    }

    // Create MCC Manager account
    const mccManager = await prisma.user.upsert({
      where: { email: 'amon.munyaneza@gmail.com' },
      update: {
        name: 'Amon Munyaneza',
        password: hashedPassword,
        isActive: true,
        mccId: mcc.id
      },
      create: {
        email: 'amon.munyaneza@gmail.com',
        name: 'Amon Munyaneza',
        password: hashedPassword,
        phone: '+250788000002',
        isActive: true,
        mccId: mcc.id,
        district: 'Kigali',
        gender: 'Male'
      }
    })

    // Assign MCC_MANAGER role
    await prisma.userRoleAssignment.upsert({
      where: { userId: mccManager.id },
      update: {
        roleId: mccManagerRole.id,
        isActive: true
      },
      create: {
        userId: mccManager.id,
        roleId: mccManagerRole.id,
        isActive: true
      }
    })

    console.log('✅ MCC Manager account created:')
    console.log('   Name: Amon Munyaneza')
    console.log('   Email: amon.munyaneza@gmail.com')
    console.log('   Password: Login@123')
    console.log('   Role: MCC_MANAGER')
    console.log('   MCC: ' + mcc.name)

    // Create Agent account
    const agent = await prisma.user.upsert({
      where: { email: 'agent@gmail.com' },
      update: {
        name: 'Agent',
        password: hashedPassword,
        isActive: true,
        mccId: mcc.id
      },
      create: {
        email: 'agent@gmail.com',
        name: 'Agent',
        password: hashedPassword,
        phone: '+250788000003',
        isActive: true,
        mccId: mcc.id,
        district: 'Kigali',
        gender: 'Male'
      }
    })

    // Assign AGENT role
    await prisma.userRoleAssignment.upsert({
      where: { userId: agent.id },
      update: {
        roleId: agentRole.id,
        isActive: true
      },
      create: {
        userId: agent.id,
        roleId: agentRole.id,
        isActive: true
      }
    })

    console.log('\n✅ Agent account created:')
    console.log('   Name: Agent')
    console.log('   Email: agent@gmail.com')
    console.log('   Password: Login@123')
    console.log('   Role: AGENT')
    console.log('   MCC: ' + mcc.name)

    console.log('\n🎉 All accounts created successfully!')
    console.log('\n📝 Login URLs:')
    console.log('   MCC Manager: http://localhost:3000/en/login')
    console.log('   Agent: http://localhost:3000/en/dashboard/agent')

  } catch (error) {
    console.error('❌ Error creating accounts:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
