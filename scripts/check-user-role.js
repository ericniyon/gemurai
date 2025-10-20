const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

console.log('👤 Checking User Role Assignment');
console.log('================================');

async function checkUserRole() {
  try {
    const userEmail = "admin@ihuzo.rw";
    
    const user = await prisma.user.findUnique({
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
    
    if (!user) {
      console.log(`❌ User not found: ${userEmail}`);
      return;
    }
    
    console.log(`👤 User Information:`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Active: ${user.isActive ? 'Yes' : 'No'}`);
    console.log(`   Created: ${user.createdAt.toISOString()}`);
    
    if (user.userRole) {
      console.log(`\n👑 Role Assignment:`);
      console.log(`   Role: ${user.userRole.role.name}`);
      console.log(`   Description: ${user.userRole.role.description}`);
      console.log(`   Active: ${user.userRole.isActive ? 'Yes' : 'No'}`);
      console.log(`   Assigned: ${user.userRole.assignedAt.toISOString()}`);
      console.log(`   Total Permissions: ${user.userRole.role.rolePermissions.length}`);
      
      // Group permissions by category
      const permissionsByCategory = {};
      user.userRole.role.rolePermissions.forEach(rp => {
        const category = rp.permission.category;
        if (!permissionsByCategory[category]) {
          permissionsByCategory[category] = [];
        }
        permissionsByCategory[category].push(rp.permission.name);
      });
      
      console.log(`\n🔐 Permissions by Category:`);
      Object.entries(permissionsByCategory).forEach(([category, permissions]) => {
        console.log(`   📁 ${category} (${permissions.length}):`);
        permissions.forEach(permission => {
          console.log(`     • ${permission}`);
        });
      });
      
    } else {
      console.log(`\n❌ No role assigned to this user`);
    }
    
  } catch (error) {
    console.error('❌ Error checking user role:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserRole()
  .then(() => {
    console.log('\n✅ User role check completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Check failed:', error);
    process.exit(1);
  }); 