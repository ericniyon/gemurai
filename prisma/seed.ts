import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create comprehensive interview criteria based on application form
  const interviewCriteria = [
    {
      name: "Personal Background & Vulnerability Assessment",
      description: "Evaluation of personal circumstances, vulnerability factors, and household situation",
      maxScore: 10,
      weight: 1.0
    },
    {
      name: "Education & Academic Background",
      description: "Assessment of educational qualifications, field of study, and academic achievements",
      maxScore: 10,
      weight: 1.0
    },
    {
      name: "Technical Skills & Digital Literacy",
      description: "Evaluation of computer skills, digital literacy, and familiarity with mobile applications",
      maxScore: 10,
      weight: 1.2
    },
    {
      name: "Work Experience & Professional Background",
      description: "Assessment of previous work experience, roles, and professional achievements",
      maxScore: 10,
      weight: 1.1
    },
    {
      name: "Healthcare Knowledge & Experience",
      description: "Evaluation of healthcare background, medical knowledge, and relevant experience",
      maxScore: 10,
      weight: 1.3
    },
    {
      name: "Communication Skills & Languages",
      description: "Assessment of verbal and written communication abilities, language proficiency",
      maxScore: 10,
      weight: 1.0
    },
    {
      name: "Community Engagement & Leadership",
      description: "Evaluation of community involvement, leadership experience, and social connections",
      maxScore: 10,
      weight: 1.1
    },
    {
      name: "Motivation & Commitment",
      description: "Assessment of motivation to join Gemurai, personal goals, and commitment level",
      maxScore: 10,
      weight: 1.2
    },
    {
      name: "Problem-Solving & Adaptability",
      description: "Evaluation of analytical thinking, problem-solving abilities, and adaptability to change",
      maxScore: 10,
      weight: 1.1
    },
    {
      name: "Availability & Flexibility",
      description: "Assessment of time availability, flexibility, and willingness to work various schedules",
      maxScore: 10,
      weight: 1.0
    },
    {
      name: "Cultural Sensitivity & Empathy",
      description: "Evaluation of cultural awareness, empathy, and ability to work with diverse populations",
      maxScore: 10,
      weight: 1.1
    },
    {
      name: "Digital Access & Technology Readiness",
      description: "Assessment of access to digital devices, internet connectivity, and technology readiness",
      maxScore: 10,
      weight: 1.0
    }
  ]

  console.log('📝 Creating interview criteria...')
  for (const criteria of interviewCriteria) {
    // Check if criteria already exists
    const existingCriteria = await prisma.interviewCriteria.findFirst({
      where: { name: criteria.name }
    })

    if (!existingCriteria) {
      await prisma.interviewCriteria.create({
        data: criteria
      })
      console.log(`✅ Created criteria: ${criteria.name}`)
    } else {
      // Update existing criteria to ensure they have the latest information
      await prisma.interviewCriteria.update({
        where: { id: existingCriteria.id },
        data: criteria
      })
      console.log(`🔄 Updated criteria: ${criteria.name}`)
    }
  }

  console.log('✅ Interview criteria created/updated successfully')

  // Create some sample interviewers (if they don't exist)
  const interviewers = [
    {
      email: "interviewer1@djyh.rw",
      name: "John Interviewer"
    },
    {
      email: "interviewer2@djyh.rw", 
      name: "Jane Evaluator"
    }
  ]

  console.log('👥 Creating sample interviewers...')
  for (const interviewer of interviewers) {
    const existingUser = await prisma.user.findUnique({
      where: { email: interviewer.email }
    })

    if (!existingUser) {
      const newUser = await prisma.user.create({
        data: {
          email: interviewer.email,
          name: interviewer.name,
          password: "hashed_password_here" // In real app, this would be properly hashed
        }
      })
      console.log(`✅ Created interviewer: ${interviewer.name}`)
      
      // Assign ADMIN role to the interviewer
      const adminRole = await prisma.role.findFirst({
        where: { name: "ADMIN" }
      })
      
      if (adminRole) {
        await prisma.userRoleAssignment.create({
          data: {
            userId: newUser.id,
            roleId: adminRole.id,
            isActive: true
          }
        })
        console.log(`✅ Assigned ADMIN role to ${interviewer.name}`)
      }
    } else {
      console.log(`⏭️ Interviewer already exists: ${interviewer.name}`)
      
      // Check if they have role assignment
      const roleAssignment = await prisma.userRoleAssignment.findUnique({
        where: { userId: existingUser.id }
      })
      
      if (!roleAssignment) {
        const adminRole = await prisma.role.findFirst({
          where: { name: "ADMIN" }
        })
        
        if (adminRole) {
          await prisma.userRoleAssignment.create({
            data: {
              userId: existingUser.id,
              roleId: adminRole.id,
              isActive: true
            }
          })
          console.log(`✅ Assigned ADMIN role to existing interviewer: ${interviewer.name}`)
        }
      }
    }
  }

  console.log('✅ Sample interviewers created successfully')
  console.log('🎉 Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 