// Script to generate vouchers for DCC users with a value of 51,840 RWF each
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Phone numbers for DCC users
const dccPhoneNumbers = [
  '0784637476', '0791478477', '0784243423', '0738497311', '0785503680',
  '0785794283', '0791203693', '0789168861', '0785673950', '0798754957',
  '0787759060', '0793627351', '0781136217', '0793275555', '0789447214',
  '0787911051', '0784898650', '0785045918', '0789295893', '0789782833',
  '0793141138', '0786336017', '0789216111', '0781434740', '0789001702',
  '0784616933', '0794089956', '0780374646', '0782562793', '0781891554',
  '0794322491', '0728401709', '0793196264', '0792994439', '0780867311',
  '0784125691', '0785054499', '0790528199', '0791011064', '0739282948',
  '0783027198', '0793353481', '0790140925', '0785196275', '0798924017',
  '0784868689', '0791822306', '0722804406', '0781617984', '0794305308',
  '0786613979', '0798224530', '0782396930', '0786498389', '0795390301',
  '0798578130', '0725056345', '0782298409', '0791083185', '0787488521',
  '0784145630', '0786156498', '0781205405', '0793126962', '0784275165',
  '0784036523', '0780957230', '0784234714', '0789603171', '0785544562',
  '0784785405', '0796654634', '0798869399', '0780466059', '0789007472',
  '0782789800', '0782964666', '0790639978', '0786680447', '0784532082',
  '0790401267', '0784687945', '0796435588', '0786534938', '0784620246',
  '0785815375', '0796534907'
];

// Voucher configuration
const VOUCHER_VALUE = 51840; // RWF
const VOUCHER_TYPE = 'DCC_BONUS';
const VOUCHER_DESCRIPTION = 'DCC User Bonus Voucher';

// Function to generate a unique voucher code
function generateVoucherCode() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `DCC${timestamp}${random}`.toUpperCase();
}

// Function to generate voucher expiry date (30 days from now)
function generateExpiryDate() {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 30);
  return expiryDate;
}

async function generateDccVouchers() {
  console.log('🎫 Starting DCC voucher generation...\n');
  console.log(`💰 Voucher Value: ${VOUCHER_VALUE.toLocaleString()} RWF`);
  console.log(`📱 Total DCC Users: ${dccPhoneNumbers.length}\n`);

  let successCount = 0;
  let errorCount = 0;
  const results = [];

  for (const phoneNumber of dccPhoneNumbers) {
    try {
      console.log(`📱 Processing phone: ${phoneNumber}`);
      
      // Find user by phone number
      const user = await prisma.user.findFirst({
        where: {
          phone: phoneNumber
        },
        include: {
          roleAssignments: {
            include: {
              role: true
            }
          }
        }
      });

      if (!user) {
        console.log(`❌ User not found for phone: ${phoneNumber}`);
        results.push({
          phone: phoneNumber,
          status: 'NOT_FOUND',
          message: 'User not found'
        });
        errorCount++;
        continue;
      }

      // Check if user has DCC role
      const hasDccRole = user.roleAssignments.some(assignment => 
        assignment.role.name === 'DCC'
      );

      if (!hasDccRole) {
        console.log(`⚠️ User ${user.name} (${phoneNumber}) does not have DCC role`);
        results.push({
          phone: phoneNumber,
          name: user.name,
          status: 'NO_DCC_ROLE',
          message: 'User does not have DCC role'
        });
        errorCount++;
        continue;
      }

      // Generate voucher code
      const voucherCode = generateVoucherCode();
      const expiryDate = generateExpiryDate();

      // Create voucher record
      const voucher = await prisma.voucher.create({
        data: {
          code: voucherCode,
          value: VOUCHER_VALUE,
          type: VOUCHER_TYPE,
          description: VOUCHER_DESCRIPTION,
          isUsed: false,
          isActive: true,
          expiresAt: expiryDate,
          userId: user.id,
          createdBy: 'SYSTEM',
          metadata: {
            phoneNumber: phoneNumber,
            userName: user.name,
            generatedFor: 'DCC_BONUS'
          }
        }
      });

      console.log(`✅ Voucher generated for ${user.name} (${phoneNumber})`);
      console.log(`   Code: ${voucherCode}`);
      console.log(`   Value: ${VOUCHER_VALUE.toLocaleString()} RWF`);
      console.log(`   Expires: ${expiryDate.toLocaleDateString()}`);
      
      results.push({
        phone: phoneNumber,
        name: user.name,
        voucherCode: voucherCode,
        voucherValue: VOUCHER_VALUE,
        expiryDate: expiryDate,
        status: 'SUCCESS',
        message: 'Voucher generated successfully'
      });
      
      successCount++;

    } catch (error) {
      console.error(`❌ Error generating voucher for ${phoneNumber}:`, error.message);
      
      results.push({
        phone: phoneNumber,
        status: 'ERROR',
        message: error.message
      });
      
      errorCount++;
    }
  }

  // Print summary
  console.log('\n📊 Voucher Generation Summary:');
  console.log(`✅ Successful generations: ${successCount}`);
  console.log(`❌ Failed generations: ${errorCount}`);
  console.log(`📱 Total processed: ${dccPhoneNumbers.length}`);
  console.log(`💰 Total voucher value generated: ${(successCount * VOUCHER_VALUE).toLocaleString()} RWF`);

  // Print detailed results
  console.log('\n📋 Detailed Results:');
  results.forEach((result, index) => {
    const statusIcon = result.status === 'SUCCESS' ? '✅' : 
                      result.status === 'NOT_FOUND' ? '❌' : 
                      result.status === 'NO_DCC_ROLE' ? '⚠️' : '⚠️';
    console.log(`${index + 1}. ${statusIcon} ${result.phone} - ${result.status}: ${result.message}`);
    if (result.status === 'SUCCESS') {
      console.log(`   User: ${result.name}`);
      console.log(`   Voucher: ${result.voucherCode} (${result.voucherValue.toLocaleString()} RWF)`);
      console.log(`   Expires: ${result.expiryDate.toLocaleDateString()}`);
    }
  });

  return results;
}

// Run the voucher generation
generateDccVouchers()
  .then((results) => {
    console.log('\n🎉 DCC voucher generation process completed!');
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
  })
  .finally(() => {
    prisma.$disconnect();
  });
