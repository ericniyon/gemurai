const { Pool } = require('pg');
require('dotenv').config();

// Database connection using current DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function listApplications() {
  try {
    console.log('🔍 Connecting to database and listing applications...');
    console.log('📊 Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    
    // Connect to database
    const client = await pool.connect();
    console.log('✅ Connected to database successfully');
    
    // List all applications
    console.log('\n📋 Listing all applications:');
    const result = await client.query(`
      SELECT 
        id,
        email,
        phone,
        status,
        "createdAt",
        "updatedAt"
      FROM applications 
      ORDER BY "createdAt" DESC
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ No applications found in the database');
    } else {
      console.log(`✅ Found ${result.rows.length} applications:`);
      console.log('\n' + '='.repeat(80));
      
      result.rows.forEach((app, index) => {
        console.log(`${index + 1}. Application ID: ${app.id}`);
        console.log(`   Email: ${app.email || 'N/A'}`);
        console.log(`   Phone: ${app.phone || 'N/A'}`);
        console.log(`   Status: ${app.status}`);
        console.log(`   Created: ${new Date(app.createdAt).toLocaleString()}`);
        console.log(`   Updated: ${new Date(app.updatedAt).toLocaleString()}`);
        console.log('-'.repeat(40));
      });
    }
    
    // Get some basic stats
    const statsResult = await client.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM applications 
      GROUP BY status
      ORDER BY count DESC
    `);
    
    console.log('\n📊 Application Statistics:');
    statsResult.rows.forEach(stat => {
      console.log(`   ${stat.status}: ${stat.count} applications`);
    });
    
    client.release();
    
  } catch (error) {
    console.error('❌ Error listing applications:', error.message);
    console.error('Database connection details:', {
      hasUrl: !!process.env.DATABASE_URL,
      urlLength: process.env.DATABASE_URL?.length || 0
    });
  } finally {
    await pool.end();
  }
}

listApplications(); 