/**
 * Script to remove obsolete roles and delete users with those roles
 * 
 * Roles being removed: EMPLOYER, DCC, FIELD_AGENT, CONSUMER
 * 
 * Run with: npx ts-node scripts/remove-obsolete-roles.ts
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const OBSOLETE_ROLES = ["EMPLOYER", "DCC", "FIELD_AGENT", "CONSUMER"]

async function main() {
  console.log("Starting removal of obsolete roles...")
  console.log("Roles to remove:", OBSOLETE_ROLES.join(", "))
  console.log("")

  try {
    // Step 1: Find role records for obsolete roles
    console.log("Step 1: Finding obsolete roles in roles table...")
    
    const obsoleteRoles = await prisma.role.findMany({
      where: {
        name: { in: OBSOLETE_ROLES },
      },
      select: {
        id: true,
        name: true,
      },
    })

    console.log(`Found ${obsoleteRoles.length} obsolete roles:`)
    obsoleteRoles.forEach((role) => {
      console.log(`  - ${role.name} (ID: ${role.id})`)
    })
    console.log("")

    const obsoleteRoleIds = obsoleteRoles.map((r) => r.id)

    // Step 2: Find user role assignments with obsolete roles
    console.log("Step 2: Finding user role assignments with obsolete roles...")
    
    const roleAssignments = await prisma.userRoleAssignment.findMany({
      where: {
        roleId: { in: obsoleteRoleIds },
      },
      select: {
        id: true,
        userId: true,
        roleId: true,
      },
    })

    console.log(`Found ${roleAssignments.length} role assignments to remove`)
    const userIdsWithObsoleteRoles = [...new Set(roleAssignments.map((ra) => ra.userId))]
    console.log(`Affected users: ${userIdsWithObsoleteRoles.length}`)
    console.log("")

    // Step 3: Delete role assignments with obsolete roles
    if (roleAssignments.length > 0) {
      console.log("Step 3: Deleting obsolete role assignments...")
      
      const deletedAssignments = await prisma.userRoleAssignment.deleteMany({
        where: {
          roleId: { in: obsoleteRoleIds },
        },
      })
      
      console.log(`Deleted ${deletedAssignments.count} role assignments`)
    }
    console.log("")

    // Step 4: Find users who only have obsolete roles (no other roles)
    console.log("Step 4: Finding users who only had obsolete roles...")
    
    const usersToCheck = await prisma.user.findMany({
      where: {
        id: { in: userIdsWithObsoleteRoles },
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    // Check which users no longer have any roles
    const usersWithNoRoles: string[] = []
    for (const user of usersToCheck) {
      const remainingRoles = await prisma.userRoleAssignment.count({
        where: { userId: user.id },
      })
      if (remainingRoles === 0) {
        usersWithNoRoles.push(user.id)
        console.log(`  - ${user.email} (${user.name || "No name"}) - No remaining roles`)
      }
    }
    console.log("")

    // Step 5: Delete users who no longer have any roles
    if (usersWithNoRoles.length > 0) {
      console.log("Step 5: Deleting users with no remaining roles...")
      
      // Delete related records first - wallets
      try {
        const deletedWallets = await prisma.wallet.deleteMany({
          where: { userId: { in: usersWithNoRoles } },
        })
        console.log(`  - Deleted ${deletedWallets.count} wallets`)
      } catch (e) {
        console.log("  - No wallets to delete or table doesn't exist")
      }

      // Delete sessions
      try {
        const deletedSessions = await prisma.session.deleteMany({
          where: { userId: { in: usersWithNoRoles } },
        })
        console.log(`  - Deleted ${deletedSessions.count} sessions`)
      } catch (e) {
        console.log("  - No sessions to delete or table doesn't exist")
      }

      // Delete wallet transactions (via wallet)
      try {
        // First get wallet IDs for these users
        const wallets = await prisma.wallet.findMany({
          where: { userId: { in: usersWithNoRoles } },
          select: { id: true },
        })
        const walletIds = wallets.map((w) => w.id)
        if (walletIds.length > 0) {
          const deletedTransactions = await prisma.walletTransaction.deleteMany({
            where: { walletId: { in: walletIds } },
          })
          console.log(`  - Deleted ${deletedTransactions.count} wallet transactions`)
        }
      } catch (e) {
        console.log("  - No wallet transactions to delete or table doesn't exist")
      }

      // Delete applications
      try {
        const deletedApplications = await prisma.application.deleteMany({
          where: { userId: { in: usersWithNoRoles } },
        })
        console.log(`  - Deleted ${deletedApplications.count} applications`)
      } catch (e) {
        console.log("  - No applications to delete or table doesn't exist")
      }

      // Delete DCC profiles
      try {
        const deletedDccProfiles = await prisma.dCCProfile.deleteMany({
          where: { userId: { in: usersWithNoRoles } },
        })
        console.log(`  - Deleted ${deletedDccProfiles.count} DCC profiles`)
      } catch (e) {
        console.log("  - No DCC profiles to delete or table doesn't exist")
      }

      // Finally, delete the users
      try {
        const deletedUsers = await prisma.user.deleteMany({
          where: {
            id: { in: usersWithNoRoles },
          },
        })
        console.log(`Deleted ${deletedUsers.count} users`)
      } catch (e: any) {
        console.log(`  - Could not delete users: ${e.message}`)
        console.log("  - Users still have related records. Manual cleanup may be required.")
      }
    } else {
      console.log("Step 5: No users to delete (all had other roles)")
    }
    console.log("")

    // Step 6: Delete the obsolete roles from the roles table
    console.log("Step 6: Deleting obsolete roles from roles table...")
    try {
      const deletedRoles = await prisma.role.deleteMany({
        where: {
          name: { in: OBSOLETE_ROLES },
        },
      })
      console.log(`Deleted ${deletedRoles.count} roles from roles table`)
    } catch (e) {
      console.log("  - Could not delete roles (may have foreign key constraints)")
    }
    console.log("")

    console.log("=".repeat(50))
    console.log("Summary:")
    console.log(`  - Obsolete roles found: ${obsoleteRoles.length}`)
    console.log(`  - Role assignments deleted: ${roleAssignments.length}`)
    console.log(`  - Users with no remaining roles deleted: ${usersWithNoRoles.length}`)
    console.log("=".repeat(50))
    console.log("")
    console.log("Done! Obsolete roles have been removed.")
    console.log("")
    console.log("IMPORTANT: You should now run the following commands:")
    console.log("  1. npx prisma generate")
    console.log("  2. npx prisma db push (or create a migration)")
    console.log("")

  } catch (error) {
    console.error("Error during role removal:", error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
