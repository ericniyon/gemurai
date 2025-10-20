"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Mail, AlertCircle, CheckCircle, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface EmailConfig {
  configured: boolean
  issues: string[]
  recommendations: string[]
}

export default function EmailDiagnosticsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [config, setConfig] = useState<EmailConfig | null>(null)
  const [testResult, setTestResult] = useState<any>(null)
  const { toast } = useToast()

  const checkConfiguration = async () => {
    setIsLoading(true)
    
    try {
      console.log("🔍 Checking email configuration...")
      
      const response = await fetch('/api/email-diagnostics/config', {
        method: 'GET',
      })

      const result = await response.json()
      console.log("📊 Configuration result:", result)
      setConfig(result)
      
      if (result.configured) {
        toast({
          title: "Email Configuration OK",
          description: "Email service is properly configured",
        })
      } else {
        toast({
          title: "Email Configuration Issues",
          description: `${result.issues.length} configuration issues found`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("❌ Configuration check error:", error)
      toast({
        title: "Configuration Check Failed",
        description: "Failed to check email configuration",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const sendTestEmail = async () => {
    setIsLoading(true)
    
    try {
      console.log("🧪 Sending test email...")
      
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      console.log("📊 Test email result:", result)
      setTestResult(result)
      
      if (result.success) {
        toast({
          title: "Test Email Sent!",
          description: "Test email sent successfully. Check your inbox and spam folder.",
        })
      } else {
        toast({
          title: "Test Email Failed",
          description: result.message || "Failed to send test email",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("❌ Test email error:", error)
      toast({
        title: "Test Email Error",
        description: "An error occurred while sending the test email",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Diagnostics</h1>
          <p className="text-gray-600">Check email configuration and test email delivery</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration Check */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Configuration
              </CardTitle>
              <CardDescription>
                Check if email service is properly configured
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={checkConfiguration}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking Configuration...
                  </>
                ) : (
                  "Check Configuration"
                )}
              </Button>

              {config && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {config.configured ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span className="font-medium">
                      Configuration Status: {config.configured ? "OK" : "Issues Found"}
                    </span>
                  </div>

                  {config.issues.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-red-600">Issues:</h4>
                      <ul className="space-y-1">
                        {config.issues.map((issue, index) => (
                          <li key={index} className="text-sm text-red-600 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {config.recommendations.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-blue-600">Recommendations:</h4>
                      <ul className="space-y-1">
                        {config.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-blue-600 flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test Email */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Test Email
              </CardTitle>
              <CardDescription>
                Send a test email to niyoeri6@gmail.com
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Target:</strong> niyoeri6@gmail.com</p>
                <p><strong>Subject:</strong> Gemurai Test Email</p>
              </div>

              <Button
                onClick={sendTestEmail}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Test Email...
                  </>
                ) : (
                  "Send Test Email"
                )}
              </Button>

              {testResult && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {testResult.success ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span className="font-medium">
                      Test Result: {testResult.success ? "Success" : "Failed"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{testResult.message}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Troubleshooting Guide */}
        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting Guide</CardTitle>
            <CardDescription>
              Common reasons why emails might not be delivered
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Environment Variables</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• TWILIO_SENDGRID_API_KEY</li>
                  <li>• TWILIO_FROM_EMAIL</li>
                  <li>• TWILIO_FROM_NAME</li>
                  <li>• TWILIO_REPLY_TO_EMAIL</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Email Delivery Issues</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Check spam/junk folder</li>
                  <li>• Verify email address is correct</li>
                  <li>• Check SendGrid account status</li>
                  <li>• Verify domain authentication</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 