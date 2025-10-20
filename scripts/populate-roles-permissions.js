const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

console.log('🔐 Populating Roles and Permissions');
console.log('===================================');

async function populateRolesAndPermissions() {
  try {
    // Step 1: Create Permissions
    console.log('\n📝 Step 1: Creating permissions...');
    
    const permissions = [
      // User Management
      { name: 'user.create', description: 'Create new users', category: 'User Management' },
      { name: 'user.read', description: 'View user information', category: 'User Management' },
      { name: 'user.update', description: 'Update user information', category: 'User Management' },
      { name: 'user.delete', description: 'Delete users', category: 'User Management' },
      { name: 'user.list', description: 'List all users', category: 'User Management' },
      
      // Role Management
      { name: 'role.create', description: 'Create new roles', category: 'Role Management' },
      { name: 'role.read', description: 'View role information', category: 'Role Management' },
      { name: 'role.update', description: 'Update role information', category: 'Role Management' },
      { name: 'role.delete', description: 'Delete roles', category: 'Role Management' },
      { name: 'role.list', description: 'List all roles', category: 'Role Management' },
      { name: 'role.assign', description: 'Assign roles to users', category: 'Role Management' },
      
      // Application Management
      { name: 'application.create', description: 'Create new applications', category: 'Application Management' },
      { name: 'application.read', description: 'View application information', category: 'Application Management' },
      { name: 'application.update', description: 'Update application information', category: 'Application Management' },
      { name: 'application.delete', description: 'Delete applications', category: 'Application Management' },
      { name: 'application.list', description: 'List all applications', category: 'Application Management' },
      { name: 'application.import', description: 'Import applications from Excel', category: 'Application Management' },
      { name: 'application.export', description: 'Export applications to Excel', category: 'Application Management' },
      { name: 'application.approve', description: 'Approve applications', category: 'Application Management' },
      { name: 'application.reject', description: 'Reject applications', category: 'Application Management' },
      
      // Interview Management
      { name: 'interview.create', description: 'Create new interviews', category: 'Interview Management' },
      { name: 'interview.read', description: 'View interview information', category: 'Interview Management' },
      { name: 'interview.update', description: 'Update interview information', category: 'Interview Management' },
      { name: 'interview.delete', description: 'Delete interviews', category: 'Interview Management' },
      { name: 'interview.list', description: 'List all interviews', category: 'Interview Management' },
      { name: 'interview.conduct', description: 'Conduct interviews', category: 'Interview Management' },
      { name: 'interview.score', description: 'Score interviews', category: 'Interview Management' },
      
      // Evaluation Management
      { name: 'evaluation.create', description: 'Create new evaluations', category: 'Evaluation Management' },
      { name: 'evaluation.read', description: 'View evaluation information', category: 'Evaluation Management' },
      { name: 'evaluation.update', description: 'Update evaluation information', category: 'Evaluation Management' },
      { name: 'evaluation.delete', description: 'Delete evaluations', category: 'Evaluation Management' },
      { name: 'evaluation.list', description: 'List all evaluations', category: 'Evaluation Management' },
      { name: 'evaluation.score', description: 'Score evaluations', category: 'Evaluation Management' },
      
      // DCC Management
      { name: 'dcc.create', description: 'Create new DCC profiles', category: 'DCC Management' },
      { name: 'dcc.read', description: 'View DCC information', category: 'DCC Management' },
      { name: 'dcc.update', description: 'Update DCC information', category: 'DCC Management' },
      { name: 'dcc.delete', description: 'Delete DCC profiles', category: 'DCC Management' },
      { name: 'dcc.list', description: 'List all DCCs', category: 'DCC Management' },
      { name: 'dcc.approve', description: 'Approve DCC applications', category: 'DCC Management' },
      
      // Product Management
      { name: 'product.create', description: 'Create new products', category: 'Product Management' },
      { name: 'product.read', description: 'View product information', category: 'Product Management' },
      { name: 'product.update', description: 'Update product information', category: 'Product Management' },
      { name: 'product.delete', description: 'Delete products', category: 'Product Management' },
      { name: 'product.list', description: 'List all products', category: 'Product Management' },
      
      // Inventory Management
      { name: 'inventory.read', description: 'View inventory information', category: 'Inventory Management' },
      { name: 'inventory.update', description: 'Update inventory', category: 'Inventory Management' },
      { name: 'inventory.adjust', description: 'Make inventory adjustments', category: 'Inventory Management' },
      { name: 'inventory.move', description: 'Move inventory between locations', category: 'Inventory Management' },
      
      // Stock Order Management
      { name: 'stockorder.create', description: 'Create stock orders', category: 'Stock Order Management' },
      { name: 'stockorder.read', description: 'View stock order information', category: 'Stock Order Management' },
      { name: 'stockorder.update', description: 'Update stock orders', category: 'Stock Order Management' },
      { name: 'stockorder.delete', description: 'Delete stock orders', category: 'Stock Order Management' },
      { name: 'stockorder.list', description: 'List all stock orders', category: 'Stock Order Management' },
      { name: 'stockorder.approve', description: 'Approve stock orders', category: 'Stock Order Management' },
      { name: 'stockorder.reject', description: 'Reject stock orders', category: 'Stock Order Management' },
      
      // Financial Management
      { name: 'wallet.read', description: 'View wallet information', category: 'Financial Management' },
      { name: 'wallet.update', description: 'Update wallet balances', category: 'Financial Management' },
      { name: 'transaction.read', description: 'View transaction history', category: 'Financial Management' },
      { name: 'withdrawal.approve', description: 'Approve withdrawal requests', category: 'Financial Management' },
      { name: 'withdrawal.reject', description: 'Reject withdrawal requests', category: 'Financial Management' },
      
      // System Management
      { name: 'system.settings', description: 'Manage system settings', category: 'System Management' },
      { name: 'system.logs', description: 'View system logs', category: 'System Management' },
      { name: 'system.backup', description: 'Create system backups', category: 'System Management' },
      
      // Dashboard Access
      { name: 'dashboard.admin', description: 'Access admin dashboard', category: 'Dashboard Access' },
      { name: 'dashboard.employer', description: 'Access employer dashboard', category: 'Dashboard Access' },
      { name: 'dashboard.dcc', description: 'Access DCC dashboard', category: 'Dashboard Access' },
      { name: 'dashboard.user', description: 'Access user dashboard', category: 'Dashboard Access' },
    ];

    // Create permissions
    for (const permission of permissions) {
      await prisma.permission.upsert({
        where: { name: permission.name },
        update: permission,
        create: permission
      });
    }
    
    console.log(`✅ Created ${permissions.length} permissions`);

    // Step 2: Create Roles
    console.log('\n👥 Step 2: Creating roles...');
    
    const roles = [
      {
        name: 'SUPER_ADMIN',
        description: 'Super Administrator with full system access',
        isSystem: true,
        permissions: [
          // All permissions
          ...permissions.map(p => p.name)
        ]
      },
      {
        name: 'ADMIN',
        description: 'Administrator with high-level management access',
        isSystem: true,
        permissions: [
          // User Management (except delete)
          'user.create', 'user.read', 'user.update', 'user.list',
          // Role Management
          'role.read', 'role.list', 'role.assign',
          // Application Management
          'application.create', 'application.read', 'application.update', 'application.list',
          'application.import', 'application.export', 'application.approve', 'application.reject',
          // Interview Management
          'interview.create', 'interview.read', 'interview.update', 'interview.list',
          'interview.conduct', 'interview.score',
          // Evaluation Management
          'evaluation.create', 'evaluation.read', 'evaluation.update', 'evaluation.list',
          'evaluation.score',
          // DCC Management
          'dcc.create', 'dcc.read', 'dcc.update', 'dcc.list', 'dcc.approve',
          // Product Management
          'product.create', 'product.read', 'product.update', 'product.list',
          // Inventory Management
          'inventory.read', 'inventory.update', 'inventory.adjust', 'inventory.move',
          // Stock Order Management
          'stockorder.create', 'stockorder.read', 'stockorder.update', 'stockorder.list',
          'stockorder.approve', 'stockorder.reject',
          // Financial Management
          'wallet.read', 'wallet.update', 'transaction.read',
          'withdrawal.approve', 'withdrawal.reject',
          // System Management
          'system.settings', 'system.logs',
          // Dashboard Access
          'dashboard.admin', 'dashboard.employer', 'dashboard.dcc', 'dashboard.user'
        ]
      },
      {
        name: 'EMPLOYER',
        description: 'Employer with application and job management access',
        isSystem: true,
        permissions: [
          // Application Management
          'application.read', 'application.update', 'application.list',
          'application.import', 'application.export', 'application.approve', 'application.reject',
          // Interview Management
          'interview.create', 'interview.read', 'interview.update', 'interview.list',
          'interview.conduct', 'interview.score',
          // Evaluation Management
          'evaluation.create', 'evaluation.read', 'evaluation.update', 'evaluation.list',
          'evaluation.score',
          // Product Management
          'product.read', 'product.list',
          // Dashboard Access
          'dashboard.employer', 'dashboard.user'
        ]
      },
      {
        name: 'DCC',
        description: 'Digital Community Champion with community engagement access',
        isSystem: true,
        permissions: [
          // DCC Management (own profile)
          'dcc.read', 'dcc.update',
          // Product Management
          'product.read', 'product.list',
          // Stock Order Management
          'stockorder.create', 'stockorder.read', 'stockorder.update', 'stockorder.list',
          // Financial Management
          'wallet.read', 'transaction.read',
          // Dashboard Access
          'dashboard.dcc', 'dashboard.user'
        ]
      },
      {
        name: 'INTERVIEWER',
        description: 'Interviewer with interview and evaluation access',
        isSystem: true,
        permissions: [
          // Application Management
          'application.read', 'application.list',
          // Interview Management
          'interview.read', 'interview.update', 'interview.list',
          'interview.conduct', 'interview.score',
          // Evaluation Management
          'evaluation.create', 'evaluation.read', 'evaluation.update', 'evaluation.list',
          'evaluation.score',
          // Dashboard Access
          'dashboard.user'
        ]
      },
      {
        name: 'EVALUATOR',
        description: 'Evaluator with application evaluation access',
        isSystem: true,
        permissions: [
          // Application Management
          'application.read', 'application.list',
          // Evaluation Management
          'evaluation.create', 'evaluation.read', 'evaluation.update', 'evaluation.list',
          'evaluation.score',
          // Dashboard Access
          'dashboard.user'
        ]
      },
      {
        name: 'CONSUMER',
        description: 'Consumer with basic user access',
        isSystem: true,
        permissions: [
          // Application Management (own applications)
          'application.create', 'application.read', 'application.update',
          // Product Management
          'product.read', 'product.list',
          // Dashboard Access
          'dashboard.user'
        ]
      },
      {
        name: 'AGENT',
        description: 'Agent with limited system access',
        isSystem: true,
        permissions: [
          // Application Management
          'application.read', 'application.list',
          // Product Management
          'product.read', 'product.list',
          // Dashboard Access
          'dashboard.user'
        ]
      }
    ];

    // Create roles and assign permissions
    for (const roleData of roles) {
      const { permissions: rolePermissions, ...roleInfo } = roleData;
      
      // Create or update role
      const role = await prisma.role.upsert({
        where: { name: roleInfo.name },
        update: roleInfo,
        create: roleInfo
      });
      
      console.log(`✅ Created role: ${role.name}`);
      
      // Get permission IDs
      const permissionIds = await prisma.permission.findMany({
        where: { name: { in: rolePermissions } },
        select: { id: true }
      });
      
      // Clear existing role permissions
      await prisma.rolePermission.deleteMany({
        where: { roleId: role.id }
      });
      
      // Create new role permissions
      for (const permission of permissionIds) {
        await prisma.rolePermission.create({
          data: {
            roleId: role.id,
            permissionId: permission.id
          }
        });
      }
      
      console.log(`   → Assigned ${permissionIds.length} permissions`);
    }

    // Step 3: Summary
    console.log('\n📊 Step 3: Summary');
    console.log('==================');
    
    const totalRoles = await prisma.role.count();
    const totalPermissions = await prisma.permission.count();
    const totalRolePermissions = await prisma.rolePermission.count();
    
    console.log(`✅ Total roles created: ${totalRoles}`);
    console.log(`✅ Total permissions created: ${totalPermissions}`);
    console.log(`✅ Total role-permission assignments: ${totalRolePermissions}`);
    
    // List all roles with their permission counts
    const rolesWithCounts = await prisma.role.findMany({
      include: {
        _count: {
          select: { rolePermissions: true }
        }
      }
    });
    
    console.log('\n📋 Roles and their permissions:');
    rolesWithCounts.forEach(role => {
      console.log(`   • ${role.name}: ${role._count.rolePermissions} permissions`);
    });

  } catch (error) {
    console.error('❌ Error populating roles and permissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the population script
populateRolesAndPermissions()
  .then(() => {
    console.log('\n🎉 Roles and permissions population completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Population failed:', error);
    process.exit(1);
  }); 