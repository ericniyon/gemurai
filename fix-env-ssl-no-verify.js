const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

// Read the .env file
let envContent = fs.readFileSync(envPath, 'utf8');

// Fix DATABASE_URL - use no-verify to bypass certificate issues
envContent = envContent.replace(
  /DATABASE_URL=.*/,
  'DATABASE_URL="postgresql://postgres:UDqiJZUrqtayHFyqfxaBgmexvIHZxGQj@centerbeam.proxy.rlwy.net:12961/railway?sslmode=no-verify"'
);

// Fix DIRECT_URL - use no-verify to bypass certificate issues
envContent = envContent.replace(
  /DIRECT_URL=.*/,
  'DIRECT_URL="postgresql://postgres:UDqiJZUrqtayHFyqfxaBgmexvIHZxGQj@centerbeam.proxy.rlwy.net:12961/railway?sslmode=no-verify"'
);

// Write the updated content back
fs.writeFileSync(envPath, envContent);

console.log('✅ Updated .env file with sslmode=no-verify');
console.log('This bypasses SSL certificate validation (required for Railway proxy)');
