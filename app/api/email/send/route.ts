import { type NextRequest, NextResponse } from "next/server"
import { EmailTemplate } from "@/types/email"
import sgMail from "@sendgrid/mail"

// Initialize SendGrid
if (process.env.TWILIO_SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.TWILIO_SENDGRID_API_KEY)
}

export async function POST(request: NextRequest) {
  try {
    const emailTemplate = await request.json() as EmailTemplate

    if (!emailTemplate.to || !emailTemplate.subject || !emailTemplate.html) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate SendGrid configuration
    if (!process.env.TWILIO_SENDGRID_API_KEY) {
      return NextResponse.json(
        { success: false, message: "SendGrid API key not configured" },
        { status: 500 }
      )
    }

    if (!process.env.TWILIO_FROM_EMAIL) {
      return NextResponse.json(
        { success: false, message: "From email not configured" },
        { status: 500 }
      )
    }

    // Send email using SendGrid
    const msg = {
      to: emailTemplate.to,
      from: {
        email: process.env.TWILIO_FROM_EMAIL,
        name: process.env.TWILIO_FROM_NAME || "Gemurai Platform"
      },
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      replyTo: emailTemplate.replyTo || process.env.TWILIO_REPLY_TO_EMAIL || "support@djyh.rw",
      trackingSettings: {
        clickTracking: {
          enable: true,
          enableText: false
        },
        openTracking: {
          enable: true
        }
      },
      mailSettings: {
        sandboxMode: {
          enable: process.env.NODE_ENV === "development" && process.env.SENDGRID_SANDBOX === "true"
        }
      }
    }

    const response = await sgMail.send(msg)
    const messageId = response[0]?.headers?.["x-message-id"] || "unknown"

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      messageId: messageId
    })
  } catch (error: any) {
    console.error("Failed to send email:", error)
    return NextResponse.json(
      {
        success: false,
        message: `Failed to send email: ${error.message}`,
      },
      { status: 500 }
    )
  }
} 