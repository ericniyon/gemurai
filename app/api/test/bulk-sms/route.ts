import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    console.log('📱 Bulk SMS test endpoint called');
    
    // Check environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;
    
    console.log('📋 Environment check:');
    console.log(`   - Account SID: ${accountSid ? accountSid.substring(0, 10) + '...' : 'NOT SET'}`);
    console.log(`   - Auth Token: ${authToken ? 'SET' : 'NOT SET'}`);
    console.log(`   - From Number: ${fromNumber || 'NOT SET'}`);
    
    // Validate Twilio credentials
    if (!accountSid?.startsWith("AC") || !authToken || !fromNumber) {
      console.error("❌ Invalid or missing Twilio credentials");
      return NextResponse.json(
        { 
          success: false, 
          message: "SMS service not properly configured",
          details: {
            hasSid: !!accountSid,
            hasToken: !!authToken,
            hasPhone: !!fromNumber,
            sidFormat: accountSid ? accountSid.substring(0, 2) : 'NOT SET'
          }
        },
        { status: 500 }
      );
    }

    // Initialize Twilio client
    const twilioClient = twilio(accountSid, authToken);
    
    const { applicants, message } = await request.json();
    
    if (!applicants || !Array.isArray(applicants) || !message) {
      return NextResponse.json(
        { success: false, message: "Invalid request data" },
        { status: 400 }
      );
    }

    console.log(`📤 Sending bulk SMS to ${applicants.length} applicants`);
    console.log(`📝 Message: ${message}`);

    const results = [];
    let successCount = 0;

    // Send SMS to each applicant
    for (const applicant of applicants) {
      try {
        // Extract phone number from applicant data
        const phone = applicant.formData?.['Phone Number'] || 
                     applicant.formData?.q10 || 
                     applicant.formData?.q8 || 
                     applicant.phone;
        
        if (!phone) {
          results.push({
            applicantId: applicant.id,
            phone: 'N/A',
            success: false,
            error: 'No phone number found'
          });
          continue;
        }

        // Format phone number for Rwanda
        const formattedPhone = phone.startsWith("+") ? phone : `+250${phone.replace(/[^0-9]/g, "")}`;
        
        console.log(`📞 Sending SMS to ${formattedPhone}...`);

        // Send SMS
        const result = await twilioClient.messages.create({
          body: message,
          to: formattedPhone,
          from: fromNumber
        });

        results.push({
          applicantId: applicant.id,
          phone: formattedPhone,
          success: true,
          messageId: result.sid,
          status: result.status
        });
        
        successCount++;
        console.log(`✅ SMS sent successfully to ${formattedPhone}`);
        
      } catch (error) {
        console.error(`❌ Failed to send SMS to applicant ${applicant.id}:`, error.message);
        results.push({
          applicantId: applicant.id,
          phone: applicant.phone || 'N/A',
          success: false,
          error: error.message
        });
      }
      
      // Wait a bit between messages to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`📊 Bulk SMS completed: ${successCount}/${applicants.length} successful`);

    return NextResponse.json({
      success: true,
      message: `Bulk SMS completed: ${successCount}/${applicants.length} successful`,
      data: {
        total: applicants.length,
        successful: successCount,
        failed: applicants.length - successCount,
        results: results
      }
    });

  } catch (error) {
    console.error("❌ Bulk SMS error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to send bulk SMS"
      },
      { status: 500 }
    );
  }
} 