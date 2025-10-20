const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

console.log('👑 Assigning SUPER_ADMIN Role');
console.log('============================');

async function assignSuperAdminRole() {
  try {
    const userEmail = "admin@ihuzo.rw";
    
    console.log(`🔍 Looking for user: ${userEmail}`);
    
    // Step 1: Find the user
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        userRole: {
          include: {
            role: true
          }
        }
      }
    });
    
    if (!user) {
      console.log(`❌ User with email "${userEmail}" not found`);
      console.log('💡 Creating new user with SUPER_ADMIN role...');
      
      // Create the user if it doesn't exist
      const newUser = await prisma.user.create({
        data: {
          email: userEmail,
          name: "System Administrator",
          password: "admin123", // You should change this password
          isActive: true
        }
      });
      
      console.log(`✅ Created new user: ${newUser.name} (${newUser.email})`);
      
      // Find the SUPER_ADMIN role
      const superAdminRole = await prisma.role.findUnique({
        where: { name: 'SUPER_ADMIN' }
      });
      
      if (!superAdminRole) {
        console.log('❌ SUPER_ADMIN role not found');
        return;
      }
      
      // Assign the SUPER_ADMIN role
      const roleAssignment = await prisma.userRoleAssignment.create({
        data: {
          userId: newUser.id,
          roleId: superAdminRole.id,
          isActive: true
        }
      });
      
      console.log(`✅ Assigned SUPER_ADMIN role to new user`);
      console.log(`   User ID: ${newUser.id}`);
      console.log(`   Role Assignment ID: ${roleAssignment.id}`);
      
    } else {
      console.log(`✅ Found existing user: ${user.name} (${user.email})`);
      
      // Check current role
      if (user.userRole) {
        console.log(`   Current role: ${user.userRole.role.name}`);
        
        if (user.userRole.role.name === 'SUPER_ADMIN') {
          console.log('✅ User already has SUPER_ADMIN role');
          return;
        }
        
        // Update existing role assignment
        await prisma.userRoleAssignment.update({
          where: { id: user.userRole.id },
          data: {
            roleId: (await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } })).id,
            updatedAt: new Date()
          }
        });
        
        console.log('✅ Updated user role to SUPER_ADMIN');
        
      } else {
        console.log('   No current role assigned');
        
        // Find the SUPER_ADMIN role
        const superAdminRole = await prisma.role.findUnique({
          where: { name: 'SUPER_ADMIN' }
        });
        
        if (!superAdminRole) {
          console.log('❌ SUPER_ADMIN role not found');
          return;
        }
        
        // Create new role assignment
        const roleAssignment = await prisma.userRoleAssignment.create({
          data: {
            userId: user.id,
            roleId: superAdminRole.id,
            isActive: true
          }
        });
        
        console.log(`✅ Assigned SUPER_ADMIN role to existing user`);
        console.log(`   Role Assignment ID: ${roleAssignment.id}`);
      }
    }
    
    // Verify the assignment
    console.log('\n🔍 Verifying role assignment...');
    
    const verifiedUser = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        userRole: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });
    
    if (verifiedUser && verifiedUser.userRole) {
      console.log(`✅ Verification successful:`);
      console.log(`   User: ${verifiedUser.name} (${verifiedUser.email})`);
      console.log(`   Role: ${verifiedUser.userRole.role.name}`);
      console.log(`   Permissions: ${verifiedUser.userRole.role.rolePermissions.length} total`);
      console.log(`   Active: ${verifiedUser.userRole.isActive ? 'Yes' : 'No'}`);
      console.log(`   Assigned: ${verifiedUser.userRole.assignedAt.toISOString()}`);
      
      // Show some key permissions
      const keyPermissions = verifiedUser.userRole.role.rolePermissions
        .map(rp => rp.permission.name)
        .filter(name => name.includes('system.') || name.includes('user.') || name.includes('role.'))
        .slice(0, 10);
      
      console.log(`   Key permissions: ${keyPermissions.join(', ')}...`);
      
    } else {
      console.log('❌ Role assignment verification failed');
    }
    
  } catch (error) {
    console.error('❌ Error assigning SUPER_ADMIN role:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the assignment script
assignSuperAdminRole()
  .then(() => {
    console.log('\n🎉 SUPER_ADMIN role assignment completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Assignment failed:', error);
    process.exit(1);
  }); 