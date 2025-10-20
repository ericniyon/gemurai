import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createDCCApplication() {
  try {
    console.log('🔄 Creating DCC application...')

    // Find the DCC user
    const dccUser = await prisma.user.findUnique({
      where: { email: 'dcc@djyh.rw' }
    })

    if (!dccUser) {
      console.log('❌ DCC user not found. Please run create-dcc-user script first.')
      return
    }

    console.log('✅ DCC user found:', dccUser.id)

    // Check if application already exists
    const existingApplication = await prisma.application.findFirst({
      where: { userId: dccUser.id }
    })

    if (existingApplication) {
      console.log('✅ DCC application already exists:', existingApplication.id)
      console.log('📊 Application status:', existingApplication.status)
      return
    }

    // Create a sample application
    const application = await prisma.application.create({
      data: {
        id: `APP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: dccUser.id,
        phone: '+250700000100',
        email: 'dcc@djyh.rw',
        status: 'SUBMITTED',
        formData: {
          firstName: 'DCC',
          lastName: 'User',
          email: 'dcc@djyh.rw',
          phone: '+250700000100',
          dateOfBirth: '1990-01-01',
          gender: 'Other',
          nationality: 'Rwandan',
          province: 'Kigali',
          district: 'Kigali City',
          sector: 'Kigali',
          cell: 'Kigali',
          village: 'Kigali',
          education: 'Bachelor',
          occupation: 'Digital Community Champion',
          experience: '5 years',
          motivation: 'I want to help my community through digital innovation',
          skills: ['Digital Marketing', 'Community Management', 'Social Media'],
          languages: ['Kinyarwanda', 'English', 'French'],
          availability: 'Full-time',
          references: [
            {
              name: 'John Doe',
              relationship: 'Former Employer',
              phone: '+250700000001',
              email: 'john@example.com'
            }
          ]
        }
      }
    })

    console.log('✅ DCC application created successfully!')
    console.log('📋 Application ID:', application.id)
    console.log('📊 Status:', application.status)
    console.log('👤 User ID:', application.userId)
    console.log('📅 Created:', application.createdAt)

  } catch (error) {
    console.error('❌ Error creating DCC application:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createDCCApplication() 