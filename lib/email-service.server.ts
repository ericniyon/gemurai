// This file should only run on the server
if (!isServer()) {
  throw new Error("This module should only be used on the server side")
}

import { loadSendGrid, isServer } from './server-utils'
import { prisma } from "./database"
import type { ApplicationEvaluation } from "./evaluation-service"

let sgMail: any = null

// Initialize Twilio SendGrid
async function initializeSendGrid() {
  try {
    if (!sgMail) {
      sgMail = await loadSendGrid()
      if (process.env.TWILIO_SENDGRID_API_KEY) {
        sgMail.setApiKey(process.env.TWILIO_SENDGRID_API_KEY)
        console.log("✅ SendGrid API key configured")
      } else {
        console.warn("⚠️ TWILIO_SENDGRID_API_KEY not found in environment variables")
      }
    }
    return sgMail
  } catch (error) {
    console.error("Failed to initialize SendGrid:", error)
    throw error
  }
}

export interface EmailTemplate {
  to: string | undefined
  subject: string
  html: string
  template?: string
  replyTo?: string
}

// Log email attempts with enhanced error handling
async function logEmail(
  to: string | undefined,
  subject: string,
  template: string,
  status: string,
  error?: string,
  messageId?: string,
) {
  try {
    console.log(`📧 Email Log: ${status} - ${to} - ${subject}`)

    // Only log to database if prisma is available
    if (prisma) {
      await prisma.emailLog.create({
        data: {
          to: to || "no-email",
          subject,
          template,
          status,
          error: error ? error.substring(0, 1000) : null,
          messageId,
          sentAt: status === "sent" ? new Date() : null,
        },
      })
      console.log("✅ Email logged to database")
    } else {
      // Fallback to console logging
      console.log(`📝 Email Log (console only): ${status} - ${to} - ${subject} - ${error || "Success"}`)
    }
  } catch (logError) {
    console.error("❌ Failed to log email:", logError)
    // Continue execution even if logging fails
  }
}

