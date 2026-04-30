/**
 * Creates an Agent account in the database (current schema: User + UserRoleAssignment).
 *
 * Usage:
 *   npx tsx scripts/create-agent-account.ts
 *   # Or with custom credentials (env vars):
 *   AGENT_EMAIL=you@example.com AGENT_PASSWORD=YourPassword AGENT_NAME="Your Name" AGENT_PHONE=+250788123456 npx tsx scripts/create-agent-account.ts
 */

import { prisma } from "../lib/database"
import bcrypt from "bcryptjs"

const AGENT_EMAIL = process.env.AGENT_EMAIL ?? "agent@example.com"
const AGENT_PASSWORD = process.env.AGENT_PASSWORD ?? "AgentPassword123"
const AGENT_NAME = process.env.AGENT_NAME ?? "Agent User"
const AGENT_PHONE = process.env.AGENT_PHONE ?? "+250788000099"

async function main() {
  console.log("🔐 Creating Agent account...\n")

  try {
    const hashedPassword = await bcrypt.hash(AGENT_PASSWORD, 12)

    // Find AGENT role (must exist in DB, e.g. from seed)
    const agentRole = await prisma.role.findUnique({
      where: { name: "AGENT" },
    })

    if (!agentRole) {
      console.error("❌ AGENT role not found in database. Run your roles seed first (e.g. populate-roles-permissions.js).")
      process.exit(1)
    }

    const user = await prisma.user.upsert({
      where: { email: AGENT_EMAIL.toLowerCase() },
      update: {
        name: AGENT_NAME,
        phone: AGENT_PHONE,
        password: hashedPassword,
        isActive: true,
      },
      create: {
        email: AGENT_EMAIL.toLowerCase(),
        name: AGENT_NAME,
        phone: AGENT_PHONE,
        password: hashedPassword,
        isActive: true,
      },
    })

    // Assign AGENT role (UserRoleAssignment is 1:1 per user, so upsert by userId)
    await prisma.userRoleAssignment.upsert({
      where: { userId: user.id },
      update: {
        roleId: agentRole.id,
        isActive: true,
      },
      create: {
        userId: user.id,
        roleId: agentRole.id,
        isActive: true,
      },
    })

    console.log("✅ Agent account created/updated successfully.\n")
    console.log("📝 Login credentials:")
    console.log("   Email:", AGENT_EMAIL)
    console.log("   Password:", AGENT_PASSWORD)
    console.log("   Name:", AGENT_NAME)
    console.log("   Phone:", AGENT_PHONE)
    console.log("\n   Log in at: http://localhost:3000/en/login")
  } catch (error) {
    console.error("❌ Error creating agent account:", error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
