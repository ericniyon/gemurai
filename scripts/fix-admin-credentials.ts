import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🔧 Fixing admin credentials...")

  try {
    // Ensure roles exist
    const superAdminRole = await prisma.role.upsert({
      where: { name: "SUPER_ADMIN" },
      update: {},
      create: {
        name: "SUPER_ADMIN",
        description: "Super Administrator with full system access",
        isActive: true,
        isSystem: true
      }
    })

    const adminRole = await prisma.role.upsert({
      where: { name: "ADMIN" },
      update: {},
      create: {
        name: "ADMIN",
        description: "Administrator with limited permissions",
        isActive: true,
        isSystem: true
      }
    })

    console.log("✅ Roles ensured")

    // Create/Update SUPER_ADMIN user
    const superAdminPassword = await bcrypt.hash("admin123", 10)
    const superAdminUser = await prisma.user.upsert({
      where: { email: "admin@harvestplus.rw" },
      update: {
        password: superAdminPassword,
        name: "Super Administrator",
        isActive: true
      },
      create: {
        email: "admin@harvestplus.rw",
        name: "Super Administrator",
        password: superAdminPassword,
        phone: "+250788000001",
        isActive: true
      }
    })

    // Assign SUPER_ADMIN role
    await prisma.userRoleAssignment.upsert({
      where: { userId: superAdminUser.id },
      update: {
        roleId: superAdminRole.id,
        isActive: true
      },
      create: {
        userId: superAdminUser.id,
        roleId: superAdminRole.id,
        assignedAt: new Date(),
        isActive: true
      }
    })

    console.log("✅ SUPER_ADMIN user created/updated")

    // Create/Update ADMIN user
    const adminPassword = await bcrypt.hash("admin123", 10)
    const adminUser = await prisma.user.upsert({
      where: { email: "admin2@harvestplus.rw" },
      update: {
        password: adminPassword,
        name: "Administrator",
        isActive: true
      },
      create: {
        email: "admin2@harvestplus.rw",
        name: "Administrator",
        password: adminPassword,
        phone: "+250788000002",
        isActive: true
      }
    })

    // Assign ADMIN role
    await prisma.userRoleAssignment.upsert({
      where: { userId: adminUser.id },
      update: {
        roleId: adminRole.id,
        isActive: true
      },
      create: {
        userId: adminUser.id,
        roleId: adminRole.id,
        assignedAt: new Date(),
        isActive: true
      }
    })

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
