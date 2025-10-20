// Phone numbers to send SMS to
const phoneNumbers = [
  "785794283",
  "791478477",
  "790401267",
  "786849328",
  "790319152",
  "790310080",
  "780782706",
  "796654634",
  "781434740",
  "791725746",
  "790756415",
  "788444496",
  "792994439",
  "794322491",
  "788764197",
  "796675722",
  "794089956",
  "786156498",
  "787488521",
  "738527713",
  "790084479",
  "782298409",
  "798079314",
  "784004783",
  "780302033",
  "793627351",
  "780184530",
  "798754957",
  "798573871",
  "784868689",
  "796534907",
  "786289291",
  "790472353",
  "790140925",
  "791011064",
  "798688910",
  "794305308",
  "789227245",
  "729360681",
  "786498389",
  "787745619",
  "785894746",
  "784785405",
  "780466059",
  "789007472",
  "780957230",
  "798757364"
];

// Remove duplicates
const uniquePhoneNumbers = [...new Set(phoneNumbers)];

const message = `Turagushimiye kubwo kwiyandikisha kwinjira mu mushinga wa DCC!
Tunejejwe no kugutumira mu kiganiro cyimbitse kijyanye n’umushinga giteganyijwe uyumunsi taliki ya 17/07/2025. Usabwe kugera aho ibiganiro bizabera saa sita n’igice (12h30). Abakozi b’umushinga baraza kuguhamagara bakuneysha aho ibiganiro bizabera.  Nyamuneka uzibukwe kwitwaza indagamanota cg impamyabunyi washyize muri system n’indangamuntu yawe.
Mugire amahoro!`;

async function sendSMS() {
  console.log(`📱 Sending SMS to ${uniquePhoneNumbers.length} recipients`);
  console.log(`📝 Message: ${message.substring(0, 100)}...`);
  
  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (let i = 0; i < uniquePhoneNumbers.length; i++) {
    const phoneNumber = uniquePhoneNumbers[i];
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+250${phoneNumber}`;
    
    try {
      console.log(`📤 Sending SMS ${i + 1}/${uniquePhoneNumbers.length} to ${formattedPhone}`);
      
      const response = await fetch('http://localhost:3000/api/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: formattedPhone,
          message: message,
          from: 'Gemurai'
        })
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        console.log(`✅ SMS sent successfully to ${formattedPhone}`);
        successCount++;
      } else {
        console.log(`❌ Failed to send SMS to ${formattedPhone}: ${result.message || 'Unknown error'}`);
        errorCount++;
        errors.push({ phone: formattedPhone, error: result.message || 'Unknown error' });
      }

      // Add a small delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.log(`❌ Error sending SMS to ${formattedPhone}: ${error.message}`);
      errorCount++;
      errors.push({ phone: formattedPhone, error: error.message });
    }
  }

  console.log('\n📊 SMS Sending Summary:');
  console.log(`✅ Successfully sent: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log(`📱 Total recipients: ${uniquePhoneNumbers.length}`);
  
  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(({ phone, error }) => {
      console.log(`  - ${phone}: ${error}`);
    });
  }
}

// Run the SMS sending
sendSMS().catch(console.error); 