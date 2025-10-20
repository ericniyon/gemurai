import axios from 'axios';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env') });

const TEST_PHONE = '+250787283351'; // The phone number you provided
const TEST_MESSAGE = 'Hello! This is a test message from your Gemurai platform using Twilio.';

async function testSMS() {
  try {
    // Check environment variables first
    console.log('Checking environment variables...');
    const envVars = {
      TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
      TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER
    };

    const missingVars = Object.entries(envVars)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      console.error('❌ Missing environment variables:', missingVars.join(', '));
      console.log('\nPlease add these variables to your .env file:');
      console.log(`
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here
      `);
      return;
    }

    console.log('✓ Environment variables loaded successfully');
    console.log('Testing SMS sending...');
    console.log(`Target phone number: ${TEST_PHONE}`);
    
    const response = await axios.post('http://localhost:3000/api/test/sms', {
      phone: TEST_PHONE,
      message: TEST_MESSAGE
    });

    if (response.data.success) {
      console.log('✓ SMS sent successfully!');
      console.log('Message details:');
      console.log('- ID:', response.data.messageId);
      console.log('- Status:', response.data.status);
      console.log('- To:', response.data.to);
      console.log('- From:', response.data.from);
    } else {
      console.error('❌ Failed to send SMS:', response.data.error);
    }
  } catch (error: any) {
    console.error('❌ Error sending SMS:', error.response?.data || error.message);
    if (error.response?.data?.twilioError) {
      console.error('Twilio Error:', error.response.data.twilioError);
    }
  }
}

testSMS();