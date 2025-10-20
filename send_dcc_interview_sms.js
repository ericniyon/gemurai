// Script to send DCC interview SMS to multiple recipients
const phoneNumbers = [
  '785232904',
  '784243423',
  '780918720',
  '786844014',
  '789887481',
  '783643884',
  '784136439',
  '791597984',
  '780752816',
  '784066633',
  '786216841',
  '787783414',
  '790356131',
  '786336017',
  '785045918',
  '789782833',
  '793620558',
  '785054499',
  '790678279',
  '781977947',
  '784532082',
  '781891554',
  '782744441',
  '782562793',
  '790639978',
  '793126962',
  '793252474',
  '784036523',
  '786534938',
  '784620246',
  '792491805',
  '782789800',
  '781708727',
  '782486801',
  '790754091',
  '798924017',
  '790140925',
  '783027198',
  '786176818',
  '785815375',
  '791822306',
  '789168861',
  '786680447',
  '795736155',
  '793353481'
];

const message = "Turagushimiye kubwo kwiyandikisha kwinjira mu mushinga wa DCC! Tunejejwe no kugutumira mu kiganiro cyimbitse kijyanye n'umushinga giteganyijwe ejo taliki ya 18/07/2025. Usabwe kugera aho ibiganiro bizabera saa tatu za mugitondo (9h00). Abakozi b'umushinga baraza kuguhamagara bakuneysha aho ibiganiro bizabera.  Nyamuneka uzibukwe kwitwaza indagamanota cg impamyabunyi washyize muri system n'indangamuntu yawe. Mugire amahoro!";

async function sendDCCInterviewSMS() {
  console.log('🚀 Starting DCC Interview SMS sending...');
  console.log(`📤 Sending SMS to ${phoneNumbers.length} recipients`);
  console.log(`📝 Message: ${message.substring(0, 100)}...`);
  console.log('');
  
  let successCount = 0;
  let failedCount = 0;
  const results = [];
  
  for (let i = 0; i < phoneNumbers.length; i++) {
    const phone = phoneNumbers[i];
    
    try {
      // Format phone number for Rwanda
      const formattedPhone = phone.startsWith("+") ? phone : `+250${phone.replace(/[^0-9]/g, "")}`;
      
      console.log(`📤 Sending SMS ${i + 1}/${phoneNumbers.length} to ${formattedPhone}...`);
      
      const response = await fetch('http://localhost:3000/api/test/sms/custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phone,
          message: message
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        successCount++;
        console.log(`✅ SMS sent successfully to ${formattedPhone}`);
        results.push({
          phone: formattedPhone,
          success: true,
          messageId: data.sid
        });
      } else {
        failedCount++;
        console.log(`❌ Failed to send SMS to ${formattedPhone}: ${data.message}`);
        results.push({
          phone: formattedPhone,
          success: false,
          error: data.message
        });
      }
      
      // Wait between messages to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      failedCount++;
      console.log(`❌ Error sending SMS to ${phone}: ${error.message}`);
      results.push({
        phone: phone,
        success: false,
        error: error.message
      });
    }
  }
  
  console.log('');
  console.log('📊 SMS Sending Summary:');
  console.log(`✅ Successfully sent: ${successCount}`);
  console.log(`❌ Failed: ${failedCount}`);
  console.log(`📱 Total recipients: ${phoneNumbers.length}`);
  
  if (failedCount > 0) {
    console.log('\n❌ Failed SMS details:');
    results.filter(r => !r.success).forEach(result => {
      console.log(`   - ${result.phone}: ${result.error}`);
    });
  }
  
  console.log('\n📋 All results:');
  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${index + 1}. ${result.phone}${result.success ? ` (SID: ${result.messageId})` : ` (Error: ${result.error})`}`);
  });
}

// Run the script
sendDCCInterviewSMS().catch(console.error); 