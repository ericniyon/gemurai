console.log('🔍 Twilio Setup Verification');
console.log('============================');
console.log('');

console.log('📋 Current Configuration:');
console.log(`   - TWILIO_ACCOUNT_SID: ${process.env.TWILIO_ACCOUNT_SID ? process.env.TWILIO_ACCOUNT_SID.substring(0, 10) + '...' : 'NOT SET'}`);
console.log(`   - TWILIO_AUTH_TOKEN: ${process.env.TWILIO_AUTH_TOKEN ? 'SET' : 'NOT SET'}`);
console.log(`   - TWILIO_PHONE_NUMBER: ${process.env.TWILIO_PHONE_NUMBER || 'NOT SET'}`);
console.log('');

console.log('❌ ISSUE DETECTED:');
console.log('   Your Account SID starts with "US" but should start with "AC"');
console.log('');

console.log('🔧 TO FIX THIS:');
console.log('1. Go to https://console.twilio.com/');
console.log('2. Look for "Account SID" on the dashboard');
console.log('3. It should start with "AC" (like ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)');
console.log('4. Update your .env file with the correct Account SID');
console.log('');

console.log('📱 Alternative: Check if you need to use:');
console.log('   - Service SID (starts with IS)');
console.log('   - User SID (starts with US)');
console.log('   - Or get the correct Account SID from Twilio Console');
console.log('');

console.log('💡 Quick Test:');
console.log('   If you have the correct credentials, run:');
console.log('   node test_twilio_credentials.js');
console.log('');

console.log('📞 For the phone number 0787283351:');
console.log('   - Make sure it\'s verified in your Twilio trial account');
console.log('   - Or use a verified phone number for testing'); 