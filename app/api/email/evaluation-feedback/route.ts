import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const { email, name, evaluation } = await request.json()

    // Validate required fields
    if (!email || !name || !evaluation) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      )
    }

    // Get score rating text
    const getScoreRating = (score: number) => {
      if (score >= 80) return "Excellent"
      if (score >= 70) return "Very Good"
      if (score >= 60) return "Good"
      if (score >= 50) return "Fair"
      return "Needs Improvement"
    }

    // Create email content with modern design
    const emailContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Gemurai Application Evaluation Feedback</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              margin: 0;
              padding: 0;
              color: #333;
            }
            .header {
              background: linear-gradient(135deg, #E65100 0%, #6A1B9A 100%);
              color: white;
              padding: 40px 20px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 32px;
              font-weight: 600;
            }
            .header p {
              margin: 10px 0 0;
              font-size: 18px;
              opacity: 0.9;
            }
            .content {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .feedback-section {
              background: #f8f9fa;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            .score-circle {
              width: 120px;
              height: 120px;
              background: #00BFA5;
              border-radius: 50%;
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 32px;
              font-weight: bold;
              margin: 20px auto;
            }
            .score-label {
              text-align: center;
              color: #666;
              font-size: 18px;
              margin-top: 10px;
            }
            .feedback-item {
              border-left: 4px solid #1976D2;
              padding-left: 15px;
              margin: 15px 0;
            }
            .feedback-item h3 {
              color: #1976D2;
              margin: 0 0 10px;
            }
            .feedback-item p {
              margin: 0;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Gemurai</h1>
            <p>Digital Community Champions</p>
          </div>
          
          <div class="content">
            <h2>Application Evaluation Feedback</h2>
            
            <p>Dear ${name || "Unknown Applicant"},</p>
            
            <p>We have completed the evaluation of your Digital Community Champion application. Below is your detailed feedback:</p>
            
            <div class="feedback-section">
              <div class="score-circle">
                ${evaluation.overallScore}%
              </div>
              <div class="score-label">
                ${getScoreRating(evaluation.overallScore)}
              </div>
            </div>

            <div class="feedback-section">
              <h3>General Feedback</h3>
              <p>${evaluation.overallComment}</p>
            </div>

            <div class="feedback-section">
              <h3>Detailed Feedback</h3>
              ${evaluation.questions
                .map((q: { id: string; category: string; question: string }) => {
                  const answer = evaluation.answers.find((a: any) => a.questionId === q.id)
                  if (!answer) return ""
                  return `
                    <div class="feedback-item">
                      <h3>${q.category}</h3>
                      <p><strong>${q.question}</strong></p>
                      <p>Response: ${Array.isArray(answer.answer) ? answer.answer.join(", ") : answer.answer}</p>
                      ${answer.reviewerComment ? `<p>Feedback: ${answer.reviewerComment}</p>` : ""}
                    </div>
                  `
                })
                .join("")}
            </div>

            <div class="feedback-section">
              <h3>Next Steps</h3>
              <ul>
                <li>Review your evaluation feedback thoroughly</li>
                <li>Check your application status in your dashboard</li>
                <li>Contact our support team if you have any questions</li>
              </ul>
            </div>

            <p>Thank you for your interest in becoming an Gemurai Digital Community Champion!</p>
            
            <p style="color: #666; font-size: 14px; margin-top: 40px; text-align: center;">
              This is an automated message from the Gemurai Platform.<br>
              Please do not reply to this email.
            </p>
          </div>
        </body>
      </html>
    `

    // Dynamic import of email service
    const { sendEmail } = await import("@/lib/email-service.server")

    // Send the email
    const result = await sendEmail({
      to: email,
      subject: "Your Gemurai Application Evaluation",
      html: emailContent,
      template: "evaluation-feedback",
    })

    if (!result.success) {
      throw new Error(result.message || "Failed to send email")
    }

    return NextResponse.json({ success: true, message: "Evaluation feedback sent successfully" })
  } catch (error: any) {
    console.error("Error sending evaluation feedback:", error)
    return NextResponse.json(
      { success: false, message: error.message || "Failed to send evaluation feedback" },
      { status: 500 }
    )
  }
}
