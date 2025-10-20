const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

console.log('🔍 Verifying Roles and Permissions');
console.log('==================================');

async function verifyRolesAndPermissions() {
  try {
    // Get all roles with their permissions
    const roles = await prisma.role.findMany({
      include: {
        rolePermissions: {
          include: {
            permission: true
          }
        },
        _count: {
          select: { rolePermissions: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    console.log(`📊 Found ${roles.length} roles in the database\n`);

    // Display each role with its permissions
    for (const role of roles) {
      console.log(`👤 ${role.name} (${role._count.rolePermissions} permissions)`);
      console.log(`   Description: ${role.description}`);
      console.log(`   System Role: ${role.isSystem ? 'Yes' : 'No'}`);
      console.log(`   Active: ${role.isActive ? 'Yes' : 'No'}`);
      
      // Group permissions by category
      const permissionsByCategory = {};
      role.rolePermissions.forEach(rp => {
        const category = rp.permission.category;
        if (!permissionsByCategory[category]) {
          permissionsByCategory[category] = [];
        }
        permissionsByCategory[category].push(rp.permission.name);
      });

      console.log(`   Permissions by category:`);
      Object.entries(permissionsByCategory).forEach(([category, permissions]) => {
        console.log(`     📁 ${category} (${permissions.length}):`);
        permissions.forEach(permission => {
          console.log(`       • ${permission}`);
        });
      });
      
      console.log(''); // Empty line for separation
    }

    // Get all permissions grouped by category
    const permissions = await prisma.permission.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }]
    });

    const permissionsByCategory = {};
    permissions.forEach(permission => {
      if (!permissionsByCategory[permission.category]) {
        permissionsByCategory[permission.category] = [];
      }
      permissionsByCategory[permission.category].push(permission);
    });

    console.log('📋 All Available Permissions by Category:');
    console.log('==========================================');
    
    Object.entries(permissionsByCategory).forEach(([category, categoryPermissions]) => {
      console.log(`\n📁 ${category} (${categoryPermissions.length} permissions):`);
      categoryPermissions.forEach(permission => {
        console.log(`   • ${permission.name} - ${permission.description}`);
      });
    });

    // Summary statistics
    console.log('\n📊 Summary Statistics:');
    console.log('======================');
    console.log(`Total Roles: ${roles.length}`);
    console.log(`Total Permissions: ${permissions.length}`);
    console.log(`Total Role-Permission Assignments: ${roles.reduce((sum, role) => sum + role._count.rolePermissions, 0)}`);
    
    // Role hierarchy summary
    console.log('\n🏗️  Role Hierarchy:');
    console.log('==================');
    console.log('SUPER_ADMIN (Full system access)');
    console.log('├── ADMIN (High-level management)');
    console.log('├── EMPLOYER (Application & job management)');
    console.log('├── DCC (Community engagement)');
    console.log('├── INTERVIEWER (Interview & evaluation)');
    console.log('├── EVALUATOR (Application evaluation)');
    console.log('├── CONSUMER (Basic user access)');
    console.log('└── AGENT (Limited system access)');

  } catch (error) {
    console.error('❌ Error verifying roles and permissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the verification script
verifyRolesAndPermissions()
  .then(() => {
    console.log('\n✅ Verification completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }); 