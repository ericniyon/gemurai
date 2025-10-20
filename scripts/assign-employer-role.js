const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

console.log('🔧 Assigning EMPLOYER Role');
console.log('==========================');

async function assignEmployerRole() {
  try {
    const email = "employer@Gemurai.rw";
    
    console.log(`🔍 Finding user: ${email}`);
    
    // Step 1: Find the user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        userRole: {
          include: {
            role: true
          }
        }
      }
    });

    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return;
    }

    console.log(`✅ User found: ${user.name}`);
    console.log(`   Current role: ${user.userRole?.role?.name || 'None'}`);

    // Step 2: Find the EMPLOYER role
    const employerRole = await prisma.role.findUnique({
      where: { name: 'EMPLOYER' }
    });

    if (!employerRole) {
      console.log('❌ EMPLOYER role not found in database');
      return;
    }

    console.log(`✅ EMPLOYER role found: ${employerRole.name}`);
    console.log(`   Role ID: ${employerRole.id}`);

    // Step 3: Check if user already has a role assignment
    if (user.userRole) {
      console.log('🔄 User already has a role assignment, updating...');
      
      // Update existing role assignment
      const updatedRole = await prisma.userRoleAssignment.update({
        where: { id: user.userRole.id },
        data: {
          roleId: employerRole.id,
          assignedAt: new Date(),
          isActive: true
        },
        include: {
          role: true
        }
      });

      console.log(`✅ Role updated successfully`);
      console.log(`   New role: ${updatedRole.role.name}`);
    } else {
      console.log('🆕 Creating new role assignment...');
      
      // Create new role assignment
      const newRole = await prisma.userRoleAssignment.create({
        data: {
          userId: user.id,
          roleId: employerRole.id,
          assignedBy: user.id, // Self-assigned for now
          assignedAt: new Date(),
          isActive: true
        },
        include: {
          role: true
        }
      });

      console.log(`✅ Role assigned successfully`);
      console.log(`   New role: ${newRole.role.name}`);
    }

    // Step 4: Verify the assignment
    const updatedUser = await prisma.user.findUnique({
      where: { email },
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

    console.log('\n📊 Verification Results:');
    console.log(`   User: ${updatedUser.name}`);
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   Role: ${updatedUser.userRole?.role?.name || 'None'}`);
    console.log(`   Permissions: ${updatedUser.userRole?.role?.rolePermissions?.length || 0} permissions`);

    if (updatedUser.userRole?.role?.rolePermissions) {
      console.log('\n🔑 Permissions:');
      updatedUser.userRole.role.rolePermissions.forEach((rp, index) => {
        console.log(`   ${index + 1}. ${rp.permission.name} - ${rp.permission.description}`);
      });
    }

    console.log('\n🎉 EMPLOYER role assignment completed successfully!');

  } catch (error) {
    console.error('❌ Error assigning EMPLOYER role:', error);
  } finally {
    await prisma.$disconnect();
  }
}

assignEmployerRole()
  .then(() => {
    console.log('\n✅ Script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }); 