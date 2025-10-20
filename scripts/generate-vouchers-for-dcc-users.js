const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function generateVouchersForDCCUsers() {
  try {
    console.log('🔍 Finding all DCC users...');
    
    // Find all users with DCC role
    const dccUsers = await prisma.user.findMany({
      where: {
        roleAssignments: {
          some: {
            role: {
              name: 'DCC'
            },
            isActive: true
          }
        }
      },
      include: {
        roleAssignments: {
          include: {
            role: true
          }
        }
      }
    });

    console.log(`📊 Found ${dccUsers.length} DCC users`);

    if (dccUsers.length === 0) {
      console.log('❌ No DCC users found');
      return;
    }

    // Check existing vouchers
    const existingVouchers = await prisma.voucher.findMany({
      select: {
        dccId: true
      }
    });

    const dccIdsWithVouchers = new Set(existingVouchers.map(v => v.dccId));
    const dccUsersWithoutVouchers = dccUsers.filter(user => !dccIdsWithVouchers.has(user.id));

    console.log(`📊 ${dccUsersWithoutVouchers.length} DCC users need vouchers`);

    if (dccUsersWithoutVouchers.length === 0) {
      console.log('✅ All DCC users already have vouchers');
      return;
    }

    // Generate vouchers for users who don't have them
    const defaultVoucherValue = 30000;
    const createdVouchers = [];

    for (const user of dccUsersWithoutVouchers) {
      const voucherCode = `DCCVOUCHER-${user.id.substring(0, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
      
      console.log(`🎫 Creating voucher for ${user.email} (${user.name})`);
      
      const voucher = await prisma.voucher.create({
        data: {
          code: voucherCode,
          value: defaultVoucherValue,
          remainingBalance: defaultVoucherValue,
          status: 'ACTIVE',
          dccId: user.id,
          createdBy: user.id, // Self-created for existing users
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year expiry
        }
      });

      // Create initial transaction record
      await prisma.voucherTransaction.create({
        data: {
          voucherId: voucher.id,
          type: 'CREATED',
          amount: defaultVoucherValue,
          remainingBalance: defaultVoucherValue,
          description: `Initial voucher for existing DCC user ${user.email}`
        }
      });

      createdVouchers.push({
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        voucherCode: voucher.code,
        voucherValue: voucher.value
      });

      console.log(`✅ Created voucher ${voucher.code} for ${user.email}`);
    }

    console.log('\n📋 Summary:');
    console.log(`Total DCC users: ${dccUsers.length}`);
    console.log(`Users with existing vouchers: ${dccUsers.length - dccUsersWithoutVouchers.length}`);
    console.log(`New vouchers created: ${createdVouchers.length}`);
    
    if (createdVouchers.length > 0) {
      console.log('\n🎫 New vouchers created:');
      createdVouchers.forEach(v => {
        console.log(`  - ${v.userEmail} (${v.userName}): ${v.voucherCode} - ${v.voucherValue} RWF`);
      });
    }

  } catch (error) {
    console.error('❌ Error generating vouchers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
generateVouchersForDCCUsers();
