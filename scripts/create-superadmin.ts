import { prisma } from '../lib/prisma'
import bcrypt from "bcryptjs"
import { ROLE_PERMISSIONS } from '../lib/permissions'

async function main() {
  try {
    const email = "superadmin@Gemurai.rw"
    const password = "superadmin123" // You should change this in production
    const name = "Test Superadmin"
    const phone = "+250780000001"

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Get superadmin permissions
    const superadminPermissions = ROLE_PERMISSIONS.SUPER_ADMIN || []

    // Create or update the superadmin user
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        phone,
        password: hashedPassword,
        role: "SUPER_ADMIN",
        permissions: superadminPermissions,
        isActive: true
      },
      create: {
        email,
        name,
        phone,
        password: hashedPassword,
        role: "SUPER_ADMIN",
        permissions: superadminPermissions,
        isActive: true
      }
    })

    console.log("✅ Superadmin user created/updated:", user.email)

    console.log("\n📝 Login Credentials:")
    console.log("Email:", email)
    console.log("Password:", password)
    
  } catch (error) {
    console.error("❌ Error creating superadmin user:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 