/*
  Lists users with DCC role (supports new role system and legacy schema).
*/
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function tableExists(tableName) {
  try {
    const result = await prisma.$queryRaw`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ${tableName})`;
    return result?.[0]?.exists || false
  } catch (err) {
    console.error(`Error checking table ${tableName}:`, err)
    return false
  }
}

async function main() {
  try {
    const [rolesTableExists, userRoleTableExists] = await Promise.all([
      tableExists('roles'),
      tableExists('user_role_assignments')
    ])

    let users = []

    if (rolesTableExists && userRoleTableExists) {
      users = await prisma.user.findMany({
        where: {
          userRole: { isActive: true, role: { name: 'DCC' } }
        },
        select: { id: true, name: true, email: true, phone: true },
        orderBy: { name: 'asc' }
      })
    } else {
      users = await prisma.user.findMany({
        where: { role: 'DCC' },
        select: { id: true, name: true, email: true, phone: true },
        orderBy: { name: 'asc' }
      })
    }

    console.log(`Total DCC users: ${users.length}`)
    for (const u of users) {
      console.log(`${u.id}\t${u.name || ''}\t${u.email || ''}\t${u.phone || ''}`)
    }
  } catch (err) {
    console.error('Failed to list DCC users:', err)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

main()


