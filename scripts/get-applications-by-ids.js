const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const applicationIds = [
  'APP-1751702775384-f1ryycq',
  'APP-1752221523584-wntvwk0',
  'APP-1751557119269-cl9yqqa',
  'APP-1751523786852-frkrsvb',
  'APP-1752123815120-15gsdwr',
  'APP-1752083655990-4f50mc4',
  'APP-1752215785856-vx7k6ms',
  'APP-1751628995648-lud8fwd',
  'APP-1751867089196-wf3afwg',
  'APP-1751975116602-xkxetpj',
  'APP-1751682705451-odk9ljp',
  'APP-1752126571003-4fqm3jo',
  'APP-1752253067865-yy537mj',
  'APP-1751878611917-m2qpc3u'
]

async function getApplicationsByIds() {
  try {
    console.log('🔍 Fetching applications with the following IDs:')
    applicationIds.forEach(id => console.log(`  - ${id}`))
    console.log()

    const applications = await prisma.application.findMany({
      where: {
        id: {
          in: applicationIds
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        evaluations: {
          include: {
            evaluator: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        interviews: {
          include: {
            interviewer: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        dccProfile: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`✅ Found ${applications.length} applications:`)
    console.log()

    applications.forEach((app, index) => {
      console.log(`${index + 1}. Application ID: ${app.id}`)
      console.log(`   Status: ${app.status}`)
      console.log(`   Phone: ${app.phone}`)
      console.log(`   Email: ${app.email || 'N/A'}`)
      console.log(`   Created: ${app.createdAt}`)
      console.log(`   Updated: ${app.updatedAt}`)
      console.log(`   Current Step: ${app.currentStep}`)
      console.log(`   DCC Created: ${app.dccCreated}`)
      console.log(`   Notes: ${app.notes || 'N/A'}`)
      
      if (app.user) {
        console.log(`   User: ${app.user.name} (${app.user.email})`)
      } else {
        console.log(`   User: Not linked`)
      }
      
      console.log(`   Evaluations: ${app.evaluations.length}`)
      console.log(`   Interviews: ${app.interviews.length}`)
      
      if (app.dccProfile) {
        console.log(`   DCC Profile: Level ${app.dccProfile.level}, Rating ${app.dccProfile.rating}`)
      }
      
      // Show form data summary
      if (app.formData) {
        const formData = app.formData
        console.log(`   Form Data Summary:`)
        
        // Extract key information from formData
        if (formData.personalInfo) {
          console.log(`     - Personal Info: ${formData.personalInfo.name || 'N/A'}`)
        }
        if (formData.businessInfo) {
          console.log(`     - Business: ${formData.businessInfo.businessName || 'N/A'}`)
        }
        if (formData.q1) console.log(`     - Q1: ${formData.q1}`)
        if (formData.q2) console.log(`     - Q2: ${formData.q2}`)
        if (formData.q7) console.log(`     - Q7: ${formData.q7}`)
        if (formData.q8) console.log(`     - Q8: ${formData.q8}`)
        if (formData.q9) console.log(`     - Q9: ${formData.q9}`)
        if (formData.q10) console.log(`     - Q10: ${formData.q10}`)
        if (formData.q11) console.log(`     - Q11: ${formData.q11}`)
        if (formData.q15) console.log(`     - Q15: ${formData.q15}`)
        if (formData.q17) console.log(`     - Q17: ${formData.q17}`)
        if (formData.q19) console.log(`     - Q19: ${formData.q19}`)
        if (formData.q20) console.log(`     - Q20: ${formData.q20}`)
      }
      
      console.log()
    })

    // Show summary
    const foundIds = applications.map(app => app.id)
    const notFoundIds = applicationIds.filter(id => !foundIds.includes(id))
    
    if (notFoundIds.length > 0) {
      console.log('❌ Applications NOT found:')
      notFoundIds.forEach(id => console.log(`  - ${id}`))
      console.log()
    }

    console.log('📊 Summary:')
    console.log(`  - Requested: ${applicationIds.length}`)
    console.log(`  - Found: ${applications.length}`)
    console.log(`  - Not Found: ${notFoundIds.length}`)

    return applications

  } catch (error) {
    console.error('❌ Error fetching applications:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
if (require.main === module) {
  getApplicationsByIds()
    .then(() => {
      console.log('✅ Script completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Script failed:', error)
      process.exit(1)
    })
}

module.exports = { getApplicationsByIds } 