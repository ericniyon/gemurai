import { EmailTemplate } from "@/types/email"

interface EmailResponse {
  success: boolean
  message: string
}

async function sendEmailWithTwilio(emailTemplate: EmailTemplate): Promise<EmailResponse> {
  try {
    // For server-side code, use the full URL
    const baseUrl = typeof window === 'undefined' 
      ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000')
      : ''
      
    // Ensure the URL is properly formatted
    const url = new URL('/api/email/send', baseUrl).toString()
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailTemplate),
    })

    if (!response.ok) {
      throw new Error(`Email service responded with status: ${response.status}`)
    }

    const result = await response.json()
    return result
  } catch (error: any) {
    console.error("Error sending email with Twilio:", error)
    return {
      success: false,
      message: `Failed to send email: ${error.message}`,
    }
  }
}

export async function sendApplicationSubmissionEmail(
  email: string | undefined,
  name: string,
): Promise<EmailResponse> {
  try {
    // Skip if no email is provided or is invalid
    if (!email || email === "Oya" || !email.includes("@")) {
      console.log("ℹ️ Invalid or missing email address, skipping application submission email")
      return {
        success: true,
        message: "Invalid or missing email address, skipping application submission email"
      }
    }

    const emailTemplate: EmailTemplate = {
      to: email,
      subject: "Gemurai Application Submitted Successfully",
      template: "application_submission",
      replyTo: "support@Gemurai.rw",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Application Submitted Successfully</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #f8f9fa;
              padding: 20px;
              text-align: center;
              border-radius: 5px;
            }
            .content {
              padding: 20px;
            }
            .button {
              display: inline-block;
              padding: 10px 20px;
              background-color: #007bff;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin-top: 20px;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Application Submitted Successfully</h1>
          </div>
          <div class="content">
            <p>Dear ${name},</p>
            <p>Thank you for submitting your application to become a Digital Community Champion. We have received your application and it is now under review.</p>
            <p>Our team will carefully evaluate your application and get back to you soon with the next steps.</p>
            <p>If you have any questions, please don't hesitate to contact us.</p>
            <p>Best regards,<br>The Gemurai Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message, please do not reply directly to this email. For support, contact support@Gemurai.rw</p>
          </div>
        </body>
        </html>
      `,
    }

    return await sendEmailWithTwilio(emailTemplate)
  } catch (error: any) {
    console.error("Failed to send application submission email:", error)
    return {
      success: false,
      message: `Failed to send email: ${error.message}`,
    }
  }
} 