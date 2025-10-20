/*
  Counts how many users have the DCC role.
  Supports both schemas:
  - New role system: roles + user_role_assignments tables
  - Legacy schema: users.role enum field
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

    let count = 0

    if (rolesTableExists && userRoleTableExists) {
      // New role system
      count = await prisma.user.count({
        where: {
          userRole: {
            isActive: true,
            role: { name: 'DCC' }
          }
        }
      })
    } else {
      // Legacy schema
      count = await prisma.user.count({ where: { role: 'DCC' } })
    }

    console.log(`DCC users: ${count}`)
  } catch (err) {
    console.error('Failed to count DCC users:', err)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

main()


