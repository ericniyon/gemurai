const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'DCC' },
          { userRole: { isActive: true, role: { name: 'DCC' } } }
        ]
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        district: true,
        dccProfile: {
          select: {
            location: true,
            applicationId: true,
            application: { select: { formData: true } }
          }
        },
        applications: { take: 1, orderBy: { createdAt: 'desc' }, select: { formData: true } }
      }
    })

    for (const u of users) {
      const latestApp = u.applications?.[0]
      const appDistrict = latestApp?.formData?.district || latestApp?.formData?.q11?.district
      const profAppDistrict = u.dccProfile?.application?.formData?.district || u.dccProfile?.application?.formData?.q11?.district
      const parts = (u.dccProfile?.location || '').split(',').map(s => s.trim()).filter(Boolean)
      const parsedFromLocation = parts.length >= 2 ? parts[1] : parts[0] || ''
      const chosen = u.district || profAppDistrict || appDistrict || parsedFromLocation || ''
      console.log({ id: u.id, name: u.name, district: u.district, profAppDistrict, appDistrict, profileLocation: u.dccProfile?.location, parsedFromLocation, chosen })
    }
  } catch (e) {
    console.error(e)
  } finally {
    await prisma.$disconnect()
  }
}

main()


