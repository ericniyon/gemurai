const { PrismaClient } = require('@prisma/client');
const { jwtVerify, SignJWT } = require('jose');

const prisma = new PrismaClient();

console.log('🔍 Debugging Middleware Token Issue');
console.log('===================================');

async function debugMiddleware() {
  try {
    const email = "admin@ihuzo.rw";
    
    console.log(`🔍 Testing user: ${email}`);
    
    // Step 1: Get the user and generate a token manually
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        userRole: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return;
    }

    console.log(`✅ User found: ${user.name}`);
    console.log(`   Role: ${user.userRole?.role?.name}`);
    console.log(`   Permissions: ${user.userRole?.role?.rolePermissions?.length || 0}`);

    // Step 2: Generate a token manually using the same logic as the API
    const JWT_SECRET = process.env.JWT_SECRET;
    console.log(`🔑 JWT_SECRET available: ${!!JWT_SECRET}`);
    console.log(`🔑 JWT_SECRET length: ${JWT_SECRET?.length || 0}`);

    if (!JWT_SECRET) {
      console.log('❌ JWT_SECRET not found in environment');
      return;
    }

    const rolePermissions = user.userRole?.role?.rolePermissions?.map(rp => rp.permission.name) || [];
    
    const tokenPayload = {
      email: user.email,
      role: user.userRole?.role?.name || 'CONSUMER',
      name: user.name || "",
      permissions: rolePermissions,
      rolePermissions: rolePermissions,
      databasePermissions: rolePermissions,
      avatar: user.avatar
    };

    console.log(`📋 Token payload:`, {
      email: tokenPayload.email,
      role: tokenPayload.role,
      permissionsCount: tokenPayload.permissions.length
    });

    // Generate token using jose library (same as the actual code)
    const token = await new SignJWT(tokenPayload)
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(user.id)
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(new TextEncoder().encode(JWT_SECRET));

    console.log(`✅ Token generated: ${token.substring(0, 50)}...`);

    // Step 3: Verify the token manually using jose library
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
      console.log(`✅ Token verification successful:`, {
        email: payload.email,
        role: payload.role,
        permissionsCount: payload.permissions?.length || 0
      });
    } catch (error) {
      console.log(`❌ Token verification failed:`, error.message);
      return;
    }

    // Step 4: Test the token with the API
    console.log(`\n🌐 Testing token with superadmin login API...`);
    
    const response = await fetch('http://localhost:3000/api/v1/auth/superadmin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: 'Login@123'
      })
    });

    const data = await response.json();
    console.log(`📊 Login API Response:`, {
      status: response.status,
      success: data.success,
      hasUser: !!data.user,
      userRole: data.user?.role
    });

    if (data.success) {
      // Step 5: Test dashboard access with the cookie
      console.log(`\n🏠 Testing dashboard access...`);
      
      const dashboardResponse = await fetch('http://localhost:3000/superadmin/dashboard', {
        headers: {
          'Cookie': response.headers.get('set-cookie') || '',
        }
      });

      console.log(`📊 Dashboard Response:`, {
        status: dashboardResponse.status,
        location: dashboardResponse.headers.get('location'),
        contentType: dashboardResponse.headers.get('content-type')
      });

      // Step 6: Check if the cookie was set correctly
      const setCookieHeader = response.headers.get('set-cookie');
      console.log(`🍪 Set-Cookie header:`, setCookieHeader ? setCookieHeader.substring(0, 100) + '...' : 'None');

      if (setCookieHeader) {
        const cookieMatch = setCookieHeader.match(/Gemurai_token=([^;]+)/);
        if (cookieMatch) {
          const cookieToken = cookieMatch[1];
          console.log(`🍪 Cookie token: ${cookieToken.substring(0, 50)}...`);
          
          // Verify the cookie token using jose library
          try {
            const { payload: cookiePayload } = await jwtVerify(cookieToken, new TextEncoder().encode(JWT_SECRET));
            console.log(`✅ Cookie token verification:`, {
              email: cookiePayload.email,
              role: cookiePayload.role
            });
          } catch (error) {
            console.log(`❌ Cookie token verification failed:`, error.message);
          }
        }
      }
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debugMiddleware()
  .then(() => {
    console.log('\n✅ Debug completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Debug failed:', error);
    process.exit(1);
  }); 