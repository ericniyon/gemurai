const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Checking database connection...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Check total applications
    const totalApplications = await prisma.application.count();
    console.log(`📊 Total applications in database: ${totalApplications}`);
    
    // Get sample applications
    const sampleApplications = await prisma.application.findMany({
      select: {
        id: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true
      },
      take: 10,
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('\n📋 Sample applications:');
    sampleApplications.forEach((app, index) => {
      console.log(`${index + 1}. ID: ${app.id}`);
      console.log(`   Email: ${app.email || 'N/A'}`);
      console.log(`   Phone: ${app.phone || 'N/A'}`);
      console.log(`   Status: ${app.status}`);
      console.log(`   Created: ${app.createdAt}`);
      console.log('');
    });
    
    // Check if any of the requested IDs exist
    const requestedIds = [
      'APP-1751702775384-f1ryycq',
      'APP-1752221523584-wntvwk0',
      'APP-1751557119269-cl9yqqa',
      'APP-1751523786852-frkrsvb',
      'APP-1752123815120-15gsdwr',
      'APP-1752083655990-4f50mc4',
      'APP-1752215785856-vx7k6ms',
      'APP-1751628995648-lud8fwd',
      'APP-1751867089196-wf3afwg',
      'APP-1751975116602-xkxetpj',
      'APP-1751682705451-odk9ljp',
      'APP-1752126571003-4fqm3jo',
      'APP-1752253067865-yy537mj',
      'APP-1751878611917-m2qpc3u'
    ];
    
    console.log('🔍 Checking for requested application IDs...');
    for (const id of requestedIds) {
      const app = await prisma.application.findUnique({
        where: { id },
        select: { id: true, email: true, phone: true, status: true }
      });
      
      if (app) {
        console.log(`✅ Found: ${id} - ${app.email || 'N/A'} - ${app.status}`);
      } else {
        console.log(`❌ Not found: ${id}`);
      }
    }
    
    // Check database info
    console.log('\n🔍 Database information:');
    console.log(`- Total applications: ${totalApplications}`);
    console.log(`- Sample IDs show: ${sampleApplications.length} applications`);
    
    if (totalApplications !== 1507) {
      console.log('\n⚠️  WARNING: Expected 1507 applications but found only', totalApplications);
      console.log('This suggests you might be connected to a different database than expected.');
    }
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase(); 