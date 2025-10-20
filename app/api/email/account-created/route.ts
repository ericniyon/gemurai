import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const { email, name, role, tempPassword, setupUrl } = await request.json()

    if (!email || !name || !role) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    const subject = `Welcome to Gemurai - Your ${role} Account is Ready!`

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Gemurai</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .credentials { background: #e8f4f8; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Gemurai!</h1>
            <p>Your ${role} account has been created successfully</p>
          </div>
          
          <div class="content">
            <h2>Hello ${name}!</h2>
            
            <p>Congratulations! Your application has been approved and we've created your Gemurai account.</p>
            
            <p><strong>Your Role:</strong> ${role === "DCC" ? "Digital Community Champion (DCC)" : "Consumer"}</p>
            
            ${
              role === "DCC"
                ? `
              <p>As a Digital Community Champion, you'll have access to:</p>
              <ul>
                <li>🎓 Advanced digital skills training</li>
                <li>💼 Business development resources</li>
                <li>🤝 Community networking opportunities</li>
                <li>💰 Income generation programs</li>
                <li>📊 DCC dashboard and tools</li>
              </ul>
            `
                : `
              <p>As a Consumer, you'll have access to:</p>
              <ul>
                <li>🛒 Marketplace for digital services</li>
                <li>📚 Learning resources and courses</li>
                <li>💼 Job opportunities</li>
                <li>🏦 Financial services</li>
              </ul>
            `
            }
            
            <div class="credentials">
              <h3>🔐 Account Setup Required</h3>
              <p>For security, you need to set up your password:</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Temporary Password:</strong> <code>${tempPassword}</code></p>
            </div>
            
            <div class="warning">
              <strong>⚠️ Important:</strong> Please set up your password within 24 hours. The temporary password will expire after that.
            </div>
            
            <div style="text-align: center;">
              <a href="${setupUrl}" class="button">Set Up Your Password</a>
            </div>
            
            <h3>Next Steps:</h3>
            <ol>
              <li>Click the "Set Up Your Password" button above</li>
              <li>Create a secure password for your account</li>
              <li>Log in to your Gemurai dashboard</li>
              <li>Complete your profile setup</li>
              ${role === "DCC" ? "<li>Start your DCC training journey</li>" : "<li>Explore available services and opportunities</li>"}
            </ol>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          </div>
          
          <div class="footer">
            <p>
              <strong>Gemurai Platform</strong><br>
              Email: support@Gemurai.rw | Phone: +250 788 123 456<br>
              <a href="${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}">Visit Gemurai Platform</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `

    // Dynamic import of email service
    const { sendEmail } = await import("@/lib/email-service.server")

    const result = await sendEmail({
      to: email,
      subject: subject,
      html: htmlContent,
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Welcome email sent successfully",
      })
    } else {
      return NextResponse.json(
        { success: false, message: result.message || "Failed to send welcome email" },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error sending welcome email:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