// Validate email address format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Send email using Twilio SendGrid with comprehensive error handling
async function sendEmailWithTwilio(emailData: EmailTemplate): Promise<{ success: boolean; message: string }> {
  console.log(`🚀 Attempting to send email to: ${emailData.to}`)
  console.log(`📋 Subject: ${emailData.subject}`)
  console.log(`🏷️ Template: ${emailData.template || "custom"}`)

  try {
    // Skip if no email is provided
    if (!emailData.to) {
      console.log("ℹ️ No email address provided, skipping email")
      return {
        success: true,
        message: "No email address provided, skipping email"
      }
    }

    // Validate inputs
    if (!isValidEmail(emailData.to)) {
      throw new Error(`Invalid recipient email address: ${emailData.to}`)
    }

    if (!emailData.subject || emailData.subject.trim().length === 0) {
      throw new Error("Email subject is required")
    }

    if (!emailData.html || emailData.html.trim().length === 0) {
      throw new Error("Email content is required")
    }

    // Check if SendGrid is configured
    if (!process.env.TWILIO_SENDGRID_API_KEY) {
      throw new Error("SendGrid API key not configured")
    }

    if (!process.env.TWILIO_FROM_EMAIL) {
      throw new Error("From email address not configured")
    }

    // Initialize SendGrid properly
    const sgMail = await initializeSendGrid()
    if (!sgMail) {
      throw new Error("Failed to initialize SendGrid")
    }

    console.log(`📤 From: ${process.env.TWILIO_FROM_EMAIL}`)
    console.log(`📧 To: ${emailData.to}`)

    const msg = {
      to: emailData.to.trim(),
      from: {
        email: process.env.TWILIO_FROM_EMAIL,
        name: process.env.TWILIO_FROM_NAME || "Gemurai Platform",
      },
      replyTo: emailData.replyTo || process.env.TWILIO_REPLY_TO_EMAIL || "support@djyh.rw",
      subject: emailData.subject.trim(),
      html: emailData.html,
      // Add tracking and authentication settings
      trackingSettings: {
        clickTracking: {
          enable: true,
          enableText: false,
        },
        openTracking: {
          enable: true,
        },
      },
      mailSettings: {
        sandboxMode: {
          enable: process.env.NODE_ENV === "development" && process.env.SENDGRID_SANDBOX === "true",
        },
      },
    }

    console.log(`🔧 Sandbox mode: ${msg.mailSettings.sandboxMode.enable ? "enabled" : "disabled"}`)
    console.log(`📡 Sending email via SendGrid...`)

    const response = await sgMail.send(msg)
    const messageId = response[0]?.headers?.["x-message-id"] || "unknown"

    console.log(`✅ Email sent successfully! Message ID: ${messageId}`)
    console.log(`📊 Response status: ${response[0]?.statusCode}`)

    await logEmail(emailData.to, emailData.subject, emailData.template || "custom", "sent", undefined, messageId)

    return {
      success: true,
      message: `Email sent successfully! Message ID: ${messageId}`,
    }
  } catch (error: any) {
    console.error("❌ SendGrid email error:", error)

    // Extract detailed error information
    let errorMessage = error.message || "Unknown error occurred"

    if (error.response?.body?.errors) {
      const errors = error.response.body.errors
      errorMessage = errors.map((e: any) => e.message || e.field || "Unknown error").join(", ")
      console.error("📋 SendGrid errors:", errors)
    } else if (error.response?.body?.error) {
      errorMessage = error.response.body.error
      console.error("📋 SendGrid error:", error.response.body.error)
    }

    if (error.response?.status) {
      console.error(`📊 HTTP Status: ${error.response.status}`)
    }

    await logEmail(
      emailData.to || "unknown",
      emailData.subject || "unknown",
      emailData.template || "custom",
      "failed",
      errorMessage,
    )

    return {
      success: false,
      message: `Failed to send email: ${errorMessage}`,
    }
  }
}

// Send application submission email
export async function sendApplicationSubmissionEmail(email: string, name: string) {
  try {
    const sgMail = await initializeSendGrid()
    
    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com',
      subject: 'Application Submitted Successfully',
      text: `Dear ${name},\n\nThank you for submitting your application. We will review it and get back to you soon.\n\nBest regards,\nThe Team`,
      html: `<p>Dear ${name},</p><p>Thank you for submitting your application. We will review it and get back to you soon.</p><p>Best regards,<br>The Team</p>`,
    }

    await sgMail.send(msg)
    return { success: true }
  } catch (error) {
    console.error('Error sending application submission email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send email' }
  }
}

// Send application status update email
export async function sendApplicationStatusEmail(email: string, name: string, status: string) {
  try {
    const sgMail = await initializeSendGrid()
    
    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com',
      subject: 'Application Status Update',
      text: `Dear ${name},\n\nYour application status has been updated to: ${status}.\n\nBest regards,\nThe Team`,
      html: `<p>Dear ${name},</p><p>Your application status has been updated to: <strong>${status}</strong>.</p><p>Best regards,<br>The Team</p>`,
    }

    await sgMail.send(msg)
    return { success: true }
  } catch (error) {
    console.error('Error sending application status email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send email' }
  }
}

// Send evaluation results email
export async function sendEvaluationResultsEmail(email: string, name: string, evaluation: ApplicationEvaluation) {
  try {
    const sgMail = await initializeSendGrid()
    
    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com',
      subject: 'Application Evaluation Results',
      text: `Dear ${name},\n\nYour application has been evaluated. Score: ${evaluation.score}\n\nStrengths:\n${evaluation.strengths.join('\n')}\n\nAreas for Improvement:\n${evaluation.improvements.join('\n')}\n\nBest regards,\nThe Team`,
      html: `<p>Dear ${name},</p>
             <p>Your application has been evaluated.</p>
             <p>Score: <strong>${evaluation.score}</strong></p>
             <h3>Strengths:</h3>
             <ul>${evaluation.strengths.map(s => `<li>${s}</li>`).join('')}</ul>
             <h3>Areas for Improvement:</h3>
             <ul>${evaluation.improvements.map(i => `<li>${i}</li>`).join('')}</ul>
             <p>Best regards,<br>The Team</p>`,
    }

    await sgMail.send(msg)
    return { success: true }
  } catch (error) {
    console.error('Error sending evaluation results email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send email' }
  }
}

