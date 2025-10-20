import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function testApplicationSMS() {
  console.log('🔍 Testing Application Submission SMS...\n');

  const testData = {
    phone: '+250787283351', // Added Rwanda country code (+250)
    name: 'Test Applicant'
  };

  try {
    console.log(`Sending test SMS to ${testData.phone}...`);
    
    const response = await axios.post(
      'http://localhost:3000/api/sms/application-submission',
      testData
    );

    if (response.data.success) {
      console.log('\n✅ SMS sent successfully!');
      console.log('Message details:');
      console.log(`- Message ID: ${response.data.messageId}`);
      console.log(`- Status: Success`);
      console.log(`- To: ${testData.phone}`);
    } else {
      console.error('\n❌ Failed to send SMS:', response.data.message);
    }
  } catch (error: any) {
    console.error('\n❌ Error sending SMS:', error.response?.data || error.message);
    if (error.response?.data?.details) {
      console.error('Additional details:', error.response.data.details);
    }
  }
}

testApplicationSMS().catch(console.error); 