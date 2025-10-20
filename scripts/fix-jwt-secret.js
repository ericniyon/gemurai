const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing JWT_SECRET inconsistency');
console.log('==================================');

async function fixJwtSecret() {
  try {
    const envPath = path.join(process.cwd(), '.env');
    const envLocalPath = path.join(process.cwd(), '.env.local');
    
    // Read the main .env file
    if (!fs.existsSync(envPath)) {
      console.log('❌ .env file not found');
      return;
    }
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    const jwtSecretMatch = envContent.match(/JWT_SECRET=(.+)/);
    
    if (!jwtSecretMatch) {
      console.log('❌ JWT_SECRET not found in .env file');
      return;
    }
    
    const jwtSecret = jwtSecretMatch[1];
    console.log(`📋 JWT_SECRET from .env: ${jwtSecret.substring(0, 20)}...`);
    
    // Read .env.local if it exists
    let envLocalContent = '';
    if (fs.existsSync(envLocalPath)) {
      envLocalContent = fs.readFileSync(envLocalPath, 'utf8');
      console.log('📄 .env.local file found');
    } else {
      console.log('📄 .env.local file not found, will create it');
    }
    
    // Check if JWT_SECRET already exists in .env.local
    const jwtSecretLocalMatch = envLocalContent.match(/JWT_SECRET=(.+)/);
    
    if (jwtSecretLocalMatch) {
      const currentLocalSecret = jwtSecretLocalMatch[1];
      console.log(`📋 Current JWT_SECRET in .env.local: ${currentLocalSecret.substring(0, 20)}...`);
      
      if (currentLocalSecret === jwtSecret) {
        console.log('✅ JWT_SECRET values are already consistent');
        return;
      } else {
        console.log('⚠️  JWT_SECRET values are different, updating .env.local...');
        // Replace the existing JWT_SECRET
        envLocalContent = envLocalContent.replace(/JWT_SECRET=.+/, `JWT_SECRET=${jwtSecret}`);
      }
    } else {
      console.log('➕ Adding JWT_SECRET to .env.local...');
      // Add JWT_SECRET to .env.local
      envLocalContent += `\nJWT_SECRET=${jwtSecret}\n`;
    }
    
    // Write the updated .env.local file
    fs.writeFileSync(envLocalPath, envLocalContent);
    console.log('✅ .env.local file updated successfully');
    
    // Verify the update
    const updatedContent = fs.readFileSync(envLocalPath, 'utf8');
    const updatedMatch = updatedContent.match(/JWT_SECRET=(.+)/);
    
    if (updatedMatch && updatedMatch[1] === jwtSecret) {
      console.log('✅ JWT_SECRET values are now consistent');
      console.log('🔄 Please restart your development server for changes to take effect');
    } else {
      console.log('❌ Failed to update JWT_SECRET in .env.local');
    }
    
  } catch (error) {
    console.error('❌ Error fixing JWT_SECRET:', error.message);
  }
}

fixJwtSecret()
  .then(() => {
    console.log('\n🎉 JWT_SECRET fix completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  }); 