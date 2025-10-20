import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debugging database connection in Next.js...')
    console.log('📋 DATABASE_URL:', process.env.DATABASE_URL)
    
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Prisma connection successful')
    
    // Check all tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    console.log('📋 All tables in database:');
    tables.forEach((table: any) => console.log(`  - ${table.table_name}`));
    
    // Check if interview_scores_complete exists
    const interviewTable = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'interview_scores_complete';
    `;
    
    console.log('📋 Interview scores table check:', interviewTable);
    
    // Try to query the table directly
    let directQueryResult = null;
    try {
      directQueryResult = await prisma.$queryRaw`SELECT COUNT(*) as count FROM interview_scores_complete`;
      console.log('📊 Direct query count:', directQueryResult);
    } catch (error) {
      console.error('❌ Direct query failed:', error.message);
    }
    
    // Try Prisma model
    let prismaModelResult = null;
    try {
      prismaModelResult = await prisma.interviewScores.count();
      console.log('📊 Prisma model count:', prismaModelResult);
    } catch (error) {
      console.error('❌ Prisma model failed:', error.message);
    }
    
    return NextResponse.json({
      success: true,
      databaseUrl: process.env.DATABASE_URL,
      tables: tables.map((t: any) => t.table_name),
      interviewTableExists: interviewTable.length > 0,
      directQueryResult,
      prismaModelResult,
      availableModels: Object.keys(prisma).filter(key => !key.startsWith('_') && !key.startsWith('$'))
    })
    
  } catch (error) {
    console.error('❌ Database debug error:', error.message)
    return NextResponse.json({
      success: false,
      error: error.message,
      databaseUrl: process.env.DATABASE_URL
    })
  }
} 