export async function sendPasswordResetEmail(
  email: string | undefined,
  resetToken: string,
): Promise<{ success: boolean; message: string }> {
  try {
    // Skip if no email is provided
    if (!email) {
      console.log("ℹ️ No email address provided, skipping password reset email")
      return {
        success: true,
        message: "No email address provided, skipping password reset email"
      }
    }

    const resetLink = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/en/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`

    const emailTemplate: EmailTemplate = {
      to: email,
      subject: "Gemurai Password Reset",
      template: "password_reset",
      replyTo: "support@Gemurai.rw",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset Request</title>
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
            <h1>Password Reset Request</h1>
            </div>
          <div class="content">
              <p>Hello,</p>
            <p>We received a request to reset your password for your Gemurai account.</p>
            <p>Click the button below to reset your password:</p>
            <p><a href="${resetLink}" class="button">Reset Password</a></p>
            <p>If you didn't request this, you can safely ignore this email.</p>
            <p>The password reset link will expire in 24 hours.</p>
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
    console.error("Failed to send password reset email:", error)
    return {
      success: false,
      message: `Failed to send email: ${error.message}`,
    }
  }
}

export async function sendEvaluationFeedbackEmail(
  email: string | undefined,
  name: string,
  evaluation: ApplicationEvaluation,
): Promise<{ success: boolean; message: string }> {
  try {
    // Skip if no email is provided
    if (!email) {
      console.log("ℹ️ No email address provided, skipping evaluation feedback email")
      return {
        success: true,
        message: "No email address provided, skipping evaluation feedback email"
      }
    }

    const emailTemplate: EmailTemplate = {
      to: email,
      subject: "Gemurai Application Evaluation Results",
      template: "evaluation_feedback",
      replyTo: "support@Gemurai.rw",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Application Evaluation Results</title>
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
            .score {
              font-size: 24px;
              font-weight: bold;
              color: #007bff;
              text-align: center;
              margin: 20px 0;
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
            <h1>Application Evaluation Results</h1>
            </div>
          <div class="content">
              <p>Dear ${name},</p>
            <p>We have completed the evaluation of your Digital Community Champion application.</p>
            <div class="score">
              Overall Score: ${evaluation.score}%
            </div>
            <p><strong>Status:</strong> ${evaluation.status}</p>
            <p><strong>Overall Comment:</strong></p>
            <p>${evaluation.overallComment}</p>
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
    console.error("Failed to send evaluation feedback email:", error)
    return {
      success: false,
      message: `Failed to send email: ${error.message}`,
    }
  }
}

export async function sendDCCWelcomeEmail(
  email: string | undefined,
  name: string,
): Promise<{ success: boolean; message: string }> {
  try {
    // Skip if no email is provided
    if (!email) {
      console.log("ℹ️ No email address provided, skipping DCC welcome email")
      return {
        success: true,
        message: "No email address provided, skipping DCC welcome email"
      }
    }

    const emailTemplate: EmailTemplate = {
      to: email,
      subject: "Welcome to Gemurai Digital Community Champions",
      template: "dcc_welcome",
      replyTo: "support@Gemurai.rw",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Gemurai Digital Community Champions</title>
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
            <h1>Welcome to Gemurai Digital Community Champions!</h1>
            </div>
          <div class="content">
              <p>Dear ${name},</p>
            <p>Congratulations! You have been selected to join our Digital Community Champions program.</p>
            <p>As a Digital Community Champion, you will play a crucial role in:</p>
            <ul>
              <li>Promoting digital literacy in your community</li>
              <li>Supporting local businesses in their digital transformation</li>
              <li>Creating positive impact through technology</li>
                </ul>
            <p>Next steps:</p>
            <ol>
              <li>Complete your DCC profile</li>
              <li>Attend the orientation session</li>
              <li>Start your journey as a Digital Community Champion</li>
            </ol>
            <p>We're excited to have you on board!</p>
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
    console.error("Failed to send DCC welcome email:", error)
    return {
      success: false,
      message: `Failed to send email: ${error.message}`,
    }
  }
}

export async function sendTestEmail(
  to: string | undefined,
  subject = "Gemurai Test Email",
  content = "This is a test email from Gemurai platform.",
): Promise<{ success: boolean; message: string }> {
  try {
    // Skip if no email is provided
    if (!to) {
      console.log("ℹ️ No email address provided, skipping test email")
      return {
        success: true,
        message: "No email address provided, skipping test email"
      }
    }

    const emailTemplate: EmailTemplate = {
      to,
      subject,
      template: "test",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .content {
              padding: 20px;
              background-color: #f8f9fa;
              border-radius: 5px;
            }
          </style>
        </head>
        <body>
          <div class="content">
            <h1>${subject}</h1>
              <p>${content}</p>
            <p>Best regards,<br>The Gemurai Team</p>
          </div>
        </body>
        </html>
      `,
    }

    return await sendEmailWithTwilio(emailTemplate)
  } catch (error: any) {
    console.error("Failed to send test email:", error)
    return {
      success: false,
      message: `Failed to send email: ${error.message}`,
    }
  }
}

