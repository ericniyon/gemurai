// Script to assign DCC roles to users before generating vouchers
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

async function assignDccRoles() {
  console.log('🔐 Starting DCC role assignment...\n');

  // First, let's check if DCC role exists
  const dccRole = await prisma.role.findFirst({
    where: {
      name: 'DCC'
    }
  });

  if (!dccRole) {
    console.log('❌ DCC role not found. Creating DCC role...');
    
    const newDccRole = await prisma.role.create({
      data: {
        name: 'DCC',
        description: 'District Community Coordinator',
        permissions: ['READ', 'WRITE', 'MANAGE_DCC'],
        isActive: true
      }
    });
    
    console.log('✅ DCC role created successfully');
    console.log(`   Role ID: ${newDccRole.id}`);
    console.log(`   Role Name: ${newDccRole.name}`);
  } else {
    console.log('✅ DCC role found');
    console.log(`   Role ID: ${dccRole.id}`);
    console.log(`   Role Name: ${dccRole.name}`);
  }

  const roleId = dccRole ? dccRole.id : (await prisma.role.findFirst({ where: { name: 'DCC' } })).id;

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

      // Check if user already has DCC role
      const hasDccRole = user.roleAssignments.some(assignment => 
        assignment.role.name === 'DCC'
      );

      if (hasDccRole) {
        console.log(`ℹ️ User ${user.name} (${phoneNumber}) already has DCC role`);
        results.push({
          phone: phoneNumber,
          name: user.name,
          status: 'ALREADY_ASSIGNED',
          message: 'User already has DCC role'
        });
        successCount++;
        continue;
      }

      // Assign DCC role to user
      const roleAssignment = await prisma.userRoleAssignment.create({
        data: {
          userId: user.id,
          roleId: roleId,
          assignedBy: 'SYSTEM',
          assignedAt: new Date(),
          isActive: true
        }
      });

      console.log(`✅ DCC role assigned to ${user.name} (${phoneNumber})`);
      
      results.push({
        phone: phoneNumber,
        name: user.name,
        roleAssignmentId: roleAssignment.id,
        status: 'SUCCESS',
        message: 'DCC role assigned successfully'
      });
      
      successCount++;

    } catch (error) {
      console.error(`❌ Error assigning DCC role for ${phoneNumber}:`, error.message);
      
      results.push({
        phone: phoneNumber,
        status: 'ERROR',
        message: error.message
      });
      
      errorCount++;
    }
  }

  // Print summary
  console.log('\n📊 DCC Role Assignment Summary:');
  console.log(`✅ Successful assignments: ${successCount}`);
  console.log(`❌ Failed assignments: ${errorCount}`);
  console.log(`📱 Total processed: ${dccPhoneNumbers.length}`);

  // Print detailed results
  console.log('\n📋 Detailed Results:');
  results.forEach((result, index) => {
    const statusIcon = result.status === 'SUCCESS' ? '✅' : 
                      result.status === 'NOT_FOUND' ? '❌' : 
                      result.status === 'ALREADY_ASSIGNED' ? 'ℹ️' : '⚠️';
    console.log(`${index + 1}. ${statusIcon} ${result.phone} - ${result.status}: ${result.message}`);
    if (result.status === 'SUCCESS' || result.status === 'ALREADY_ASSIGNED') {
      console.log(`   User: ${result.name}`);
    }
  });

  return results;
}

// Run the role assignment
assignDccRoles()
  .then((results) => {
    console.log('\n🎉 DCC role assignment process completed!');
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
  })
  .finally(() => {
    prisma.$disconnect();
  });




