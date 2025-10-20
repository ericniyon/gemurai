const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTableExists() {
  try {
    console.log('🔍 Checking if interview_scores_complete table exists...');
    
    // Try to query the table
    const result = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'interview_scores_complete'
      );
    `;
    
    console.log('📋 Table check result:', result);
    
    if (result[0]?.exists) {
      console.log('✅ Table exists!');
      
      // Try to count records
      const count = await prisma.interviewScores.count();
      console.log(`📊 Number of records in table: ${count}`);
      
    } else {
      console.log('❌ Table does not exist');
    }
    
  } catch (error) {
    console.error('❌ Error checking table:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkTableExists(); 