import twilio from 'twilio';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get environment variables with type assertions
const accountSid = process.env.TWILIO_ACCOUNT_SID as string;
const authToken = process.env.TWILIO_AUTH_TOKEN as string;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER as string;

// Check if required environment variables are set
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

async function testTwilio() {
  console.log('Checking Twilio Configuration...');
  console.log('Account SID:', accountSid ? '✓ Set' : '✗ Missing');
  console.log('Auth Token:', authToken ? '✓ Set' : '✗ Missing');
  console.log('Phone Number:', twilioPhoneNumber ? '✓ Set' : '✗ Missing');

  try {
    // Test authentication by getting account info
    const account = await client.api.accounts(accountSid).fetch();
    console.log('\n✅ Successfully authenticated with Twilio');
    console.log(`Account Status: ${account.status}`);
    console.log(`Account Type: ${account.type}`);

    // Test sending SMS
    const message = await client.messages.create({
      body: 'This is a test message from your Gemurai platform!',
      to: '+250787283351',
      from: twilioPhoneNumber,
    });

    console.log('\n✅ Successfully sent test SMS');
    console.log(`Message SID: ${message.sid}`);
    console.log(`Message Status: ${message.status}`);
  } catch (error: any) {
    console.error('\n❌ Twilio test failed:', error.message);
    if (error.code) {
      console.error(`Error Code: ${error.code}`);
    }
    process.exit(1);
  }
}

testTwilio(); 