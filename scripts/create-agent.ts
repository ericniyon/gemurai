import { prisma } from '../lib/database'
import bcrypt from "bcryptjs"

async function main() {
  try {
    const email = "agent@Gemurai.rw"
    const password = "agent123" // You should change this in production
    const name = "Test Agent"
    const phone = "+250780000003"

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Define agent permissions
    const agentPermissions = [
      "dashboard.view",
      "applications.view",
      "applications.review",
      "profile.view",
      "profile.edit"
    ]

    // Create or update the agent user
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        phone,
        password: hashedPassword,
        role: "AGENT",
        permissions: agentPermissions,
        isActive: true
      },
      create: {
        email,
        name,
        phone,
        password: hashedPassword,
        role: "AGENT",
        permissions: agentPermissions,
        isActive: true
      }
    })

    console.log("✅ Agent user created/updated:", user.email)

    console.log("\n📝 Login Credentials:")
    console.log("Email:", email)
    console.log("Password:", password)
    
  } catch (error) {
    console.error("❌ Error creating agent user:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 