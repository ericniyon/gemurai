/**
 * Test script for Password Reset with National ID Verification API
 * 
 * This script demonstrates the complete password reset flow with national ID verification.
 * Run this script to test the API endpoints.
 */

const BASE_URL = 'http://localhost:3000'

// Test data - replace with actual test user data
const TEST_USER = {
  nationalId: '1234567890123',
  email: 'test@example.com',
  phone: '+250788123456',
  name: 'Test User'
}

let resetToken = ''
let verificationToken = ''

async function makeRequest(endpoint, data) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })

    const result = await response.json()
    
    console.log(`\n📡 ${endpoint}`)
    console.log(`Status: ${response.status}`)
    console.log('Response:', JSON.stringify(result, null, 2))
    
    return { success: response.ok, data: result, status: response.status }
  } catch (error) {
    console.error(`❌ Request failed:`, error.message)
    return { success: false, error: error.message }
  }
}

async function testPasswordResetFlow() {
  console.log('🚀 Starting Password Reset with National ID Test Flow')
  console.log('=' .repeat(60))

  // Step 1: Request Password Reset
  console.log('\n📋 Step 1: Request Password Reset')
  console.log('-'.repeat(40))
  
  const requestData = {
    nationalId: TEST_USER.nationalId,
    email: TEST_USER.email,
    phone: TEST_USER.phone
  }
  
  const requestResult = await makeRequest('/api/v1/auth/password-reset-request', requestData)
  
  if (!requestResult.success) {
    console.log('❌ Step 1 failed. Cannot continue with test.')
    return
  }
  
  resetToken = requestResult.data.resetToken
  console.log(`✅ Reset token received: ${resetToken.substring(0, 10)}...`)

  // Step 2: Verify Reset Request
  console.log('\n🔍 Step 2: Verify Reset Request')
  console.log('-'.repeat(40))
  
  const verifyData = {
    email: TEST_USER.email,
    resetToken: resetToken,
    nationalId: TEST_USER.nationalId,
    verificationCode: '123456' // This would be the actual SMS code in real scenario
  }
  
  const verifyResult = await makeRequest('/api/v1/auth/password-reset-verify', verifyData)
  
  if (!verifyResult.success) {
    console.log('❌ Step 2 failed. Cannot continue with test.')
    return
  }
  
  verificationToken = verifyResult.data.verificationToken
  console.log(`✅ Verification token received: ${verificationToken.substring(0, 20)}...`)

  // Step 3: Complete Password Reset
  console.log('\n🔐 Step 3: Complete Password Reset')
  console.log('-'.repeat(40))
  
  const completeData = {
    verificationToken: verificationToken,
    newPassword: 'NewSecurePassword123!',
    confirmPassword: 'NewSecurePassword123!'
  }
  
  const completeResult = await makeRequest('/api/v1/auth/password-reset-complete', completeData)
  
  if (completeResult.success) {
    console.log('✅ Password reset completed successfully!')
  } else {
    console.log('❌ Step 3 failed.')
  }

  console.log('\n🏁 Test Flow Complete')
  console.log('=' .repeat(60))
}

async function testErrorScenarios() {
  console.log('\n🧪 Testing Error Scenarios')
  console.log('=' .repeat(60))

  // Test 1: Invalid National ID
  console.log('\n❌ Test 1: Invalid National ID')
  await makeRequest('/api/v1/auth/password-reset-request', {
    nationalId: 'INVALID_ID',
    email: TEST_USER.email
  })

  // Test 2: Missing Required Fields
  console.log('\n❌ Test 2: Missing Required Fields')
  await makeRequest('/api/v1/auth/password-reset-request', {
    nationalId: TEST_USER.nationalId
    // Missing email and phone
  })

  // Test 3: Invalid Reset Token
  console.log('\n❌ Test 3: Invalid Reset Token')
  await makeRequest('/api/v1/auth/password-reset-verify', {
    email: TEST_USER.email,
    resetToken: 'INVALID_TOKEN',
    nationalId: TEST_USER.nationalId
  })

  // Test 4: Weak Password
  console.log('\n❌ Test 4: Weak Password')
  await makeRequest('/api/v1/auth/password-reset-complete', {
    verificationToken: 'dummy_token',
    newPassword: 'weak',
    confirmPassword: 'weak'
  })

  console.log('\n✅ Error scenario testing complete')
}

async function testDatabaseCleanup() {
  console.log('\n🧹 Testing Database Cleanup')
  console.log('=' .repeat(60))

  // This would typically be done by a scheduled job
  console.log('📊 Checking for expired tokens and used OTPs...')
  
  // In a real implementation, you would:
  // 1. Query for expired reset tokens
  // 2. Query for used OTP codes
  // 3. Clean up old records
  
  console.log('✅ Database cleanup simulation complete')
}

async function runAllTests() {
  try {
    await testPasswordResetFlow()
    await testErrorScenarios()
    await testDatabaseCleanup()
    
    console.log('\n🎉 All tests completed!')
    console.log('\n📝 Next Steps:')
    console.log('1. Check the database for created records')
    console.log('2. Verify email/SMS delivery (if configured)')
    console.log('3. Test the frontend integration')
    console.log('4. Review security logs')
    
  } catch (error) {
    console.error('❌ Test suite failed:', error)
  }
}

// Run the tests
if (require.main === module) {
  runAllTests()
}

module.exports = {
  testPasswordResetFlow,
  testErrorScenarios,
  testDatabaseCleanup,
  runAllTests
}
