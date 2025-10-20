"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, RefreshCw, Database, AlertTriangle } from "lucide-react"

interface DiagnosticResult {
  name: string
  status: "passed" | "failed" | "running"
  details?: any
  error?: string
}

export default function DatabaseSetupPage() {
  const [diagnostics, setDiagnostics] = useState<{
    tests: DiagnosticResult[]
    summary: { total: number; passed: number; failed: number }
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const runDiagnostics = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/test/database/comprehensive-diagnostic")
      const data = await response.json()
      setDiagnostics(data)
    } catch (error) {
      console.error("Failed to run diagnostics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "failed":
        return <XCircle className="h-5 w-5 text-red-600" />
      case "running":
        return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "passed":
        return <Badge className="bg-green-100 text-green-800">Passed</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      case "running":
        return <Badge className="bg-blue-100 text-blue-800">Running</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-6 w-6" />
                  Database Setup Verification
                </CardTitle>
                <CardDescription>Comprehensive diagnostics to verify database connection and setup</CardDescription>
              </div>
              <Button onClick={runDiagnostics} disabled={isLoading} className="flex items-center gap-2">
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Run Diagnostics
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Summary */}
        {diagnostics && (
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{diagnostics.summary.passed}</div>
                  <div className="text-sm text-green-700">Passed</div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{diagnostics.summary.failed}</div>
                  <div className="text-sm text-red-700">Failed</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">{diagnostics.summary.total}</div>
                  <div className="text-sm text-gray-700">Total</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Test Results */}
        {diagnostics && (
          <Card>
            <CardHeader>
              <CardTitle>Diagnostic Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {diagnostics.tests.map((test, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      test.status === "passed"
                        ? "border-green-200 bg-green-50"
                        : test.status === "failed"
                          ? "border-red-200 bg-red-50"
                          : "border-blue-200 bg-blue-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(test.status)}
                        <h3 className="font-medium">{test.name}</h3>
                      </div>
                      {getStatusBadge(test.status)}
                    </div>

                    {test.error && (
                      <div className="mt-2 p-2 bg-red-100 rounded text-sm text-red-700">
                        <strong>Error:</strong> {test.error}
                      </div>
                    )}

                    {test.details && (
                      <div className="mt-2">
                        <details className="text-sm">
                          <summary className="cursor-pointer text-gray-600 hover:text-gray-800">View Details</summary>
                          <div className="mt-2 p-2 bg-gray-100 rounded">
                            {typeof test.details === "object" ? (
                              <div className="space-y-1">
                                {Object.entries(test.details).map(([key, value]) => (
                                  <div key={key} className="flex justify-between">
                                    <span className="font-medium">{key}:</span>
                                    <span>{String(value)}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <pre className="text-xs overflow-auto">{JSON.stringify(test.details, null, 2)}</pre>
                            )}
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Setup Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">1. Environment Variables</h4>
              <p className="text-sm text-gray-600 mb-2">Ensure these environment variables are set:</p>
              <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                DATABASE_URL=your_database_url
                <br />
                POSTGRES_URL=your_postgres_url
                <br />
                POSTGRES_PRISMA_URL=your_prisma_url
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">2. Database Schema</h4>
              <p className="text-sm text-gray-600 mb-2">Run the database migration scripts:</p>
              <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                npx prisma db push
                <br />
                npx prisma generate
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">3. Test Connection</h4>
              <p className="text-sm text-gray-600">Use this page to verify your database setup is working correctly.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
