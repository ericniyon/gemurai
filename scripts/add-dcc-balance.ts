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

      // Add transaction and update balance
      const transaction = await prisma.transaction.create({
        data: {
          walletId: wallet.id,
          type: "DEPOSIT",
          amount: 100000, // 100,000 RWF
          status: "COMPLETED",
          description: "Initial DCC starter balance"
        }
      })

      // Update wallet balance
      await prisma.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: wallet.balance + 100000
        }
      })

      console.log(`Added 100,000 RWF to wallet of DCC user: ${user.email}`)
    }

    console.log("Successfully added starter balance to all DCC users")
  } catch (error) {
    console.error("Error adding DCC starter balance:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 