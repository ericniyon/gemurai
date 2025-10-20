const https = require('https');
const http = require('http');

console.log('🧪 Simple Test - Login and Dashboard Access');
console.log('==========================================');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(data);
    }
    req.end();
  });
}

async function testLogin() {
  try {
    console.log('🔐 Testing login...');
    
    const loginData = JSON.stringify({
      email: 'admin@ihuzo.rw',
      password: 'Login@123'
    });

    const loginResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1/auth/superadmin/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      }
    }, loginData);

    console.log('📊 Login Status:', loginResponse.statusCode);
    console.log('📊 Login Success:', loginResponse.body.includes('"success":true'));

    if (loginResponse.statusCode === 200) {
      // Extract token from Set-Cookie header
      const setCookie = loginResponse.headers['set-cookie'];
      if (setCookie) {
        console.log('🍪 Cookie found:', setCookie[0].substring(0, 50) + '...');
        
        // Extract token value
        const cookieMatch = setCookie[0].match(/Gemurai_token=([^;]+)/);
        if (cookieMatch) {
          const token = cookieMatch[1];
          console.log('🔑 Token extracted:', token.substring(0, 50) + '...');
          
          // Test dashboard access
          console.log('\n🌐 Testing dashboard access...');
          const dashboardResponse = await makeRequest({
            hostname: 'localhost',
            port: 3000,
            path: '/superadmin/dashboard',
            method: 'GET',
            headers: {
              'Cookie': `Gemurai_token=${token}`
            }
          });

          console.log('📊 Dashboard Status:', dashboardResponse.statusCode);
          console.log('📊 Dashboard Location:', dashboardResponse.headers.location);
          
          if (dashboardResponse.statusCode === 200) {
            console.log('🎉 SUCCESS! Dashboard access working!');
          } else if (dashboardResponse.statusCode === 302) {
            console.log('⚠️  Redirect detected to:', dashboardResponse.headers.location);
          } else {
            console.log('❌ Unexpected dashboard response');
          }
        } else {
          console.log('❌ Could not extract token from cookie');
        }
      } else {
        console.log('❌ No Set-Cookie header found');
      }
    } else {
      console.log('❌ Login failed');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testLogin()
  .then(() => {
    console.log('\n✅ Test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }); 