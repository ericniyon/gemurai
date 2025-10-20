#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Quick Database Fix - Setting up local SQLite database');
console.log('========================================================');

// Create .env file with SQLite configuration
const envContent = `# Database Configuration - SQLite (Local Development)
DATABASE_URL="file:./dev.db"
DIRECT_URL="file:./dev.db"

# Next Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-jwt-key-change-this-in-production"

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

const envPath = path.join(process.cwd(), '.env');
fs.writeFileSync(envPath, envContent);
console.log('✅ Created .env file with SQLite configuration');

console.log('\n📋 Next Steps:');
console.log('1. Run: pnpm prisma generate');
console.log('2. Run: pnpm prisma db push');
console.log('3. Run: pnpm dev');
console.log('4. Test: curl http://localhost:3000/api/health');

console.log('\n💡 This will create a local SQLite database file (dev.db)');
console.log('   This is perfect for development and testing.');
console.log('   For production, you should use PostgreSQL.'); 