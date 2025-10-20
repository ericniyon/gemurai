"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, RefreshCw, Database, CheckCircle, XCircle } from "lucide-react"

export default function TestDatabasePage() {
  const [connectionTest, setConnectionTest] = useState<any>(null)
  const [fullDiagnostic, setFullDiagnostic] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test/database/connection-test")
      const data = await response.json()
      setConnectionTest(data)
    } catch (error) {
      setConnectionTest({
        success: false,
        message: "Failed to connect to API",
        error: error,
      })
    }
    setLoading(false)
  }

  const runFullDiagnostic = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test/database/full-diagnostic")
      const data = await response.json()
      setFullDiagnostic(data)
    } catch (error) {
      setFullDiagnostic({
        error: "Failed to run diagnostic",
        details: error,
      })
    }
    setLoading(false)
  }

  useEffect(() => {
    testConnection()
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Database className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Database Connection Test</h1>
      </div>

      <div className="grid gap-6">
        {/* Connection Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Basic Connection Test
            </CardTitle>
            <CardDescription>Tests basic database connectivity using Prisma</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={testConnection} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Test Connection
              </Button>
            </div>

            {connectionTest && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {connectionTest.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <Badge variant={connectionTest.success ? "default" : "destructive"}>
                    {connectionTest.success ? "SUCCESS" : "FAILED"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{connectionTest.message}</p>

                {connectionTest.success && connectionTest.data && (
                  <div className="bg-muted p-3 rounded-md">
                    <pre className="text-xs overflow-auto">{JSON.stringify(connectionTest.data, null, 2)}</pre>
                  </div>
                )}

                {!connectionTest.success && connectionTest.error && (
                  <div className="bg-red-50 border border-red-200 p-3 rounded-md">
                    <p className="text-sm text-red-800 font-medium">Error Details:</p>
                    <pre className="text-xs text-red-700 mt-1 overflow-auto">
                      {JSON.stringify(connectionTest.error, null, 2)}
                    </pre>
                  </div>
                )}

                {connectionTest.environment && (
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-md">
                    <p className="text-sm text-blue-800 font-medium">Environment:</p>
                    <pre className="text-xs text-blue-700 mt-1">
                      {JSON.stringify(connectionTest.environment, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Full Diagnostic */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Full Database Diagnostic
            </CardTitle>
            <CardDescription>Comprehensive database health check including tables and data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={runFullDiagnostic} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Run Full Diagnostic
              </Button>
            </div>

            {fullDiagnostic && (
              <div className="space-y-4">
                {fullDiagnostic.environment && (
                  <div>
                    <h4 className="font-medium mb-2">Environment Variables</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(fullDiagnostic.environment).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground">{key}:</span>
                          <span>{value as string}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {fullDiagnostic.tests && (
                  <div>
                    <h4 className="font-medium mb-2">Test Results</h4>
                    <div className="space-y-2">
                      {fullDiagnostic.tests.map((test: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <span className="font-medium">{test.name}</span>
                            <p className="text-sm text-muted-foreground">{test.message}</p>
                          </div>
                          <Badge variant={test.status.includes("✅") ? "default" : "destructive"}>{test.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
