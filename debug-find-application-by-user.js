const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const userId = process.argv[2]
  if (!userId) {
    console.error('Usage: node debug-find-application-by-user.js <userId>')
    process.exit(1)
  }
  try {
    const apps = await prisma.application.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, createdAt: true, formData: true }
    })
    console.log(`Applications for user ${userId}: ${apps.length}`)
    for (const a of apps) {
      const fd = a.formData || {}
      const district = fd.district || fd?.q11?.district || fd?.address?.district || fd?.location?.district || ''
      console.log({ id: a.id, createdAt: a.createdAt, district, sampleKeys: Object.keys(fd).slice(0, 10) })
    }
  } catch (e) {
    console.error('Error:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()


