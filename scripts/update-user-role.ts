import { prisma } from '../lib/database'
import bcrypt from "bcryptjs"

async function main() {
  try {
    let user = await prisma.user.findUnique({
      where: { email: "dcc@Gemurai.rw" }
    })

    if (!user) {
      // Create the user if they don't exist
      const hashedPassword = await bcrypt.hash("dcc123", 10) // Default password
      user = await prisma.user.create({
        data: {
          email: "dcc@Gemurai.rw",
          name: "DCC User",
          phone: "+250788999888", // Different phone number
          password: hashedPassword,
          role: "CONSUMER", // Start as consumer
          permissions: [
            "dashboard.view",
            "products.view",
            "products.purchase",
            "orders.view",
            "orders.create",
            "learning.view",
            "learning.enroll",
            "jobs.view",
            "jobs.apply",
            "profile.view",
            "profile.edit",
          ],
        }
      })
      console.log("Created new user:", user.email)
    }

    if (user.role === "DCC") {
      console.log("User is already a DCC")
      return
    }

    // Update user role and permissions
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        role: "DCC",
        permissions: [
          "dashboard.view",
          "products.view",
          "products.purchase",
          "orders.view",
          "orders.create",
          "learning.view",
          "learning.enroll",
          "jobs.view",
          "jobs.apply",
          "finance.view",
          "finance.request",
          "profile.view",
          "profile.edit",
          "dcc.dashboard",
          "dcc.services",
        ],
      }
    })

    console.log("Updated user role to DCC:", updatedUser.email)

    // Find the latest application for this user
    const application = await prisma.application.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    if (application) {
      // Update application status and create DCC profile
      await prisma.$transaction([
        prisma.application.update({
          where: { id: application.id },
          data: {
            status: "APPROVED",
            dccCreated: true,
          }
        }),
        prisma.dCCProfile.create({
          data: {
            userId: user.id,
            level: "LEVEL_A",
            status: "ACTIVE",
            location: application.formData?.location || "Unknown",
            businessName: application.formData?.businessName || user.name,
            businessType: application.formData?.businessType || "INDIVIDUAL",
            businessRegistrationNumber: application.formData?.businessRegistrationNumber,
            tinNumber: application.formData?.tinNumber,
            bankName: application.formData?.bankName,
            bankAccountNumber: application.formData?.bankAccountNumber,
            bankAccountName: application.formData?.bankAccountName,
          }
        })
      ])
      console.log("Created DCC profile and updated application")
    }

  } catch (error) {
    console.error("Error:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 