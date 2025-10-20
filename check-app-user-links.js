const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    const [totalApps, joinCount, distinctUsers] = await Promise.all([
      prisma.application.count(),
      prisma.$queryRawUnsafe(`SELECT COUNT(*)::int AS c FROM applications a JOIN users u ON u.id = a."userId"`),
      prisma.$queryRawUnsafe(`SELECT COUNT(DISTINCT a."userId")::int AS c FROM applications a JOIN users u ON u.id = a."userId"`),
    ])

    console.log({
      totalApplications: totalApps,
      applicationsWithExistingUserId: joinCount?.[0]?.c || 0,
      distinctUsersWithApplications: distinctUsers?.[0]?.c || 0,
    })

    const sample = await prisma.$queryRawUnsafe(`
      SELECT a.id as application_id, a."userId" as application_userId, u.id as user_id, u.email, u.name, a."createdAt"
      FROM applications a
      JOIN users u ON u.id = a."userId"
      ORDER BY a."createdAt" DESC
      LIMIT 10
    `)
    console.log('sampleJoins', sample)
  } catch (e) {
    console.error('Error:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()


