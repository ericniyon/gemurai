const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestApplication() {
  try {
    console.log('🔧 Creating test application with Apps Script ID...');
    
    const testAppsScriptId = 'APP-1751966210418-uury73h';
    
    // Check if application already exists
    const existingApp = await prisma.application.findFirst({
      where: {
        formData: {
          path: ['ID'],
          equals: testAppsScriptId
        }
      }
    });
    
    if (existingApp) {
      console.log(`✅ Test application already exists: ${existingApp.id}`);
      console.log(`   Status: ${existingApp.status}`);
      return existingApp.id;
    }
    
    // Create test application
    const testApp = await prisma.application.create({
      data: {
        id: `test_${Date.now()}`,
        phone: '07800000000',
        email: 'test@example.com',
        status: 'SUBMITTED',
        formData: {
          ID: testAppsScriptId,
          'First Name': 'Munyamahoro',
          'Lat Name': 'Emmanuel',
          district: 'Musanze',
          'Phone Number': '07824 216 44',
          'Total Score': 16,
          'Vulnerability Category': 'Level C',
          Gender: 0,
          'Marital Status': 0,
          Disability: 0,
          'Disability type': 0,
          Refugee: 3,
          'Refugee camp': 0,
          'Householding head': 0,
          'Financial provider for your household': 0,
          'used Apps': 0,
          Education: 0,
          Languages: 0,
          'Device Owner': 0,
          'Internet Usage': 1,
          'Previous Roles': 0,
          'App Familiarity': 0,
          'work Experience': 5,
          'Smartphone Access': 0,
          'Community Connection': 0,
          'Healthcare Background': 2,
          'Years of Experience': 0,
          'Own house': 5,
          'Community involvement': 0,
          'Which Community involvement': 0
        }
      }
    });
    
    console.log(`✅ Created test application: ${testApp.id}`);
    console.log(`   Apps Script ID: ${testAppsScriptId}`);
    console.log(`   Status: ${testApp.status}`);
    
    return testApp.id;
    
  } catch (error) {
    console.error('❌ Error creating test application:', error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

createTestApplication(); 