import { NextRequest, NextResponse } from "next/server"
import sgMail from "@sendgrid/mail"

export async function POST(request: NextRequest) {
  try {
    const { apiKey, testEmail } = await request.json()
    
    if (!apiKey || !testEmail) {
      return NextResponse.json(
        { success: false, message: "API key and test email are required" },
        { status: 400 }
      )
    }

    // Set the API key
    sgMail.setApiKey(apiKey)

    // Test email configuration
    const msg = {
      to: testEmail,
      from: {
        email: "info@dbi.rw",
        name: "IHUZO Platform Test"
      },
      subject: "SendGrid API Key Test",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">SendGrid API Key Test</h2>
          <p>This is a test email to verify that your SendGrid API key is working correctly.</p>
          <p><strong>Test Details:</strong></p>
          <ul>
            <li>API Key: ${apiKey.substring(0, 10)}...</li>
            <li>Test Email: ${testEmail}</li>
            <li>Timestamp: ${new Date().toISOString()}</li>
          </ul>
          <p>If you received this email, your SendGrid API key is working properly!</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            This is an automated test email from the IHUZO Platform.
          </p>
        </div>
      `,
      trackingSettings: {
        clickTracking: {
          enable: false,
          enableText: false
        },
        openTracking: {
          enable: false
        }
      }
    }

    console.log(`🧪 Testing SendGrid API key with email: ${testEmail}`)
    
    const response = await sgMail.send(msg)
    const messageId = response[0]?.headers?.["x-message-id"] || "unknown"

    console.log(`✅ Test email sent successfully! Message ID: ${messageId}`)

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully!",
      messageId: messageId,
      details: {
        to: testEmail,
        from: "info@dbi.rw",
        subject: "SendGrid API Key Test",
        timestamp: new Date().toISOString()
      }
    })

  } catch (error: any) {
    console.error("❌ SendGrid test failed:", error)
    
    // Provide detailed error information
    let errorMessage = "Failed to send test email"
    let errorDetails = {}

    if (error.response) {
      // SendGrid API error
      errorDetails = {
        statusCode: error.response.statusCode,
        body: error.response.body,
        headers: error.response.headers
      }
      
      if (error.response.body?.errors) {
        errorMessage = error.response.body.errors[0]?.message || errorMessage
      }
    } else if (error.message) {
      errorMessage = error.message
    }

    return NextResponse.json(
      { 
        success: false, 
        message: errorMessage,
        error: errorDetails
      },
      { status: 500 }
    )
  }
} 