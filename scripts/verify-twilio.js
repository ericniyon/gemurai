require('dotenv').config();
const twilio = require('twilio');

// Get environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

console.log('Checking Twilio Configuration...');
console.log('Account SID:', accountSid ? '✓ Set' : '✗ Missing');
console.log('Auth Token:', authToken ? '✓ Set' : '✗ Missing');
console.log('Phone Number:', twilioPhoneNumber ? '✓ Set' : '✗ Missing');

if (!accountSid || !authToken || !twilioPhoneNumber) {
  console.error('\n❌ Missing required Twilio credentials!');
  console.log('\nPlease add the following to your .env file:');
  console.log('TWILIO_ACCOUNT_SID=your_account_sid');
  console.log('TWILIO_AUTH_TOKEN=your_auth_token');
  console.log('TWILIO_PHONE_NUMBER=your_twilio_phone_number');
  process.exit(1);
}

// Initialize Twilio client
const client = twilio(accountSid, authToken);

// Test sending SMS
async function testSMS() {
  try {
    console.log('\nTesting SMS sending...');
    console.log('Using phone number:', twilioPhoneNumber);
    const message = await client.messages.create({
      body: 'Test message from Gemurai platform',
      to: '+250787283351',
      from: twilioPhoneNumber
    });

    console.log('\n✅ SMS sent successfully!');
    console.log('Message SID:', message.sid);
    console.log('Status:', message.status);
  } catch (error) {
    console.error('\n❌ Error sending SMS:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
  }
}

testSMS(); 