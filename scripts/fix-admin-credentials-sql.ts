import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🔧 Fixing admin credentials using SQL...")

  try {
    // Hash password
    const passwordHash = await bcrypt.hash("admin123", 10)

    // Ensure SUPER_ADMIN role exists using raw SQL
    await prisma.$executeRaw`
      INSERT INTO roles (id, name, description, "isActive", "isSystem", "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, 'SUPER_ADMIN', 'Super Administrator with full system access', true, true, NOW(), NOW())
      ON CONFLICT (name) DO NOTHING
    `

    // Ensure ADMIN role exists
    await prisma.$executeRaw`
      INSERT INTO roles (id, name, description, "isActive", "isSystem", "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, 'ADMIN', 'Administrator with limited permissions', true, true, NOW(), NOW())
      ON CONFLICT (name) DO NOTHING
    `

    console.log("✅ Roles ensured")

    // Get role IDs
    const superAdminRole = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM roles WHERE name = 'SUPER_ADMIN' LIMIT 1
    `
    const adminRole = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM roles WHERE name = 'ADMIN' LIMIT 1
    `

    if (!superAdminRole || superAdminRole.length === 0 || !adminRole || adminRole.length === 0) {
      throw new Error("Failed to create or find roles")
    }

    const superAdminRoleId = superAdminRole[0].id
    const adminRoleId = adminRole[0].id

    // Create/Update SUPER_ADMIN user using raw SQL (only essential fields)
    const superAdminUser = await prisma.$queryRaw<Array<{ id: string }>>`
      INSERT INTO users (id, email, name, password, "isActive", "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, 'admin@harvestplus.rw', 'Super Administrator', ${passwordHash}, true, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE 
      SET password = EXCLUDED.password, name = EXCLUDED.name, "isActive" = true, "updatedAt" = NOW()
      RETURNING id
    `

    if (!superAdminUser || superAdminUser.length === 0) {
      throw new Error("Failed to create SUPER_ADMIN user")
    }

    const superAdminUserId = superAdminUser[0].id

    // Assign SUPER_ADMIN role
    await prisma.$executeRaw`
      INSERT INTO user_role_assignments (id, "userId", "roleId", "assignedAt", "isActive")
      VALUES (gen_random_uuid()::text, ${superAdminUserId}, ${superAdminRoleId}, NOW(), true)
      ON CONFLICT ("userId") DO UPDATE 
      SET "roleId" = EXCLUDED."roleId", "isActive" = true
    `

    console.log("✅ SUPER_ADMIN user created/updated")

    // Create/Update ADMIN user
    const adminUser = await prisma.$queryRaw<Array<{ id: string }>>`
      INSERT INTO users (id, email, name, password, "isActive", "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, 'admin2@harvestplus.rw', 'Administrator', ${passwordHash}, true, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE 
      SET password = EXCLUDED.password, name = EXCLUDED.name, "isActive" = true, "updatedAt" = NOW()
      RETURNING id
    `

    if (!adminUser || adminUser.length === 0) {
      throw new Error("Failed to create ADMIN user")
    }

    const adminUserId = adminUser[0].id

    // Assign ADMIN role
    await prisma.$executeRaw`
      INSERT INTO user_role_assignments (id, "userId", "roleId", "assignedAt", "isActive")
      VALUES (gen_random_uuid()::text, ${adminUserId}, ${adminRoleId}, NOW(), true)
      ON CONFLICT ("userId") DO UPDATE 
      SET "roleId" = EXCLUDED."roleId", "isActive" = true
    `

    console.log("✅ ADMIN user created/updated")

    console.log("\n📝 Admin Credentials:")
    console.log("====================")
    console.log("SUPER_ADMIN:")
    console.log("  Email: admin@harvestplus.rw")
    console.log("  Password: admin123")
    console.log("\nADMIN:")
    console.log("  Email: admin2@harvestplus.rw")
    console.log("  Password: admin123")
    console.log("\n✅ Credentials are ready to use!")

  } catch (error) {
    console.error("❌ Error:", error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
