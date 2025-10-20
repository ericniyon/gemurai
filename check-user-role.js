const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUserRole() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'dcc@Gemurai.rw' },
      include: {
        userRole: {
          include: {
            role: true
          }
        }
      }
    });

    console.log('User:', {
      id: user?.id,
      email: user?.email,
      roleAssignment: user?.userRole ? {
        roleId: user.userRole.roleId,
        roleName: user.userRole.role.name,
        isActive: user.userRole.isActive
      } : null
    });

    // Also check all role assignments for this user
    const allAssignments = await prisma.userRoleAssignment.findMany({
      where: { userId: user?.id },
      include: {
        role: true
      }
    });

    console.log('All role assignments:', allAssignments.map(ura => ({
      id: ura.id,
      roleId: ura.roleId,
      roleName: ura.role.name,
      isActive: ura.isActive,
      assignedAt: ura.assignedAt
    })));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserRole(); 