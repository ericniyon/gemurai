const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyDatabaseData() {
  try {
    console.log('🔍 Verifying database data...');
    
    // Get all interview scores
    const allScores = await prisma.interviewScores.findMany({
      orderBy: {
        updatedAt: 'desc'
      }
    });
    
    console.log('📊 Total records in database:', allScores.length);
    
    allScores.forEach((score, index) => {
      console.log(`\n📋 Record ${index + 1}:`);
      console.log(`  - ID: ${score.id}`);
      console.log(`  - Application ID: ${score.applicationId}`);
      console.log(`  - Total Score: ${score.totalScore}`);
      console.log(`  - Total Possible Score: ${score.totalPossibleScore}`);
      console.log(`  - Overall Score: ${score.overallScore}`);
      console.log(`  - Updated At: ${score.updatedAt}`);
    });
    
    // Check the specific record we just updated
    const specificRecord = await prisma.interviewScores.findFirst({
      where: {
        applicationId: 'APP-1751273501176-sb52oc9'
      }
    });
    
    if (specificRecord) {
      console.log('\n✅ Specific record found:');
      console.log(`  - Overall Score: "${specificRecord.overallScore}"`);
      console.log(`  - Total Score: ${specificRecord.totalScore}`);
      console.log(`  - Last Updated: ${specificRecord.updatedAt}`);
    } else {
      console.log('\n❌ Specific record not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabaseData(); 