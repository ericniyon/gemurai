const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function generateTestCustomer() {
  try {
    console.log('🧪 Generating test CUSTOMER user for subscription testing...\n')

    // Test customer data
    const customerData = {
      email: 'test.customer@djyh.rw',
      name: 'Test Customer',
      phone: '+250780000999',
      password: 'customer123!',
      role: 'CUSTOMER',
      permissions: [
        'dashboard.view',
        'products.view',
        'products.purchase',
        'orders.view',
        'orders.create',
        'learning.view',
        'learning.enroll',
        'jobs.view',
        'jobs.apply',
        'profile.view',
        'profile.edit'
      ]
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: customerData.email }
    })

    if (existingUser) {
      console.log('⚠️  Test customer already exists:')
      console.log(`   Email: ${existingUser.email}`)
      console.log(`   Name: ${existingUser.name}`)
      console.log(`   Role: ${existingUser.role}`)
      console.log(`   ID: ${existingUser.id}`)
      console.log('')
      console.log('✅ You can use this existing user for testing!')
      return existingUser
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(customerData.password, 10)

    // Create the test customer
    const newCustomer = await prisma.user.create({
      data: {
        email: customerData.email,
        name: customerData.name,
        phone: customerData.phone,
        password: hashedPassword,
        isActive: true
      }
    })

    // Find or create CONSUMER role
    let consumerRole = await prisma.role.findUnique({
      where: { name: 'CONSUMER' }
    })

    if (!consumerRole) {
      consumerRole = await prisma.role.create({
        data: {
          name: 'CONSUMER',
          description: 'Regular customer/consumer',
          isSystem: true,
          isActive: true
        }
      })
    }

    // Assign CONSUMER role to the user
    await prisma.userRoleAssignment.create({
      data: {
        userId: newCustomer.id,
        roleId: consumerRole.id,
        assignedBy: null, // System assignment
        assignedAt: new Date(),
        isActive: true
      }
    })

    console.log('✅ Test CUSTOMER user created successfully!')
    console.log('')
    console.log('📋 User Details:')
    console.log(`   ID: ${newCustomer.id}`)
    console.log(`   Email: ${newCustomer.email}`)
    console.log(`   Name: ${newCustomer.name}`)
    console.log(`   Phone: ${newCustomer.phone}`)
    console.log(`   Role: ${newCustomer.role}`)
    console.log(`   Password: ${customerData.password}`)
    console.log('')
    console.log('🔐 Login Credentials:')
    console.log(`   Email: ${customerData.email}`)
    console.log(`   Password: ${customerData.password}`)
    console.log('')
    console.log('🧪 Ready for subscription API testing!')

    return newCustomer

  } catch (error) {
    console.error('❌ Error creating test customer:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Also generate a test DCC user if needed
async function generateTestDCC() {
  try {
    console.log('\n🧪 Generating test DCC user for subscription testing...\n')

    const dccData = {
      email: 'test.dcc@djyh.rw',
      name: 'Test DCC',
      phone: '+250780000888',
      password: 'dcc123!',
      role: 'DCC',
      permissions: [
        'dashboard.view',
        'products.view',
        'products.purchase',
        'orders.view',
        'orders.create',
        'learning.view',
        'learning.enroll',
        'jobs.view',
        'jobs.apply',
        'finance.view',
        'finance.request',
        'profile.view',
        'profile.edit',
        'dcc.dashboard',
        'dcc.services',
        'stock.create'
      ]
    }

    // Check if DCC already exists
    const existingDCC = await prisma.user.findUnique({
      where: { email: dccData.email }
    })

    if (existingDCC) {
      console.log('⚠️  Test DCC already exists:')
      console.log(`   Email: ${existingDCC.email}`)
      console.log(`   Name: ${existingDCC.name}`)
      console.log(`   Role: ${existingDCC.role}`)
      console.log(`   ID: ${existingDCC.id}`)
      return existingDCC
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dccData.password, 10)

    // Create the test DCC
    const newDCC = await prisma.user.create({
      data: {
        email: dccData.email,
        name: dccData.name,
        phone: dccData.phone,
        password: hashedPassword,
        isActive: true
      }
    })

    // Find or create DCC role
    let dccRole = await prisma.role.findUnique({
      where: { name: 'DCC' }
    })

    if (!dccRole) {
      dccRole = await prisma.role.create({
        data: {
          name: 'DCC',
          description: 'Digital Community Champion',
          isSystem: true,
          isActive: true
        }
      })
    }

    // Assign DCC role to the user
    await prisma.userRoleAssignment.create({
      data: {
        userId: newDCC.id,
        roleId: dccRole.id,
        assignedBy: null, // System assignment
        assignedAt: new Date(),
        isActive: true
      }
    })

    console.log('✅ Test DCC user created successfully!')
    console.log('')
    console.log('📋 DCC Details:')
    console.log(`   ID: ${newDCC.id}`)
    console.log(`   Email: ${newDCC.email}`)
    console.log(`   Name: ${newDCC.name}`)
    console.log(`   Phone: ${newDCC.phone}`)
    console.log(`   Role: ${newDCC.role}`)
    console.log(`   Password: ${dccData.password}`)
    console.log('')
    console.log('🔐 Login Credentials:')
    console.log(`   Email: ${dccData.email}`)
    console.log(`   Password: ${dccData.password}`)

    return newDCC

  } catch (error) {
    console.error('❌ Error creating test DCC:', error)
    throw error
  }
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting test user generation...\n')
    
    const customer = await generateTestCustomer()
    const dcc = await generateTestDCC()
    
    console.log('\n🎉 Test users ready for subscription API testing!')
    console.log('')
    console.log('📝 Next steps:')
    console.log('1. Login as the CUSTOMER user to get authentication token')
    console.log('2. Use the token to test subscription endpoints')
    console.log('3. Subscribe the CUSTOMER to the DCC')
    console.log('4. Test viewing subscriptions and unsubscribing')
    console.log('')
    console.log('🔗 Test the subscription API with:')
    console.log(`   CUSTOMER: ${customer.email} / customer123!`)
    console.log(`   DCC: ${dcc.email} / dcc123!`)

  } catch (error) {
    console.error('❌ Error in main function:', error)
    process.exit(1)
  }
}

// Run the script
main()
