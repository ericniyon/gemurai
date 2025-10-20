// Client-side email service that calls API routes
// This file is safe to import in client components

export interface EmailResponse {
  success: boolean
  message: string
}

export async function sendApplicationSubmissionEmail(email: string | undefined, name: string): Promise<EmailResponse> {
  try {
    // Skip sending email if no email is provided
    if (!email) {
      return {
        success: true,
        message: "No email provided, skipping email notification"
      }
    }

    const response = await fetch("/api/email/application-submission", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, name }),
    })

    const result = await response.json()
    return result
  } catch (error: any) {
    console.error("Error sending application submission email:", error)
    return {
      success: false,
      message: `Failed to send email: ${error.message}`,
    }
  }
}

export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<EmailResponse> {
  try {
    const response = await fetch("/api/email/password-reset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, resetToken }),
    })

    const result = await response.json()
    return result
  } catch (error: any) {
    console.error("Error sending password reset email:", error)
    return {
      success: false,
      message: `Failed to send email: ${error.message}`,
    }
  }
}

export async function sendEvaluationFeedbackEmail(
  email: string | undefined,
  name: string,
  evaluation: any,
): Promise<EmailResponse> {
  try {
    // Skip sending email if no email is provided
    if (!email) {
      return {
        success: true,
        message: "No email provided, skipping email notification"
      }
    }

    const response = await fetch("/api/email/evaluation-feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        name,
        evaluation: {
          overallScore: evaluation.overallScore,
          overallComment: evaluation.overallComment,
          status: evaluation.status,
          answers: evaluation.answers,
          questions: evaluation.questions,
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to send evaluation feedback")
    }

    const result = await response.json()
    return result
  } catch (error: any) {
    console.error("Error sending evaluation feedback email:", error)
    return {
      success: false,
      message: `Failed to send evaluation feedback: ${error.message}`,
    }
  }
}

export async function sendDCCWelcomeEmail(email: string | undefined, name: string): Promise<EmailResponse> {
  try {
    // Skip sending email if no email is provided
    if (!email) {
      return {
        success: true,
        message: "No email provided, skipping email notification"
      }
    }

    const response = await fetch("/api/email/dcc-welcome", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, name }),
    })

    const result = await response.json()
    return result
  } catch (error: any) {
    console.error("Error sending DCC welcome email:", error)
    return {
      success: false,
      message: `Failed to send email: ${error.message}`,
    }
  }
}

export async function sendTestEmail(to: string | undefined, subject?: string, content?: string): Promise<EmailResponse> {
  try {
    // Skip sending email if no email is provided
    if (!to) {
      return {
        success: true,
        message: "No email provided, skipping test email"
      }
    }

    const response = await fetch("/api/email/test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ to, subject, content }),
    })

    const result = await response.json()
    return result
  } catch (error: any) {
    console.error("Error sending test email:", error)
    return {
      success: false,
      message: `Failed to send email: ${error.message}`,
    }
  }
}

// Check SendGrid configuration via API (optional, can be removed if not needed)
export async function checkEmailConfiguration(): Promise<{
  configured: boolean
  issues: string[]
  recommendations: string[]
}> {
  try {
    const response = await fetch("/api/email/check-config")
    return await response.json()
  } catch (error: any) {
    return {
      configured: false,
      issues: ["Failed to check email configuration: " + error.message],
      recommendations: [],
    }
  }
}
