const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugDatabase() {
  try {
    console.log('🔍 Debugging database connection...');
    console.log('📋 DATABASE_URL:', process.env.DATABASE_URL);
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Prisma connection successful');
    
    // Check all tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    console.log('📋 All tables in database:');
    tables.forEach(table => console.log(`  - ${table.table_name}`));
    
    // Check if interview_scores_complete exists
    const interviewTable = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'interview_scores_complete';
    `;
    
    console.log('📋 Interview scores table check:', interviewTable);
    
    if (interviewTable.length > 0) {
      // Check table structure
      const columns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'interview_scores_complete'
        ORDER BY ordinal_position;
      `;
      
      console.log('📋 Table structure:');
      columns.forEach(col => console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`));
      
      // Try to query the table directly
      try {
        const count = await prisma.$queryRaw`SELECT COUNT(*) as count FROM interview_scores_complete`;
        console.log('📊 Direct query count:', count);
      } catch (error) {
        console.error('❌ Direct query failed:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Database debug error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debugDatabase(); 