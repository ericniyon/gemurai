"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, Mail, CheckCircle, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TestResult {
  success: boolean
  message: string
  timestamp: string
  details?: any
}

export default function EmailTestPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [testEmail, setTestEmail] = useState("")
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [emailConfig, setEmailConfig] = useState<any>(null)

  const addResult = (result: Omit<TestResult, "timestamp">) => {
    const newResult = {
      ...result,
      timestamp: new Date().toLocaleTimeString(),
    }
    setTestResults((prev) => [newResult, ...prev])
  }

  const checkEmailConfiguration = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/email/config", {
        method: "GET",
      })
      const result = await response.json()
      setEmailConfig(result)
      addResult({
        success: result.configured,
        message: result.configured ? "Email configuration is valid" : "Email configuration has issues",
        details: result,
      })
    } catch (error: any) {
      addResult({
        success: false,
        message: `Failed to check configuration: ${error.message}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const sendTestEmail = async () => {
    if (!testEmail) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/email/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: testEmail,
          subject: "Gemurai Test Email",
          content: "This is a test email to verify email functionality is working correctly.",
        }),
      })

      const result = await response.json()
      addResult({
        success: result.success,
        message: result.message,
        details: result,
      })

      if (result.success) {
        toast({
          title: "Test Email Sent!",
          description: "Check your inbox for the test email.",
        })
      } else {
        toast({
          title: "Email Failed",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      addResult({
        success: false,
        message: `Failed to send test email: ${error.message}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const sendPasswordResetTest = async () => {
    if (!testEmail) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/email/password-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: testEmail,
          resetToken: "test-token-" + Date.now(),
        }),
      })

      const result = await response.json()
      addResult({
        success: result.success,
        message: result.message,
        details: result,
      })

      if (result.success) {
        toast({
          title: "Password Reset Email Sent!",
          description: "Check your inbox for the password reset email.",
        })
      } else {
        toast({
          title: "Password Reset Failed",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      addResult({
        success: false,
        message: `Failed to send password reset email: ${error.message}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testForgotPasswordFlow = async () => {
    if (!testEmail) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // Simulate the forgot password form submission
      const response = await fetch("/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `email=${encodeURIComponent(testEmail)}`,
      })

      const result = await response.text()
      addResult({
        success: response.ok,
        message: response.ok ? "Forgot password flow completed" : "Forgot password flow failed",
        details: { status: response.status, response: result.substring(0, 200) },
      })
    } catch (error: any) {
      addResult({
        success: false,
        message: `Failed to test forgot password flow: ${error.message}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email System Testing</h1>
          <p className="text-gray-600">Test and debug email functionality</p>
        </div>
      </div>

      {/* Email Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Configuration
          </CardTitle>
          <CardDescription>Check if email service is properly configured</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={checkEmailConfiguration} disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Check Configuration
          </Button>

          {emailConfig && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={emailConfig.configured ? "default" : "destructive"}>
                  {emailConfig.configured ? "Configured" : "Issues Found"}
                </Badge>
              </div>

              {emailConfig.issues?.length > 0 && (
                <div className="bg-red-50 p-3 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2">Issues:</h4>
                  <ul className="list-disc list-inside text-red-700 space-y-1">
                    {emailConfig.issues.map((issue: string, index: number) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {emailConfig.recommendations?.length > 0 && (
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">Recommendations:</h4>
                  <ul className="list-disc list-inside text-yellow-700 space-y-1">
                    {emailConfig.recommendations.map((rec: string, index: number) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Testing */}
      <Card>
        <CardHeader>
          <CardTitle>Email Testing</CardTitle>
          <CardDescription>Test different email functionalities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="testEmail">Test Email Address</Label>
            <Input
              id="testEmail"
              type="email"
              placeholder="Enter email to test with"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={sendTestEmail} disabled={isLoading} variant="outline">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Send Test Email
            </Button>

            <Button onClick={sendPasswordResetTest} disabled={isLoading} variant="outline">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Send Password Reset
            </Button>

            <Button onClick={testForgotPasswordFlow} disabled={isLoading} variant="outline">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Test Forgot Password Flow
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
          <CardDescription>Recent email test results and debugging information</CardDescription>
        </CardHeader>
        <CardContent>
          {testResults.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No test results yet. Run a test above to see results.</p>
          ) : (
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className={`font-medium ${result.success ? "text-green-800" : "text-red-800"}`}>
                          {result.message}
                        </p>
                        <span className="text-sm text-gray-500">{result.timestamp}</span>
                      </div>
                      {result.details && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-sm text-gray-600">Show Details</summary>
                          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Environment Variables Check */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
          <CardDescription>Check if required environment variables are set</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "TWILIO_SENDGRID_API_KEY",
              "TWILIO_FROM_EMAIL",
              "TWILIO_FROM_NAME",
              "TWILIO_REPLY_TO_EMAIL",
              "NEXTAUTH_URL",
            ].map((envVar) => (
              <div key={envVar} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="font-mono text-sm">{envVar}</span>
                <Badge variant={process.env[envVar] ? "default" : "destructive"}>
                  {process.env[envVar] ? "Set" : "Missing"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
