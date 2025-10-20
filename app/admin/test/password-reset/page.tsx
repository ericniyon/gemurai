"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, Key, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TestResult {
  success: boolean
  message: string
  timestamp: string
  details?: any
}

export default function PasswordResetTestPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [testEmail, setTestEmail] = useState("")
  const [testResults, setTestResults] = useState<TestResult[]>([])

  const addResult = (result: Omit<TestResult, "timestamp">) => {
    const newResult = {
      ...result,
      timestamp: new Date().toLocaleTimeString(),
    }
    setTestResults((prev) => [newResult, ...prev])
  }

  const testPasswordResetAPI = async () => {
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
      console.log("🧪 Testing password reset API directly")

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
        message: `API Test: ${result.message}`,
        details: {
          status: response.status,
          response: result,
        },
      })

      if (result.success) {
        toast({
          title: "API Test Successful!",
          description: "Password reset API is working correctly.",
        })
      } else {
        toast({
          title: "API Test Failed",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      addResult({
        success: false,
        message: `API Test Failed: ${error.message}`,
        details: { error: error.toString() },
      })
      toast({
        title: "API Test Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testForgotPasswordForm = async () => {
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
      console.log("🧪 Testing forgot password form flow")

      // Simulate the exact same call that the forgot password form makes
      const resetToken = crypto.randomUUID()

      const response = await fetch("/api/email/password-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: testEmail.trim(),
          resetToken,
        }),
      })

      const result = await response.json()

      addResult({
        success: result.success,
        message: `Form Flow Test: ${result.message}`,
        details: {
          status: response.status,
          token: resetToken,
          response: result,
        },
      })

      if (result.success) {
        toast({
          title: "Form Flow Test Successful!",
          description: "Forgot password form flow is working correctly.",
        })
      } else {
        toast({
          title: "Form Flow Test Failed",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      addResult({
        success: false,
        message: `Form Flow Test Failed: ${error.message}`,
        details: { error: error.toString() },
      })
      toast({
        title: "Form Flow Test Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testEmailServiceDirectly = async () => {
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
      console.log("🧪 Testing email service directly")

      // Test the email service function directly
      const response = await fetch("/api/test-email-service", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: testEmail,
          type: "password-reset",
        }),
      })

      const result = await response.json()

      addResult({
        success: result.success,
        message: `Email Service Test: ${result.message}`,
        details: result,
      })

      if (result.success) {
        toast({
          title: "Email Service Test Successful!",
          description: "Email service is working correctly.",
        })
      } else {
        toast({
          title: "Email Service Test Failed",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      addResult({
        success: false,
        message: `Email Service Test Failed: ${error.message}`,
        details: { error: error.toString() },
      })
      toast({
        title: "Email Service Test Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Key className="w-6 h-6 text-primary" />
        <h1 className="text-3xl font-bold">Password Reset Testing</h1>
      </div>
      <p className="text-gray-600">Specifically test password reset functionality</p>

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Password Reset Tests</CardTitle>
          <CardDescription>Run specific tests for password reset functionality</CardDescription>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Button onClick={testPasswordResetAPI} disabled={isLoading} variant="outline">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Test API Route
            </Button>

            <Button onClick={testForgotPasswordForm} disabled={isLoading} variant="outline">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Test Form Flow
            </Button>

            <Button onClick={testEmailServiceDirectly} disabled={isLoading} variant="outline">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Test Email Service
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
          <CardDescription>Detailed results from password reset tests</CardDescription>
        </CardHeader>
        <CardContent>
          {testResults.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No test results yet. Run a test above to see results.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <p className={`font-medium ${result.success ? "text-green-800" : "text-red-800"}`}>
                          {result.message}
                        </p>
                        <Badge variant={result.success ? "default" : "destructive"}>{result.timestamp}</Badge>
                      </div>
                      {result.details && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                            Show Technical Details
                          </summary>
                          <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
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

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common debugging actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" asChild>
              <a href="/forgot-password" target="_blank" rel="noreferrer">
                Open Forgot Password Page
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/admin/test/email" target="_blank" rel="noreferrer">
                Open Email Testing Page
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
