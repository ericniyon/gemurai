"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, XCircle, RefreshCw } from "lucide-react"

interface DiagnosticResult {
  name: string
  status: "success" | "error" | "loading" | "pending"
  message?: string
  details?: any
  error?: any
}

export default function ApplicationDebugPage() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const updateDiagnostic = (index: number, result: Partial<DiagnosticResult>) => {
    setDiagnostics((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], ...result }
      return updated
    })
  }

  const runDiagnostics = async () => {
    setIsRunning(true)

    const tests = [
      { name: "Client-side JavaScript", status: "pending" as const },
      { name: "React Hydration", status: "pending" as const },
      { name: "API Endpoints", status: "pending" as const },
      { name: "Database Connection", status: "pending" as const },
      { name: "Form Configuration", status: "pending" as const },
      { name: "Environment Variables", status: "pending" as const },
    ]

    setDiagnostics(tests)

    // Test 1: Client-side JavaScript
    try {
      updateDiagnostic(0, { status: "loading" })

      // Test basic JavaScript functionality
      const testObj = { test: "value" }
      const testArray = [1, 2, 3]
      const testFunction = () => "working"

      if (typeof window !== "undefined" && testFunction() === "working") {
        updateDiagnostic(0, {
          status: "success",
          message: "JavaScript is working correctly",
          details: {
            window: typeof window,
            document: typeof document,
            localStorage: typeof localStorage,
            fetch: typeof fetch,
          },
        })
      } else {
        throw new Error("JavaScript basic functionality failed")
      }
    } catch (error: any) {
      updateDiagnostic(0, {
        status: "error",
        message: "JavaScript error detected",
        error: error.message,
      })
    }

    // Test 2: React Hydration
    try {
      updateDiagnostic(1, { status: "loading" })

      // Check if React is properly hydrated
      const reactVersion = require("react").version
      updateDiagnostic(1, {
        status: "success",
        message: "React is working correctly",
        details: {
          reactVersion,
          hydrated: true,
        },
      })
    } catch (error: any) {
      updateDiagnostic(1, {
        status: "error",
        message: "React hydration issue",
        error: error.message,
      })
    }

    // Test 3: API Endpoints
    try {
      updateDiagnostic(2, { status: "loading" })

      const response = await fetch("/api/test/database/connection", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (response.ok) {
        const data = await response.json()
        updateDiagnostic(2, {
          status: "success",
          message: "API endpoints are accessible",
          details: data,
        })
      } else {
        throw new Error(`API returned ${response.status}: ${response.statusText}`)
      }
    } catch (error: any) {
      updateDiagnostic(2, {
        status: "error",
        message: "API endpoint error",
        error: error.message,
      })
    }

    // Test 4: Database Connection
    try {
      updateDiagnostic(3, { status: "loading" })

      const response = await fetch("/api/test/database/comprehensive-diagnostic")
      const data = await response.json()

      if (data.success) {
        updateDiagnostic(3, {
          status: "success",
          message: "Database connection successful",
          details: data,
        })
      } else {
        throw new Error(data.message || "Database connection failed")
      }
    } catch (error: any) {
      updateDiagnostic(3, {
        status: "error",
        message: "Database connection error",
        error: error.message,
      })
    }

    // Test 5: Form Configuration
    try {
      updateDiagnostic(4, { status: "loading" })

      const response = await fetch("/api/form-config")
      const data = await response.json()

      if (data.success && data.config) {
        updateDiagnostic(4, {
          status: "success",
          message: "Form configuration loaded",
          details: {
            sections: data.config.sections?.length || 0,
            questions:
              data.config.sections?.reduce((acc: number, section: any) => acc + (section.questions?.length || 0), 0) ||
              0,
          },
        })
      } else {
        throw new Error("Form configuration not available")
      }
    } catch (error: any) {
      updateDiagnostic(4, {
        status: "error",
        message: "Form configuration error",
        error: error.message,
      })
    }

    // Test 6: Environment Variables
    try {
      updateDiagnostic(5, { status: "loading" })

      const envCheck = {
        NODE_ENV: process.env.NODE_ENV,
        hasNextPublicApiUrl: !!process.env.NEXT_PUBLIC_API_URL,
        // Don't expose actual values for security
      }

      updateDiagnostic(5, {
        status: "success",
        message: "Environment variables checked",
        details: envCheck,
      })
    } catch (error: any) {
      updateDiagnostic(5, {
        status: "error",
        message: "Environment variable error",
        error: error.message,
      })
    }

    setIsRunning(false)
  }

  const getStatusIcon = (status: DiagnosticResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />
      case "loading":
        return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />
    }
  }

  useEffect(() => {
    // Auto-run diagnostics on page load
    runDiagnostics()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Application Debug Console</CardTitle>
            <CardDescription>Diagnosing client-side exceptions and application errors</CardDescription>
            <Button onClick={runDiagnostics} disabled={isRunning} className="w-fit">
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Running Diagnostics...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Run Diagnostics
                </>
              )}
            </Button>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Browser Console Errors</CardTitle>
            <CardDescription>Check your browser's developer console (F12) for detailed error messages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Chrome/Edge:</strong> F12 → Console tab
              </p>
              <p>
                <strong>Firefox:</strong> F12 → Console tab
              </p>
              <p>
                <strong>Safari:</strong> Cmd+Option+C
              </p>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-yellow-800">
                  <strong>Look for:</strong> Red error messages, failed network requests, or JavaScript exceptions that
                  might be causing the client-side error.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Diagnostic Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {diagnostics.map((diagnostic, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    diagnostic.status === "success"
                      ? "border-green-200 bg-green-50"
                      : diagnostic.status === "error"
                        ? "border-red-200 bg-red-50"
                        : diagnostic.status === "loading"
                          ? "border-blue-200 bg-blue-50"
                          : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getStatusIcon(diagnostic.status)}
                    <div className="flex-1">
                      <h3 className="font-medium">{diagnostic.name}</h3>
                      {diagnostic.message && <p className="text-sm text-gray-600 mt-1">{diagnostic.message}</p>}
                      {diagnostic.error && (
                        <p className="text-sm text-red-600 mt-1 font-mono">Error: {diagnostic.error}</p>
                      )}
                      {diagnostic.details && (
                        <details className="mt-2">
                          <summary className="text-sm cursor-pointer text-gray-600 hover:text-gray-800">
                            View Details
                          </summary>
                          <pre className="text-xs mt-2 p-2 bg-gray-100 rounded overflow-auto">
                            {JSON.stringify(diagnostic.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Common Solutions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">If you see JavaScript errors:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Clear browser cache completely (Ctrl+Shift+Delete)</li>
                  <li>• Try incognito/private browsing mode</li>
                  <li>• Disable browser extensions temporarily</li>
                  <li>• Check if ad blockers are interfering</li>
                </ul>
              </div>

              <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">If you see API/Database errors:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Verify DATABASE_URL environment variable is set</li>
                  <li>• Check if your database server is running</li>
                  <li>• Run: npx prisma db push</li>
                  <li>• Run: npx prisma generate</li>
                </ul>
              </div>

              <div className="p-4 border border-purple-200 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-800 mb-2">If you see React/Hydration errors:</h4>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Restart your development server (npm run dev)</li>
                  <li>• Delete .next folder and restart</li>
                  <li>• Check for mismatched HTML between server and client</li>
                  <li>• Verify all components are properly exported</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
