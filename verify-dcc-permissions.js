// Verification script to confirm DCC permissions are aligned
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyDCCPermissions() {
  try {
    console.log('🔍 Verifying DCC permissions alignment...\n');

    // Get DCC user from database
    const dccUser = await prisma.user.findUnique({
      where: { email: 'dcc@Gemurai.rw' },
      select: {
        email: true,
        name: true,
        role: true,
        permissions: true
      }
    });

    if (!dccUser) {
      console.log('❌ DCC user not found');
      return;
    }

    console.log(`👤 User: ${dccUser.name} (${dccUser.email})`);
    console.log(`🏷️  Role: ${dccUser.role}`);
    console.log(`📊 Database permissions: ${dccUser.permissions.length}`);

    // Expected sidebar navigation items
    const expectedNavItems = [
      { name: 'Dashboard', permission: 'dashboard.view' },
      { name: 'Applications', permission: 'applications.view' },
      { name: 'Products', permission: 'products.view' },
      { name: 'Learning', permission: 'learning.view' },
      { name: 'Jobs', permission: 'jobs.view' },
      { name: 'Stock Management', permission: 'stock.create' },
      { name: 'Sales', permission: 'sales.view' },
      { name: 'Finance', permission: 'finance.view' }
    ];

    console.log('\n✅ Navigation items verification:');
    let allPassed = true;

    expectedNavItems.forEach(item => {
      const hasPermission = dccUser.permissions.includes(item.permission);
      const status = hasPermission ? '✅' : '❌';
      console.log(`${status} ${item.name} (${item.permission})`);
      
      if (!hasPermission) {
        allPassed = false;
      }
    });

    console.log('\n📊 Summary:');
    console.log(`Database permissions: ${dccUser.permissions.length}`);
    console.log(`Required for sidebar: ${expectedNavItems.length}`);
    console.log(`Navigation check: ${allPassed ? '✅ PASS' : '❌ FAIL'}`);

    if (allPassed) {
      console.log('\n🎉 Perfect! DCC sidebar should now display all expected menu items.');
    } else {
      console.log('\n⚠️  Some navigation items may not display correctly.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDCCPermissions(); 