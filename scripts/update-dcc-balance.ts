import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  try {
    // Get all DCC users
    const dccUsers = await prisma.user.findMany({
      where: {
        role: "DCC",
        isActive: true
      }
    })

    console.log(`Found ${dccUsers.length} DCC users`)

    for (const user of dccUsers) {
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

      // Update wallet balance
      await prisma.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: 230000 // Set balance to 230,000 RWF
        }
      })

      // Create transaction record
      await prisma.transaction.create({
        data: {
          walletId: wallet.id,
          type: "DEPOSIT",
          amount: 230000 - wallet.balance, // Add the difference to reach 230,000
          status: "COMPLETED",
          description: "Balance update to 230,000 RWF"
        }
      })

      console.log(`Updated wallet balance to 230,000 RWF for DCC user: ${user.email}`)
    }

    console.log("Successfully updated balance for all DCC users")
  } catch (error) {
    console.error("Error updating DCC balance:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 