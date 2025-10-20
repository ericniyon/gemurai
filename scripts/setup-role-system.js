const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function setupRoleSystem() {
  try {
    console.log('🚀 Setting up role system...')
    
    // 1. Create basic permissions
    console.log('📝 Creating permissions...')
    const permissions = [
      // Dashboard
      { name: 'dashboard.view', description: 'View dashboard', category: 'dashboard' },
      { name: 'dashboard.analytics', description: 'View analytics', category: 'dashboard' },
      
      // Applications
      { name: 'applications.view', description: 'View applications', category: 'applications' },
      { name: 'applications.create', description: 'Create applications', category: 'applications' },
      { name: 'applications.evaluate', description: 'Evaluate applications', category: 'applications' },
      { name: 'applications.manage', description: 'Manage applications', category: 'applications' },
      { name: 'applications.review', description: 'Review applications', category: 'applications' },
      { name: 'applications.delete', description: 'Delete applications', category: 'applications' },
      { name: 'applications.update', description: 'Update applications', category: 'applications' },
      { name: 'applications.process', description: 'Process applications', category: 'applications' },
      { name: 'applications.approve', description: 'Approve applications', category: 'applications' },
      { name: 'applications.reject', description: 'Reject applications', category: 'applications' },
      
      // Products
      { name: 'products.view', description: 'View products', category: 'products' },
      { name: 'products.create', description: 'Create products', category: 'products' },
      { name: 'products.edit', description: 'Edit products', category: 'products' },
      { name: 'products.delete', description: 'Delete products', category: 'products' },
      { name: 'products.manage', description: 'Manage products', category: 'products' },
      { name: 'products.purchase', description: 'Purchase products', category: 'products' },
      
      // Stock
      { name: 'stock.view', description: 'View stock', category: 'stock' },
      { name: 'stock.create', description: 'Create stock entries', category: 'stock' },
      { name: 'stock.manage', description: 'Manage stock', category: 'stock' },
      { name: 'stock.edit', description: 'Edit stock', category: 'stock' },
      { name: 'stock.delete', description: 'Delete stock', category: 'stock' },
      { name: 'stock.orders.view', description: 'View stock orders', category: 'stock' },
      { name: 'stock.orders.create', description: 'Create stock orders', category: 'stock' },
      { name: 'stock.orders.manage', description: 'Manage stock orders', category: 'stock' },
      
      // Users
      { name: 'users.view', description: 'View users', category: 'users' },
      { name: 'users.create', description: 'Create users', category: 'users' },
      { name: 'users.edit', description: 'Edit users', category: 'users' },
      { name: 'users.delete', description: 'Delete users', category: 'users' },
      { name: 'users.manage', description: 'Manage users', category: 'users' },
      
      // Admin
      { name: 'admin.system', description: 'System administration', category: 'admin' },
      { name: 'admin.users', description: 'User administration', category: 'admin' },
      { name: 'admin.reports', description: 'Generate reports', category: 'admin' },
      { name: 'admin.forms', description: 'Manage forms', category: 'admin' },
      
      // Profile
      { name: 'profile.view', description: 'View profile', category: 'profile' },
      { name: 'profile.edit', description: 'Edit profile', category: 'profile' },
      
      // Other
      { name: 'files.upload', description: 'Upload files', category: 'files' },
      { name: 'wallet.view', description: 'View wallet', category: 'wallet' },
      { name: 'wallet.manage', description: 'Manage wallet', category: 'wallet' },
    ]

    for (const permission of permissions) {
      await prisma.permission.upsert({
        where: { name: permission.name },
        update: {},
        create: permission
      })
    }
    console.log(`✅ Created ${permissions.length} permissions`)

    // 2. Create basic roles
    console.log('👥 Creating roles...')
    const roles = [
      {
        name: 'SUPER_ADMIN',
        description: 'Super Administrator with full access',
        isSystem: true,
        permissions: permissions.map(p => p.name) // All permissions
      },
      {
        name: 'ADMIN',
        description: 'Administrator with most permissions',
        isSystem: true,
        permissions: [
          'dashboard.view', 'dashboard.analytics',
          'applications.view', 'applications.manage', 'applications.review',
          'products.view', 'products.create', 'products.edit', 'products.delete', 'products.manage',
          'users.view', 'users.create', 'users.edit', 'users.manage',
          'admin.users', 'admin.reports', 'admin.forms',
          'profile.view', 'profile.edit', 'files.upload'
        ]
      },
      {
        name: 'EMPLOYER',
        description: 'Employer with application and product management',
        isSystem: true,
        permissions: [
          'dashboard.view',
          'applications.view', 'applications.create', 'applications.evaluate', 'applications.manage',
          'applications.review', 'applications.delete', 'applications.update', 'applications.process',
          'applications.approve', 'applications.reject',
          'products.view', 'products.create', 'products.edit', 'products.delete', 'products.manage',
          'stock.view', 'stock.create', 'stock.manage', 'stock.edit', 'stock.delete',
          'stock.orders.view', 'stock.orders.create', 'stock.orders.manage',
          'profile.view', 'profile.edit', 'files.upload'
        ]
      },
      {
        name: 'DCC',
        description: 'Digital Community Champion',
        isSystem: true,
        permissions: [
          'dashboard.view',
          'applications.view', 'applications.create', 'applications.review',
          'products.view', 'products.create', 'products.edit', 'products.manage', 'products.purchase',
          'stock.create', 'stock.view',
          'profile.view', 'profile.edit'
        ]
      },
      {
        name: 'CONSUMER',
        description: 'Regular consumer/customer',
        isSystem: true,
        permissions: [
          'dashboard.view',
          'applications.view', 'applications.create',
          'products.view', 'products.purchase',
          'profile.view', 'profile.edit'
        ]
      },
      {
        name: 'AGENT',
        description: 'Service agent',
        isSystem: true,
        permissions: [
          'dashboard.view',
          'applications.view', 'applications.create',
          'products.view',
          'profile.view', 'profile.edit'
        ]
      }
    ]

    for (const roleData of roles) {
      const { permissions: rolePermissions, ...roleInfo } = roleData
      
      const role = await prisma.role.upsert({
        where: { name: roleData.name },
        update: {},
        create: roleInfo
      })

      // Assign permissions to role
      for (const permissionName of rolePermissions) {
        const permission = await prisma.permission.findUnique({
          where: { name: permissionName }
        })
        
        if (permission) {
          await prisma.rolePermission.upsert({
            where: {
              roleId_permissionId: {
                roleId: role.id,
                permissionId: permission.id
              }
            },
            update: {},
            create: {
              roleId: role.id,
              permissionId: permission.id
            }
          })
        }
      }
    }
    console.log(`✅ Created ${roles.length} roles with permissions`)

    // 3. Migrate existing users to new role system
    console.log('👤 Migrating existing users...')
    
    // First, check if we have any users without role assignments
    const usersWithoutRoles = await prisma.user.findMany({
      where: {
        userRole: null
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    })

    console.log(`Found ${usersWithoutRoles.length} users without role assignments`)

    // Assign default CONSUMER role to users without roles
    const consumerRole = await prisma.role.findUnique({
      where: { name: 'CONSUMER' }
    })

    if (consumerRole) {
      for (const user of usersWithoutRoles) {
        await prisma.userRoleAssignment.create({
          data: {
            userId: user.id,
            roleId: consumerRole.id,
            assignedBy: null, // System assignment
            assignedAt: new Date()
          }
        })
        console.log(`✅ Assigned CONSUMER role to ${user.email}`)
      }
    }

    console.log('🎉 Role system setup completed successfully!')
    
    // Print summary
    const totalUsers = await prisma.user.count()
    const totalRoles = await prisma.role.count()
    const totalPermissions = await prisma.permission.count()
    const totalAssignments = await prisma.userRoleAssignment.count()
    
    console.log('\n📊 Summary:')
    console.log(`- Total Users: ${totalUsers}`)
    console.log(`- Total Roles: ${totalRoles}`)
    console.log(`- Total Permissions: ${totalPermissions}`)
    console.log(`- Total Role Assignments: ${totalAssignments}`)

  } catch (error) {
    console.error('❌ Error setting up role system:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the setup
setupRoleSystem()
  .then(() => {
    console.log('✅ Setup completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  }) 