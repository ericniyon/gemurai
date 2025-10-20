const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTableStatus() {
  try {
    console.log('🔍 Checking interview_scores_complete table status...');
    
    // Check if table exists
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'interview_scores_complete'
      );
    `;
    
    console.log('📋 Table exists:', tableExists[0]?.exists);
    
    if (tableExists[0]?.exists) {
      // Check table structure
      const columns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'interview_scores_complete'
        ORDER BY ordinal_position;
      `;
      
      console.log('📋 Table structure:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
      
      // Check if overallScore column exists
      const overallScoreExists = columns.some(col => col.column_name === 'overallScore');
      console.log('📋 overallScore column exists:', overallScoreExists);
      
      // Count records
      const count = await prisma.interviewScores.count();
      console.log('📊 Total records:', count);
      
    } else {
      console.log('❌ Table does not exist!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkTableStatus(); 