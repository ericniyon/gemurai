import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  try {
    // Update all EMPLOYER users with wallet permissions
    const users = await prisma.user.findMany({
      where: {
        role: "EMPLOYER",
        isActive: true
      }
    })

    console.log(`Found ${users.length} EMPLOYER users`)

    for (const user of users) {
      // Add wallet permissions
      const updatedPermissions = [...new Set([
        ...user.permissions,
        'wallet.view',
        'wallet.withdraw',
        'wallet.manage'
      ])]

      // Update user permissions
      await prisma.user.update({
        where: { id: user.id },
        data: {
          permissions: updatedPermissions
        }
      })

      // Get or create wallet
      let wallet = await prisma.wallet.findUnique({
        where: { userId: user.id }
      })

      if (!wallet) {
        wallet = await prisma.wallet.create({
          data: {
            userId: user.id,
            balance: 0,
            minimumBalance: 1000,
            status: "ACTIVE"
          }
        })
      }

      console.log(`Updated permissions and ensured wallet exists for EMPLOYER user: ${user.email}`)
    }

    console.log("Successfully updated all EMPLOYER users with wallet permissions")
  } catch (error) {
    console.error("Error updating EMPLOYER wallet permissions:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 