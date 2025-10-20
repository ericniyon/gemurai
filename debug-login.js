const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugLogin() {
  try {
    const email = 'dcc@Gemurai.rw';
    
    // Simulate the exact query from the login API
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        avatar: true,
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
      },
    });

    console.log('Raw user data:', JSON.stringify(user, null, 2));

    if (user) {
      // Get user role and permissions
      const userRole = user.userRole?.role;
      const roleName = userRole?.name || 'CONSUMER';
      
      console.log('User role object:', userRole);
      console.log('Role name:', roleName);
      console.log('Has role:', !!userRole);

      // Get permissions from the user's assigned role
      const rolePermissions = userRole?.rolePermissions?.map(rp => rp.permission.name) || [];
      console.log('Role permissions from database:', rolePermissions);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugLogin(); 