// Check SendGrid configuration via API (optional, can be removed if not needed)
export function checkEmailConfiguration(): {
  configured: boolean
  issues: string[]
  recommendations: string[]
} {
  const issues: string[] = []
  const recommendations: string[] = []

  // Check API key
  if (!process.env.TWILIO_SENDGRID_API_KEY) {
    issues.push("SendGrid API key not configured")
    recommendations.push("Add TWILIO_SENDGRID_API_KEY to your environment variables")
  }

  // Check From email
  if (!process.env.TWILIO_FROM_EMAIL) {
    issues.push("From email address not configured")
    recommendations.push("Add TWILIO_FROM_EMAIL to your environment variables")
  }

  // Check Reply-To email
  if (!process.env.TWILIO_REPLY_TO_EMAIL) {
    recommendations.push("Consider adding TWILIO_REPLY_TO_EMAIL to your environment variables")
  }

  // Check From name
  if (!process.env.TWILIO_FROM_NAME) {
    recommendations.push("Consider adding TWILIO_FROM_NAME to your environment variables")
  }

  return {
    configured: issues.length === 0,
    issues,
    recommendations,
  }
}

export async function sendApplicationApprovalEmail(
  email: string,
  name: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const emailTemplate: EmailTemplate = {
      to: email,
      subject: "Congratulations! Your Gemurai Application is Approved",
      template: "application_approval",
      replyTo: "support@Gemurai.rw",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Gemurai Application Approved</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <div style="background: linear-gradient(135deg, #22c55e 0%, #15803d 100%); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Gemurai</h1>
              <p style="color: white; margin: 5px 0; font-size: 16px;">Digital Community Champions</p>
            </div>
            
            <div style="padding: 30px; color: #333;">
              <h2 style="margin: 0 0 20px; color: #15803d; font-size: 24px;">Congratulations, ${name}!</h2>
              
              <p style="margin: 0 0 15px; line-height: 1.5;">
                We are delighted to inform you that your application to become a Digital Community Champion has been approved! 
                Welcome to the Gemurai community.
              </p>

              <div style="background-color: #f0fdf4; border-left: 4px solid #15803d; padding: 15px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px; color: #15803d;">Next Steps:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #333;">
                  <li style="margin-bottom: 8px;">Complete your DCC profile</li>
                  <li style="margin-bottom: 8px;">Review the DCC guidelines and code of conduct</li>
                  <li style="margin-bottom: 8px;">Join the DCC orientation session</li>
                  <li style="margin-bottom: 0;">Connect with other champions in your area</li>
                </ul>
              </div>

              <p style="margin: 20px 0; line-height: 1.5;">
                Our team will contact you shortly with more details about your onboarding process and upcoming orientation sessions.
              </p>

              <p style="margin: 20px 0 0; line-height: 1.5;">
                If you have any questions, please don't hesitate to contact our support team.
              </p>
            </div>
            
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; color: #666;">
              <p style="margin: 0; font-size: 14px;">
                Gemurai - Empowering Digital Communities
              </p>
              <p style="margin: 10px 0 0; font-size: 12px;">
                © ${new Date().getFullYear()} Gemurai. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    }

    return await sendEmailWithTwilio(emailTemplate)
  } catch (error: any) {
    console.error("Failed to send application approval email:", error)
    return {
      success: false,
      message: `Failed to send approval email: ${error.message}`,
    }
  }
}

