import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const { email, name, reason } = await request.json()

    if (!email || !name) {
      return NextResponse.json({ success: false, message: "Email and name are required" }, { status: 400 })
    }

    const subject = "🎉 Congratulations! You've been upgraded to Digital Community Champion"

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>DCC Upgrade Notification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .benefits { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .benefit-item { margin: 10px 0; padding: 10px; background: #e8f4fd; border-left: 4px solid #667eea; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Congratulations, ${name}!</h1>
            <p>You've been upgraded to Digital Community Champion</p>
          </div>
          
          <div class="content">
            <h2>Welcome to the DCC Program!</h2>
            
            <p>We're excited to inform you that your account has been upgraded to <strong>Digital Community Champion (DCC)</strong> status.</p>
            
            <p><strong>Reason for upgrade:</strong> ${reason}</p>
            
            <div class="benefits">
              <h3>🚀 Your New DCC Benefits:</h3>
              <div class="benefit-item">
                <strong>🏢 DCC Dashboard Access</strong><br>
                Manage your digital services and track your performance
              </div>
              <div class="benefit-item">
                <strong>💼 Business Development Tools</strong><br>
                Access resources to grow your digital services business
              </div>
              <div class="benefit-item">
                <strong>🤝 Community Network</strong><br>
                Connect with other DCCs and share best practices
              </div>
              <div class="benefit-item">
                <strong>💰 Income Generation Programs</strong><br>
                Participate in programs designed to increase your earnings
              </div>
              <div class="benefit-item">
                <strong>📚 Advanced Training</strong><br>
                Access specialized training for digital service providers
              </div>
            </div>
            
            <p>You can now access your DCC dashboard and start exploring all the new features available to you.</p>
            
            <a href="${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/dashboard" class="button">
              Access Your DCC Dashboard
            </a>
            
            <h3>Next Steps:</h3>
            <ol>
              <li>Log in to your account and explore the DCC dashboard</li>
              <li>Complete your DCC profile setup</li>
              <li>Browse available training programs</li>
              <li>Connect with your local DCC community</li>
              <li>Start offering digital services to your community</li>
            </ol>
            
            <p>If you have any questions about your new DCC status or need help getting started, please don't hesitate to contact our support team.</p>
            
            <p>Welcome to the Digital Community Champion family!</p>
            
            <p>Best regards,<br>
            <strong>The Gemurai Team</strong></p>
          </div>
        </div>
      </body>
      </html>
    `

    const textContent = `
      Congratulations, ${name}!
      
      You've been upgraded to Digital Community Champion (DCC) status.
      
      Reason: ${reason}
      
      Your new DCC benefits include:
      - DCC Dashboard Access
      - Business Development Tools  
      - Community Network Access
      - Income Generation Programs
      - Advanced Training Resources
      
      Access your DCC dashboard: ${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/dashboard
      
      Welcome to the Digital Community Champion family!
      
      Best regards,
      The Gemurai Team
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
        message: "DCC upgrade email sent successfully",
      })
    } else {
      return NextResponse.json({
        success: false,
        message: result.message || "Failed to send DCC upgrade email",
      })
    }
  } catch (error) {
    console.error("Error sending DCC upgrade email:", error)
    return NextResponse.json({
      success: false,
      message: "Internal server error",
    })
  }
}
