import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { phone, message } = await request.json();

    if (!phone || !message) {
      return NextResponse.json(
        { success: false, message: "Phone and message are required" },
        { status: 400 }
      );
    }

    // Format phone number for Rwanda
    const formattedPhone = phone.startsWith("+") ? phone : `+250${phone.replace(/^0/, "")}`;
    
    console.log(`📱 Attempting to send real SMS to: ${formattedPhone}`);
    console.log(`📱 Message: ${message}`);

    // For now, we'll use a simple HTTP request to a free SMS service
    // This is a placeholder - you'll need to set up a real SMS service
    
    // Option 1: Use TextLocal (free 100 SMS/day)
    const textLocalApiKey = process.env.TEXTLOCAL_API_KEY;
    if (textLocalApiKey) {
      try {
        const response = await fetch('https://api.textlocal.in/send/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            apikey: textLocalApiKey,
            numbers: formattedPhone,
            message: message,
            sender: 'TXTLCL'
          })
        });
        
        const result = await response.json();
        console.log('📊 TextLocal response:', result);
        
        if (result.status === 'success') {
          return NextResponse.json({
            success: true,
            message: "SMS sent successfully via TextLocal",
            data: result
          });
        }
      } catch (error) {
        console.error('❌ TextLocal error:', error);
      }
    }

    // Option 2: Use Vonage (Nexmo) - $2 free credit
    const vonageApiKey = process.env.VONAGE_API_KEY;
    const vonageApiSecret = process.env.VONAGE_API_SECRET;
    if (vonageApiKey && vonageApiSecret) {
      try {
        const response = await fetch('https://rest.nexmo.com/sms/json', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            api_key: vonageApiKey,
            api_secret: vonageApiSecret,
            to: formattedPhone,
            from: 'Gemurai',
            text: message
          })
        });
        
        const result = await response.json();
        console.log('📊 Vonage response:', result);
        
        if (result.messages && result.messages[0].status === '0') {
          return NextResponse.json({
            success: true,
            message: "SMS sent successfully via Vonage",
            data: result
          });
        }
      } catch (error) {
        console.error('❌ Vonage error:', error);
      }
    }

    // Fallback: Return demo response
    return NextResponse.json({
      success: true,
      message: "SMS service not configured - this is a demo response",
      demo: true,
      phone: formattedPhone,
      message: message,
      note: "To send real SMS, configure TextLocal or Vonage API keys"
    });

  } catch (error: any) {
    console.error("❌ Real SMS error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to send SMS" },
      { status: 500 }
    );
  }
}
