import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()
import bcrypt from "bcryptjs"

async function main() {
  console.log("🌱 Creating admin users...")

  try {
    // Ensure SUPER_ADMIN role exists
    let superAdminRole = await prisma.role.findUnique({
      where: { name: "SUPER_ADMIN" }
    })

    if (!superAdminRole) {
      console.log("Creating SUPER_ADMIN role...")
      superAdminRole = await prisma.role.create({
        data: {
          name: "SUPER_ADMIN",
          description: "Super Administrator with full system access",
          isActive: true,
          isSystem: true
        }
      })
      console.log("✅ SUPER_ADMIN role created")
    }

    // Ensure ADMIN role exists
    let adminRole = await prisma.role.findUnique({
      where: { name: "ADMIN" }
    })

    if (!adminRole) {
      console.log("Creating ADMIN role...")
      adminRole = await prisma.role.create({
        data: {
          name: "ADMIN",
          description: "Administrator with limited permissions",
          isActive: true,
          isSystem: true
        }
      })
      console.log("✅ ADMIN role created")
    }

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

    console.log("✅ SUPER_ADMIN user created/updated:")
    console.log("   Email: admin@harvestplus.rw")
    console.log("   Password: admin123")

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

    console.log("✅ ADMIN user created/updated:")
    console.log("   Email: admin2@harvestplus.rw")
    console.log("   Password: admin123")

    console.log("\n📝 Admin Credentials:")
    console.log("====================")
    console.log("SUPER_ADMIN:")
    console.log("  Email: admin@harvestplus.rw")
    console.log("  Password: admin123")
    console.log("\nADMIN:")
    console.log("  Email: admin2@harvestplus.rw")
    console.log("  Password: admin123")

  } catch (error) {
    console.error("❌ Error creating admin users:", error)
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
