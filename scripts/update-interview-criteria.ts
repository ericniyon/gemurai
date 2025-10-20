import { prisma } from '../lib/database'

async function main() {
  console.log('🔄 Updating interview criteria to specific 4 criteria with correct max scores...')

  // First, deactivate all existing criteria
  await prisma.interviewCriteria.updateMany({
    data: { isActive: false }
  })
  console.log('✅ Deactivated all existing criteria')

  // Define the new specific criteria with correct max scores
  const newCriteria = [
    {
      name: "A. Education and Work Experience (Amashuri n’Ubunararibonye mu Kazi)",
      description: "Assessment of educational qualifications, work experience, and professional background (Amashuri n’Ubunararibonye mu Kazi)",
      maxScore: 30,
      weight: 1.0,
      isActive: true
    },
    {
      name: "B. Socio-Economic and Vulnerability Status (Imibereho Rusange)",
      description: "Evaluation of economic status, vulnerability factors, and household circumstances",
      maxScore: 10,
      weight: 1.0,
      isActive: true
    },
    {
      name: "D. Living Environment & Community Connections (Aho Utuye n’Imibanire n’Abaturanyi)",
      description: "Evaluation of living conditions, community involvement, and social connections",
      maxScore: 10,
      weight: 1.0,
      isActive: true
    }
  ]

  // Create or update each criterion
  for (const criteria of newCriteria) {
    const existingCriteria = await prisma.interviewCriteria.findFirst({
      where: { name: criteria.name }
    })

    if (existingCriteria) {
      await prisma.interviewCriteria.update({
        where: { id: existingCriteria.id },
        data: criteria
      })
      console.log(`🔄 Updated criteria: ${criteria.name} (maxScore: ${criteria.maxScore})`)
    } else {
      await prisma.interviewCriteria.create({
        data: criteria
      })
      console.log(`✅ Created criteria: ${criteria.name} (maxScore: ${criteria.maxScore})`)
    }
  }

  // Verify the update
  const activeCriteria = await prisma.interviewCriteria.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' }
  })

  console.log('\n📋 Active Interview Criteria:')
  activeCriteria.forEach(criteria => {
    console.log(`  • ${criteria.name} (maxScore: ${criteria.maxScore})`)
  })

  console.log(`\n✅ Successfully updated interview criteria. Total active criteria: ${activeCriteria.length}`)
}

main()
  .catch((e) => {
    console.error('❌ Error updating interview criteria:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 