export async function sendPasswordResetConfirmationEmail(
  email: string,
  name: string,
): Promise<{ success: boolean; message: string }> {
  try {
    // Skip if no email is provided
    if (!email) {
      console.log("ℹ️ No email address provided, skipping password reset confirmation email")
      return {
        success: true,
        message: "No email address provided, skipping password reset confirmation email"
      }
    }

    const emailTemplate: EmailTemplate = {
      to: email,
      subject: "Password Reset Successful - Gemurai",
      template: "password_reset_confirmation",
      replyTo: "support@Gemurai.rw",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset Successful</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f5f5f5;
            }
            .container {
              background-color: white;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #22c55e 0%, #15803d 100%);
              padding: 30px 20px;
              text-align: center;
              color: white;
            }
            .content {
              padding: 30px;
            }
            .success-icon {
              font-size: 48px;
              color: #22c55e;
              text-align: center;
              margin-bottom: 20px;
            }
            .footer {
              background-color: #f8f9fa;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #666;
              border-top: 1px solid #eee;
            }
            .security-notice {
              background-color: #fef3c7;
              border: 1px solid #f59e0b;
              border-radius: 6px;
              padding: 15px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Successful</h1>
              <p>Your account security has been updated</p>
            </div>
            
            <div class="content">
              <div class="success-icon">✅</div>
              
              <h2>Hello ${name},</h2>
              
              <p>Your password has been successfully reset. Your account is now secure with your new password.</p>
              
              <div class="security-notice">
                <h3>🔒 Security Notice</h3>
                <p>If you did not request this password reset, please contact our support team immediately at <strong>support@Gemurai.rw</strong> or call us at <strong>+250 788 123 456</strong>.</p>
              </div>
              
              <h3>What's Next?</h3>
              <ul>
                <li>You can now log in with your new password</li>
                <li>Consider enabling two-factor authentication for added security</li>
                <li>Keep your password secure and don't share it with anyone</li>
              </ul>
              
              <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
              
              <p>Best regards,<br>The Gemurai Security Team</p>
            </div>
            
            <div class="footer">
              <p>This is an automated security notification. Please do not reply to this email.</p>
              <p>© ${new Date().getFullYear()} Gemurai. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    }

    return await sendEmailWithTwilio(emailTemplate)
  } catch (error: any) {
    console.error("Failed to send password reset confirmation email:", error)
    return {
      success: false,
      message: `Failed to send confirmation email: ${error.message}`,
    }
  }
}

export async function sendEmail(emailData: EmailTemplate) {
  return sendEmailWithTwilio(emailData);
}
