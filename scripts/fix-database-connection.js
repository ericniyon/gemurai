#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Database Connection Fix Script');
console.log('================================');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
const envExists = fs.existsSync(envPath);

console.log(`\n📁 .env file exists: ${envExists ? '✅ Yes' : '❌ No'}`);

if (!envExists) {
  console.log('\n🔧 Creating .env file with local database configuration...');
  
  const envContent = `# Database Configuration
# For local development with PostgreSQL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/Gemurai_db?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/Gemurai_db?schema=public"

# For local development with SQLite (alternative)
# DATABASE_URL="file:./dev.db"
# DIRECT_URL="file:./dev.db"

# Next Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Email (SendGrid)
SENDGRID_API_KEY=""
FROM_EMAIL="noreply@Gemurai.rw"

# SMS (Twilio)
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_PHONE_NUMBER=""

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Redis (optional)
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""
REDIS_DB="0"
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env file with local database configuration');
} else {
  console.log('\n📄 .env file content:');
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log(envContent);
  } catch (error) {
    console.log('❌ Could not read .env file:', error.message);
  }
}

console.log('\n🔧 Database Setup Options:');
console.log('1. Local PostgreSQL (recommended for development)');
console.log('2. Local SQLite (simpler setup)');
console.log('3. Railway/External PostgreSQL (production)');

console.log('\n📋 Next Steps:');
console.log('1. Choose your database option above');
console.log('2. If using PostgreSQL locally:');
console.log('   - Install PostgreSQL');
console.log('   - Create database: CREATE DATABASE Gemurai_db;');
console.log('   - Update DATABASE_URL in .env if needed');
console.log('3. If using SQLite:');
console.log('   - Update DATABASE_URL in .env to use SQLite');
console.log('4. Run: pnpm prisma generate');
console.log('5. Run: pnpm prisma db push');
console.log('6. Run: pnpm dev');

console.log('\n🔍 To test the connection:');
console.log('curl http://localhost:3000/api/health');

console.log('\n💡 If you need help with PostgreSQL setup:');
console.log('- macOS: brew install postgresql');
console.log('- Ubuntu: sudo apt-get install postgresql postgresql-contrib');
console.log('- Windows: Download from https://www.postgresql.org/download/windows/'); 