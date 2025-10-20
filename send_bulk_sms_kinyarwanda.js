// Send bulk SMS to DCC applicants with Kinyarwanda message
const phoneNumbers = [
  "07912 036 93",
  "07846 374 76", 
  "07893 420 75",
  "07867 260 72",
  "07846 879 45",
  "07384 973 11",
  "07856 459 20",
  "07857 942 83",
  "07914 784 77",
  "07904 012 67",
  "07868 493 28",
  "07903 191 52",
  "07903 100 80",
  "07807 827 06",
  "07852 329 04",
  "07842 434 23",
  "07809 187 20",
  "07868 440 14",
  "07898 874 81",
  "07836 438 84",
  "07841 364 39",
  "07915 979 84",
  "07807 528 16",
  "07840 666 33",
  "07811 362 17",
  "07877 590 60",
  "07894 629 53",
  "07856 739 50",
  "07829 646 66",
  "07932 755 55",
  "07879 110 51",
  "07894 472 14",
  "07980 793 14",
  "784004783",
  "07803 020 33",
  "07936 273 51",
  "07801 845 30",
  "07931 411 38",
  "789295893",
  "07988 693 99",
  "07848 986 50",
  "07846 169 33",
  "07890 017 02",
  "07987 023 29",
  "07966 546 34",
  "07814 347 40",
  "07917 257 46",
  "07907 564 15",
  "07884 444 96",
  "07877 834 14",
  "07903 561 31",
  "07863 360 17",
  "07850 459 18",
  "07897 828 33",
  "07872 940 45",
  "07905 281 99",
  "07808 673 11",
  "07284 017 09",
  "07841 256 91",
  "07964 355 88",
  "07931 962 64",
  "07829 153 86",
  "07929 944 39",
  "07943 224 91",
  "07887 641 97",
  "07966 757 22",
  "07940 899 56",
  "07936 205 58",
  "07850 544 99",
  "07906 782 79",
  "07819 779 47",
  "07845 320 82",
  "07818 915 54",
  "07827 444 41",
  "07906 399 78",
  "07851 962 75",
  "07808 987 81",
  "07805 939 94",
  "07910 833 50",
  "07918 008 61",
  "07392 829 48",
  "07865 692 27",
  "07848 686 89",
  "07965 349 07",
  "07862 892 91",
  "07904 723 53",
  "07901 409 25",
  "07910 110 64",
  "07989 240 17",
  "07901 409 25",
  "07830 271 98",
  "07861 768 18",
  "07858 153 75",
  "07918 223 06",
  "07891 688 61",
  "07866 804 47",
  "07957 361 55",
  "07953 903 01",
  "07228 044 06",
  "07823 969 30",
  "07982 121 98",
  "07866 139 79",
  "07982 245 30",
  "07816 179 84",
  "07986 889 10",
  "07943 053 08",
  "07892 272 45",
  "07293 606 81",
  "07864 983 89",
  "07877 456 19",
  "07858 947 46",
  "07985 781 30",
  "07842 751 65",
  "07865 349 38",
  "07865 349 38",
  "07250 563 45",
  "07869 588 54",
  "07812 054 05",
  "07861 564 98",
  "07861 564 98",
  "07874 885 21",
  "07385 277 13",
  "07900 844 79",
  "07822 984 09",
  "07931 269 62",
  "07932 524 74",
  "07840 365 23",
  "07865 349 38",
  "07846 202 46",
  "07924 918 05",
  "07827 898 00",
  "07817 087 27",
  "07824 868 01",
  "07907 540 91",
  "07855 445 62",
  "07842 347 14",
  "07803 409 94",
  "07842 347 14",
  "07917 724 95",
  "07896 031 71",
  "07866 682 37",
  "07847 854 05",
  "07804 660 59",
  "07890 074 72",
  "07809 572 30",
  "07987 573 64",
  "07933 534 81",
  "07987 549 57",
  "07985 738 71",
  "07862 168 41",
  "07825 627 93",
  "07819 660 55",
  "07910 831 85",
  "07804 409 57",
  "07852 328 65",
  "07807 478 52",
  "07853 234 95",
  "07892 161 11",
  "07841 456 30",
  "07871 757 44",
  "07874 947 35",
  "07887 070 24",
  "07832 871 43",
  "07883 207 38",
  "07860 422 81",
  "07843 300 07",
  "07810 595 29",
  "07907 686 69",
  "07260 393 80"
];

const message = `Turagushimiye kubwo kwiyandikisha kwinjira mu mushinga wa DCC!
Tunejejwe no kugutumira mu kiganiro cyimbitse kijyanye n'umushinga giteganyijwe  Usabwe kugera aho ibiganiro bizabera . Abakozi b'umushinga baraza kuguhamagara bakuneysha aho ibiganiro bizabera.  Nyamuneka uzibukwe kwitwaza indagamanota cg impamyabunyi washyize muri system n'indangamuntu yawe.
Mugire amahoro!`;

async function sendBulkSMS() {
  try {
    console.log('📱 Gemurai Bulk SMS - DCC Project');
    console.log('================================');
    console.log('');
    console.log('📋 Message Preview:');
    console.log('==================');
    console.log(`From: Gemurai`);
    console.log(`To: ${phoneNumbers.length} recipients`);
    console.log(`Message: ${message}`);
    console.log('');
    console.log('📞 Phone Numbers:');
    console.log('================');
    phoneNumbers.forEach((phone, index) => {
      console.log(`${index + 1}. ${phone}`);
    });
    console.log('');
    console.log(`📊 Summary:`);
    console.log(`   - Total recipients: ${phoneNumbers.length}`);
    console.log(`   - Message length: ${message.length} characters`);
    console.log(`   - Estimated cost: ~${Math.ceil(phoneNumbers.length * 0.05)} USD`);
    console.log('');
    
    // Ask for confirmation
    console.log('❓ Do you want to proceed with sending SMS? (y/n)');
    console.log('   This will send SMS to all the above phone numbers.');
    console.log('   Type "y" to continue or "n" to cancel.');
    
    // For now, let's just show the preview
    console.log('');
    console.log('✅ Preview completed. To actually send SMS, run:');
    console.log('   node send_bulk_sms_kinyarwanda.js --send');
    console.log('');
    console.log('📱 Sample SMS that will be sent:');
    console.log('================================');
    console.log(`From: Gemurai`);
    console.log(`To: +250791203693`);
    console.log(`Message: ${message}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function actuallySendSMS() {
  try {
    console.log('🚀 Starting bulk SMS sending...');
    console.log(`📤 Sending SMS to ${phoneNumbers.length} recipients`);
    console.log(`📝 Message: ${message}`);
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
    console.log('📊 Bulk SMS Results:');
    console.log('====================');
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${failedCount}`);
    console.log(`📊 Success rate: ${((successCount / phoneNumbers.length) * 100).toFixed(1)}%`);
    console.log('');
    
    if (successCount > 0) {
      console.log('🎉 Bulk SMS campaign completed successfully!');
      console.log(`📱 ${successCount} recipients received the DCC project message.`);
    } else {
      console.log('❌ No SMS were sent successfully. Please check your configuration.');
    }
    
  } catch (error) {
    console.error('❌ Error in bulk SMS sending:', error.message);
  }
}

// Check if --send flag is provided
const shouldSend = process.argv.includes('--send');

if (shouldSend) {
  actuallySendSMS();
} else {
  sendBulkSMS();
} 