import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Helper function to generate random number in range
const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
const randomFloat = (min: number, max: number) => Math.random() * (max - min) + min

// Helper to generate random date
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

async function main() {
  console.log('🌱 Starting dummy data seeding...')

  try {
    // 1. Create Roles and Permissions
    console.log('\n📋 Creating roles and permissions...')
    const roles = ['SUPER_ADMIN', 'ADMIN', 'DCC', 'EMPLOYER', 'CONSUMER', 'AGENT', 'MCC_MANAGER', 'FIELD_AGENT']
    const roleMap: Record<string, string> = {}

    for (const roleName of roles) {
      const role = await prisma.role.upsert({
        where: { name: roleName },
        update: {},
        create: {
          name: roleName,
          description: `${roleName} role`,
          isActive: true,
          isSystem: true
        }
      })
      roleMap[roleName] = role.id
      console.log(`✅ Role created/updated: ${roleName}`)
    }

    // 2. Create MCCs (Milk Collection Centers)
    console.log('\n🏭 Creating MCCs...')
    const mccs = []
    const mccNames = [
      { name: 'Kigali Central MCC', location: 'Kigali', code: 'MCC001' },
      { name: 'Northern Region MCC', location: 'Musanze', code: 'MCC002' },
      { name: 'Southern Region MCC', location: 'Huye', code: 'MCC003' },
      { name: 'Eastern Region MCC', location: 'Rwamagana', code: 'MCC004' },
      { name: 'Western Region MCC', location: 'Karongi', code: 'MCC005' }
    ]

    for (const mccData of mccNames) {
      const mcc = await prisma.mccs.upsert({
        where: { code: mccData.code },
        update: {},
        create: {
          code: mccData.code,
          name: mccData.name,
          location: mccData.location,
          region: mccData.location,
          isActive: true,
          contactInfo: {
            phone: `+250${random(780000000, 789999999)}`,
            email: `${mccData.code.toLowerCase()}@gemurai.rw`
          },
          settings: {
            defaultPrice: randomFloat(300, 500),
            collectionFee: randomFloat(10, 50)
          },
          gpsLatitude: randomFloat(-2.0, -1.5),
          gpsLongitude: randomFloat(29.5, 30.5),
          updatedAt: new Date()
        }
      })
      mccs.push(mcc)
      console.log(`✅ MCC created: ${mccData.name}`)
    }

    // 3. Create Users (MCC Managers, Agents, DCCs, etc.)
    console.log('\n👥 Creating users...')
    const users = []
    const userTypes = [
      { name: 'MCC Manager 1', email: 'mccmanager1@gemurai.rw', role: 'MCC_MANAGER', mccIndex: 0 },
      { name: 'MCC Manager 2', email: 'mccmanager2@gemurai.rw', role: 'MCC_MANAGER', mccIndex: 1 },
      { name: 'Field Agent 1', email: 'agent1@gemurai.rw', role: 'FIELD_AGENT', mccIndex: 0 },
      { name: 'Field Agent 2', email: 'agent2@gemurai.rw', role: 'FIELD_AGENT', mccIndex: 1 },
      { name: 'DCC Owner 1', email: 'dcc1@gemurai.rw', role: 'DCC', mccIndex: null },
      { name: 'DCC Owner 2', email: 'dcc2@gemurai.rw', role: 'DCC', mccIndex: null },
      { name: 'Admin User', email: 'admin@gemurai.rw', role: 'ADMIN', mccIndex: null },
      { name: 'Consumer 1', email: 'consumer1@gemurai.rw', role: 'CONSUMER', mccIndex: null },
      { name: 'Consumer 2', email: 'consumer2@gemurai.rw', role: 'CONSUMER', mccIndex: null }
    ]

    const hashedPassword = await bcrypt.hash('password123', 12)

    for (const userData of userTypes) {
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: {
          email: userData.email,
          name: userData.name,
          password: hashedPassword,
          phone: `+250${random(780000000, 789999999)}`,
          isActive: true,
          mccId: userData.mccIndex !== null ? mccs[userData.mccIndex].id : null,
          district: 'Kigali',
          gender: random(0, 1) === 0 ? 'Male' : 'Female'
        }
      })

      // Assign role
      if (roleMap[userData.role]) {
        await prisma.userRoleAssignment.upsert({
          where: { userId: user.id },
          update: {},
          create: {
            userId: user.id,
            roleId: roleMap[userData.role],
            isActive: true
          }
        })
      }

      // If MCC Manager, link to MCC
      if (userData.role === 'MCC_MANAGER' && userData.mccIndex !== null) {
        await prisma.mccs.update({
          where: { id: mccs[userData.mccIndex].id },
          data: { managerUserId: user.id }
        })
      }

      users.push(user)
      console.log(`✅ User created: ${userData.name} (${userData.role})`)
    }

    // 4. Create Farmers
    console.log('\n👨‍🌾 Creating farmers...')
    const farmers = []
    const farmerNames = [
      'Jean Baptiste', 'Marie Claire', 'Paul Mukamana', 'Anastasie Uwimana',
      'François Nkurunziza', 'Thérèse Mukamana', 'Emmanuel Ndayisaba',
      'Claudine Nyirahabimana', 'Pierre Nkurikiye', 'Jeanne d\'Arc Uwineza',
      'Alexis Nsengimana', 'Véronique Mukamana', 'Innocent Nkurunziza',
      'Angélique Uwimana', 'Fidèle Ndayisaba'
    ]

    for (let i = 0; i < farmerNames.length; i++) {
      try {
        const farmer = await prisma.farmers.create({
          data: {
            mccId: mccs[i % mccs.length].id,
            name: farmerNames[i],
            phone: `+250${random(780000000, 789999999)}`,
            location: ['Kigali', 'Musanze', 'Huye', 'Rwamagana', 'Karongi'][i % 5]
          }
        })
        farmers.push(farmer)
        console.log(`✅ Farmer created: ${farmerNames[i]}`)
      } catch (error: any) {
        console.log(`⚠️  Error creating farmer ${farmerNames[i]}: ${error.message}`)
        // Try with minimal fields
        try {
          const farmer = await prisma.$queryRaw`
            INSERT INTO farmers (id, "mccId", name, phone, location, "createdAt", "updatedAt")
            VALUES (gen_random_uuid()::text, ${mccs[i % mccs.length].id}, ${farmerNames[i]}, ${`+250${random(780000000, 789999999)}`}, ${['Kigali', 'Musanze', 'Huye', 'Rwamagana', 'Karongi'][i % 5]}, NOW(), NOW())
            RETURNING *
          `
          farmers.push(farmer as any)
          console.log(`✅ Farmer created (raw): ${farmerNames[i]}`)
        } catch (rawError) {
          console.log(`❌ Failed to create farmer ${farmerNames[i]}`)
        }
      }
    }

    // 5. Create Products
    console.log('\n📦 Creating products...')
    const products = []
    const productData = [
      { name: 'Fresh Milk', category: 'Dairy', price: 800, stock: 1000, mccProductType: 'RAW_MILK' },
      { name: 'Pasteurized Milk', category: 'Dairy', price: 1000, stock: 500, mccProductType: 'PROCESSED_MILK' },
      { name: 'Yogurt', category: 'Dairy', price: 1200, stock: 300, mccProductType: 'MILK_PRODUCTS' },
      { name: 'Cheese', category: 'Dairy', price: 5000, stock: 100, mccProductType: 'MILK_PRODUCTS' },
      { name: 'Maize Seeds', category: 'Seeds', price: 2000, stock: 500, mccProductType: null },
      { name: 'Bean Seeds', category: 'Seeds', price: 2500, stock: 400, mccProductType: null },
      { name: 'Fertilizer NPK', category: 'Fertilizer', price: 15000, stock: 200, mccProductType: null },
      { name: 'Animal Feed', category: 'Feed', price: 3000, stock: 300, mccProductType: null }
    ]

    // Get a seller user (use first DCC user)
    const sellerUser = users.find(u => u.email === 'dcc1@gemurai.rw') || users[0]

    for (const prod of productData) {
      const product = await prisma.products.create({
        data: {
          id: `prod_${Date.now()}_${random(1000, 9999)}`,
          name: prod.name,
          description: `High quality ${prod.name.toLowerCase()}`,
          price: prod.price,
          stock: prod.stock,
          category: prod.category,
          sellerId: sellerUser.id,
          isActive: true,
          status: 'active',
          unitOfMeasure: prod.mccProductType ? 'Liters' : 'Units',
          mccProductType: prod.mccProductType as any,
          inventoryType: prod.mccProductType ? 'MILK' : 'GENERAL',
          updatedAt: new Date()
        }
      })
      products.push(product)
      console.log(`✅ Product created: ${prod.name}`)
    }

    // 6. Create Applications
    console.log('\n📝 Creating applications...')
    const applications = []
    const applicationData = [
      { phone: '+250788123456', email: 'applicant1@example.com', name: 'Applicant One' },
      { phone: '+250788234567', email: 'applicant2@example.com', name: 'Applicant Two' },
      { phone: '+250788345678', email: 'applicant3@example.com', name: 'Applicant Three' },
      { phone: '+250788456789', email: 'applicant4@example.com', name: 'Applicant Four' },
      { phone: '+250788567890', email: 'applicant5@example.com', name: 'Applicant Five' }
    ]

    for (const appData of applicationData) {
      const application = await prisma.application.create({
        data: {
          id: `app_${Date.now()}_${random(1000, 9999)}`,
          phone: appData.phone,
          email: appData.email,
          nationalId: `${random(100000000, 999999999)}`,
          status: ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'PENDING_DOCUMENTS'][random(0, 3)] as any,
          formData: {
            personalInfo: {
              name: appData.name,
              email: appData.email,
              phone: appData.phone,
              nationalId: `${random(100000000, 999999999)}`
            },
            education: {
              level: ['Primary', 'Secondary', 'University'][random(0, 2)],
              field: 'General'
            }
          },
          currentStep: random(1, 5)
        }
      })
      applications.push(application)
      console.log(`✅ Application created: ${appData.name}`)
    }

    // 7. Create DCC Profiles (for approved applications)
    console.log('\n🏪 Creating DCC profiles...')
    const dccUsers = users.filter(u => u.email.includes('dcc'))
    for (let i = 0; i < Math.min(2, applications.length, dccUsers.length); i++) {
      if (applications[i] && dccUsers[i]) {
        const dccProfile = await prisma.dCCProfile.upsert({
          where: { userId: dccUsers[i].id },
          update: {},
          create: {
            userId: dccUsers[i].id,
            applicationId: applications[i].id,
            level: ['LEVEL_A', 'LEVEL_B', 'LEVEL_C'][random(0, 2)] as any,
            rating: randomFloat(3.5, 5.0),
            totalSales: `RWF ${random(100000, 1000000)}`,
            monthlySales: `RWF ${random(50000, 200000)}`,
            productsAvailable: random(10, 50),
            status: 'active',
            location: ['Kigali', 'Musanze', 'Huye'][i % 3],
            specialties: ['Dairy Products', 'Fresh Produce', 'General Store'],
            performance: {
              salesGrowth: randomFloat(10, 50),
              customerSatisfaction: randomFloat(4.0, 5.0),
              orderFulfillment: randomFloat(85, 100)
            },
            recentActivity: {
              lastOrder: new Date().toISOString(),
              ordersThisMonth: random(5, 30)
            }
          }
        })

        // Create wallet for DCC if it doesn't exist
        await prisma.dCCWallet.upsert({
          where: { dccProfileId: dccProfile.id },
          update: {},
          create: {
            dccProfileId: dccProfile.id,
            balance: randomFloat(10000, 500000),
            minimumBalance: 5000,
            status: 'active'
          }
        })

        console.log(`✅ DCC Profile created/updated for: ${dccUsers[i].name}`)
      }
    }

    // 8. Create MCC Periods
    console.log('\n📅 Creating MCC periods...')
    for (const mcc of mccs) {
      const period = await prisma.mcc_periods.create({
        data: {
          id: `period_${mcc.id}_${Date.now()}`,
          mccId: mcc.id,
          periodNumber: 1,
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          endDate: new Date(),
          status: 'ACTIVE',
          totalFarmers: random(10, 50),
          totalMilkCollected: randomFloat(1000, 10000),
          totalAmount: randomFloat(500000, 5000000),
          updatedAt: new Date()
        }
      })
      console.log(`✅ MCC Period created for: ${mcc.name}`)
    }

    // 9. Create Milk Collections (skipped due to schema mismatch - run migrations first)
    console.log('\n🥛 Creating milk collections...')
    console.log('⚠️  Skipping milk collections - database schema may need migrations')
    console.log('   Run: npx prisma migrate dev or npx prisma db push to sync schema')

    // 10. Create Stock Orders
    console.log('\n📦 Creating stock orders...')
    const dccProfiles = await prisma.dCCProfile.findMany()
    for (let i = 0; i < 5; i++) {
      if (dccProfiles[i]) {
        const dccUser = users.find(u => u.id === dccProfiles[i].userId)
        if (dccUser) {
          const orderProducts = products.slice(0, random(2, 4))
          let totalAmount = 0

          const stockOrder = await prisma.stockOrder.create({
            data: {
              dccId: dccUser.id,
              totalAmount: 0, // Will update after products
              status: ['PENDING', 'APPROVED', 'COMPLETED'][random(0, 2)],
              priority: ['low', 'normal', 'high'][random(0, 2)],
              requestDate: randomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date())
            }
          })

          for (const product of orderProducts) {
            const quantity = random(10, 100)
            const price = product.price
            totalAmount += quantity * price

            await prisma.stockOrderProduct.create({
              data: {
                stockOrderId: stockOrder.id,
                productId: product.id,
                quantity,
                currentStock: random(0, 50),
                requestedStock: quantity,
                price
              }
            })
          }

          await prisma.stockOrder.update({
            where: { id: stockOrder.id },
            data: { totalAmount }
          })

          console.log(`✅ Stock order created: ${stockOrder.id}`)
        }
      }
    }

    // 11. Create Brands
    console.log('\n🏷️ Creating brands...')
    const brandNames = ['Premium Dairy', 'Farm Fresh', 'Organic Valley', 'Local Harvest', 'Quality Goods']
    for (const brandName of brandNames) {
      await prisma.brand.upsert({
        where: { name: brandName },
        update: {},
        create: {
          name: brandName,
          description: `High quality ${brandName} products`,
          isActive: true
        }
      })
      console.log(`✅ Brand created: ${brandName}`)
    }

    // 12. Create Warehouses
    console.log('\n🏭 Creating warehouses...')
    const warehouseData = [
      { name: 'Main Warehouse Kigali', code: 'WH001', city: 'Kigali' },
      { name: 'Northern Warehouse', code: 'WH002', city: 'Musanze' },
      { name: 'Southern Warehouse', code: 'WH003', city: 'Huye' }
    ]

    for (const wh of warehouseData) {
      await prisma.warehouse.upsert({
        where: { code: wh.code },
        update: {},
        create: {
          name: wh.name,
          code: wh.code,
          description: `Main warehouse in ${wh.city}`,
          city: wh.city,
          country: 'Rwanda',
          isActive: true,
          isMain: wh.code === 'WH001',
          gpsLatitude: randomFloat(-2.0, -1.5),
          gpsLongitude: randomFloat(29.5, 30.5)
        }
      })
      console.log(`✅ Warehouse created: ${wh.name}`)
    }
    
    // Get final counts for summary
    const finalDccProfiles = await prisma.dCCProfile.findMany()
    const finalMccPeriods = await prisma.mcc_periods.findMany()
    
    console.log('\n✨ Dummy data seeding completed successfully!')
    console.log('\n📊 Summary:')
    console.log(`   - ${mccs.length} MCCs`)
    console.log(`   - ${users.length} Users`)
    console.log(`   - ${farmers.length} Farmers`)
    console.log(`   - ${products.length} Products`)
    console.log(`   - ${applications.length} Applications`)
    console.log(`   - ${finalDccProfiles.length} DCC Profiles`)
    console.log(`   - ${finalMccPeriods.length} MCC Periods`)
    console.log(`   - 5 Stock Orders`)
    console.log(`   - 5 Brands`)
    console.log(`   - 3 Warehouses`)

  } catch (error) {
    console.error('❌ Error seeding dummy data:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Fatal error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
