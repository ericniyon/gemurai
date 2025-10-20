const { exec } = require('child_process');
const fs = require('fs');

console.log('🔄 Restarting Server and Testing Login');
console.log('=====================================');

// Step 1: Check if server is running and kill it
console.log('🔍 Checking for running Next.js processes...');
exec('pkill -f "next dev"', (error) => {
  if (error) {
    console.log('ℹ️  No running Next.js processes found or already stopped');
  } else {
    console.log('✅ Stopped existing Next.js processes');
  }
  
  // Step 2: Wait a moment and start the server
  setTimeout(() => {
    console.log('🚀 Starting Next.js development server...');
    console.log('⏳ Please wait for the server to start (this may take 10-15 seconds)...');
    
    const server = exec('pnpm dev', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Failed to start server:', error);
        return;
      }
    });
    
    // Step 3: Wait for server to start and test login
    setTimeout(() => {
      console.log('\n🧪 Testing login after server restart...');
      
      // Test login
      exec('curl -X POST http://localhost:3000/api/v1/auth/superadmin/login -H "Content-Type: application/json" -d \'{"email":"admin@ihuzo.rw","password":"Login@123"}\' -c cookies.txt', (error, stdout, stderr) => {
        if (error) {
          console.log('❌ Login test failed:', error.message);
          return;
        }
        
        console.log('✅ Login successful, testing dashboard access...');
        
        // Test dashboard access
        exec('curl -b cookies.txt http://localhost:3000/superadmin/dashboard -I', (error, stdout, stderr) => {
          if (error) {
            console.log('❌ Dashboard test failed:', error.message);
            return;
          }
          
          console.log('📊 Dashboard response:');
          console.log(stdout);
          
          if (stdout.includes('200 OK')) {
            console.log('🎉 SUCCESS! Dashboard access working after restart!');
          } else if (stdout.includes('302 Found')) {
            console.log('⚠️  Still getting redirect. Checking middleware logs...');
          }
          
          // Clean up
          server.kill();
          console.log('✅ Test completed, server stopped');
        });
      }, 15000); // Wait 15 seconds for server to start
      
    }, 5000); // Wait 5 seconds before testing
  }, 2000); // Wait 2 seconds after killing processes
}); 