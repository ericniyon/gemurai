const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkApplicationsCount() {
  try {
    console.log('📊 Checking Applications Database');
    console.log('================================');
    
    // Count total applications
    const totalApplications = await prisma.application.count();
    console.log(`📈 Total applications in database: ${totalApplications}`);
    
    // Count by status
    const statusCounts = await prisma.application.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });
    
    console.log('\n📋 Applications by status:');
    statusCounts.forEach(status => {
      console.log(`   • ${status.status}: ${status._count.status}`);
    });
    
    // Get some sample applications
    const sampleApplications = await prisma.application.findMany({
      take: 5,
      select: {
        id: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log('\n📝 Sample applications (most recent):');
    sampleApplications.forEach((app, index) => {
      console.log(`   ${index + 1}. ${app.email} (${app.status}) - ${app.createdAt.toISOString().split('T')[0]}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking applications:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkApplicationsCount()
  .then(() => {
    console.log('\n✅ Database check completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Check failed:', error);
    process.exit(1);
  }); 