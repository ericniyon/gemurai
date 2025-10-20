"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Wrench, Zap } from "lucide-react"

export default function DatabaseFix() {
  const [status, setStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [fixResult, setFixResult] = useState<any>(null)
  const [resetResult, setResetResult] = useState<any>(null)
  const [isChecking, setIsChecking] = useState(true)

  const checkStatus = async () => {
    setIsChecking(true)
    try {
      const response = await fetch("/api/database/fix-prisma")
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error("Failed to check status:", error)
      setStatus({
        success: false,
        error: "Failed to check database status",
      })
    } finally {
      setIsChecking(false)
    }
  }

  const runFix = async () => {
    setIsLoading(true)
    setFixResult(null)

    try {
      const response = await fetch("/api/database/fix-prisma", {
        method: "POST",
      })

      const data = await response.json()
      setFixResult(data)

      if (data.success) {
        await checkStatus()
      }
    } catch (error) {
      console.error("Fix failed:", error)
      setFixResult({
        success: false,
        error: "Failed to run fix",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const runReset = async () => {
    setIsLoading(true)
    setResetResult(null)

    try {
      const response = await fetch("/api/database/reset-prisma", {
        method: "POST",
      })

      const data = await response.json()
      setResetResult(data)

      if (data.success) {
        await checkStatus()
      }
    } catch (error) {
      console.error("Reset failed:", error)
      setResetResult({
        success: false,
        error: "Failed to run reset",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkStatus()
  }, [])

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Wrench className="h-6 w-6 text-primary" />
                Database & Prisma Fix
              </CardTitle>
              <CardDescription>Fix Prisma table mapping and database connection issues</CardDescription>
            </div>
            <Button onClick={checkStatus} disabled={isChecking} variant="outline" className="flex items-center gap-2">
              {isChecking ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Current Status */}
          <div>
            <h3 className="text-lg font-medium mb-3">Current Status</h3>

            {isChecking ? (
              <div className="flex items-center justify-center p-8">
                <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : status ? (
              <div className="space-y-4">
                <Alert
                  className={`${
                    status.success && !status.needsFix ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {status.success && !status.needsFix ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                    )}
                    <AlertTitle>{status.success && !status.needsFix ? "Database OK" : "Fix Required"}</AlertTitle>
                  </div>
                  <AlertDescription className="mt-2">
                    {status.success && !status.needsFix
                      ? "Database and Prisma are working correctly."
                      : "Database table mapping issues detected."}
                  </AlertDescription>
                </Alert>

                {/* Table Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Applications Table</h4>
                    <div className="flex items-center gap-2">
                      {status.applicationsExists ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm">{status.applicationsExists ? "Exists" : "Missing"}</span>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Application Table (Singular)</h4>
                    <div className="flex items-center gap-2">
                      {status.applicationExists ? (
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                      <span className="text-sm">
                        {status.applicationExists ? "Exists (Wrong Name)" : "Not Found (Good)"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tables List */}
                {status.tables && status.tables.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">All Tables ({status.tables.length})</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {status.tables.map((table: string) => (
                        <Badge
                          key={table}
                          variant={table === "applications" ? "default" : "secondary"}
                          className="justify-start"
                        >
                          {table}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Alert className="bg-red-50 border-red-200">
                <XCircle className="h-5 w-5 text-red-600" />
                <AlertTitle>Unable to Check Status</AlertTitle>
                <AlertDescription>Failed to retrieve database information.</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Fix Actions */}
          {status && status.needsFix && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Fix Actions</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Quick Fix */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Wrench className="h-4 w-4" />
                      Quick Fix
                    </CardTitle>
                    <CardDescription className="text-sm">Fix table naming and create missing tables</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={runFix} disabled={isLoading} className="w-full" variant="default">
                      {isLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                          Fixing...
                        </>
                      ) : (
                        <>
                          <Wrench className="h-4 w-4 mr-2" />
                          Run Quick Fix
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Full Reset */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Full Reset
                    </CardTitle>
                    <CardDescription className="text-sm">Reset Prisma client and recreate connections</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={runReset} disabled={isLoading} className="w-full" variant="secondary">
                      {isLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                          Resetting...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          Full Reset
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Results */}
          {(fixResult || resetResult) && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Results</h3>

              {fixResult && (
                <Alert className={`${fixResult.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                  <div className="flex items-center gap-2">
                    {fixResult.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <AlertTitle>Quick Fix {fixResult.success ? "Successful" : "Failed"}</AlertTitle>
                  </div>
                  <AlertDescription className="mt-2">
                    {fixResult.message || fixResult.error}
                    {fixResult.suggestion && (
                      <div className="mt-2 text-sm font-medium">Suggestion: {fixResult.suggestion}</div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {resetResult && (
                <Alert
                  className={`${resetResult.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
                >
                  <div className="flex items-center gap-2">
                    {resetResult.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <AlertTitle>Full Reset {resetResult.success ? "Successful" : "Failed"}</AlertTitle>
                  </div>
                  <AlertDescription className="mt-2">
                    {resetResult.message || resetResult.error}
                    {resetResult.suggestion && (
                      <div className="mt-2 text-sm font-medium">Suggestion: {resetResult.suggestion}</div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Manual Steps (If Automated Fix Fails)</CardTitle>
          <CardDescription>Follow these steps if the automated fixes don't work</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">1. Regenerate Prisma Client</h4>
              <code className="text-sm bg-gray-100 p-2 rounded block">npx prisma generate</code>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">2. Push Schema to Database</h4>
              <code className="text-sm bg-gray-100 p-2 rounded block">npx prisma db push</code>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">3. Restart Development Server</h4>
              <code className="text-sm bg-gray-100 p-2 rounded block">npm run dev</code>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">4. Check Database Setup</h4>
              <Button variant="outline" size="sm" asChild>
                <a href="/database-setup-wizard">Database Setup Wizard</a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
