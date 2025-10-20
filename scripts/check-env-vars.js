console.log('🔍 Checking Environment Variables');
console.log('================================');

// Load environment variables
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

console.log('🔑 JWT_SECRET from process.env:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('🔑 JWT_SECRET length:', process.env.JWT_SECRET?.length || 0);
console.log('🔑 JWT_SECRET starts with:', process.env.JWT_SECRET?.substring(0, 20) + '...');

// Check all environment files
const fs = require('fs');
const path = require('path');

const envFiles = ['.env', '.env.local', '.env.example'];
envFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`\n📁 ${file}:`);
    const content = fs.readFileSync(file, 'utf8');
    const jwtLine = content.split('\n').find(line => line.startsWith('JWT_SECRET='));
    if (jwtLine) {
      console.log(`   JWT_SECRET: ${jwtLine.substring(0, 30)}...`);
    } else {
      console.log(`   JWT_SECRET: NOT FOUND`);
    }
  } else {
    console.log(`\n📁 ${file}: NOT FOUND`);
  }
});

console.log('\n✅ Environment check completed!'); 