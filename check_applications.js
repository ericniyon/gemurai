const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkApplications() {
  try {
    console.log('🔍 Checking applications in database...');
    
    // Get all applications
    const applications = await prisma.application.findMany({
      take: 10,
      select: {
        id: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true
      }
    });
    
    console.log('📋 Applications found:', applications.length);
    applications.forEach(app => {
      console.log(`  - ID: ${app.id}`);
      console.log(`    Email: ${app.email}`);
      console.log(`    Phone: ${app.phone}`);
      console.log(`    Status: ${app.status}`);
      console.log(`    Created: ${app.createdAt}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error checking applications:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkApplications(); 