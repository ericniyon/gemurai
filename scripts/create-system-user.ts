import { prisma } from "../lib/prisma"

async function createSystemUser() {
  try {
    // Check if system user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: "system@djyh.rw" }
    })

    if (existingUser) {
      console.log("System user already exists:", existingUser.id)
      return existingUser.id
    }

    // Create system user
    const systemUser = await prisma.user.create({
      data: {
        email: "system@djyh.rw",
        name: "AI System",
        password: "system_password_hash", // This won't be used for login
        isActive: true
      }
    })

    console.log("Created system user:", systemUser.id)
    return systemUser.id
  } catch (error) {
    console.error("Error creating system user:", error)
    throw error
  }
}

// Run the script
createSystemUser()
  .then(() => {
    console.log("System user setup complete")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Failed to setup system user:", error)
    process.exit(1)
  }) 