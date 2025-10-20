"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Database, Play, CheckCheck } from "lucide-react"

export default function DatabaseSetupWizard() {
  const [currentState, setCurrentState] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [setupResult, setSetupResult] = useState<any>(null)
  const [isChecking, setIsChecking] = useState(true)

  const checkDatabaseState = async () => {
    setIsChecking(true)
    try {
      const response = await fetch("/api/database/setup")
      const data = await response.json()
      setCurrentState(data)
    } catch (error) {
      console.error("Failed to check database state:", error)
      setCurrentState({
        success: false,
        error: "Failed to connect to database",
      })
    } finally {
      setIsChecking(false)
    }
  }

  const runDatabaseSetup = async () => {
    setIsLoading(true)
    setSetupResult(null)

    try {
      const response = await fetch("/api/database/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()
      setSetupResult(data)

      // Refresh the current state
      if (data.success) {
        await checkDatabaseState()
      }
    } catch (error) {
      console.error("Database setup failed:", error)
      setSetupResult({
        success: false,
        error: "Failed to run database setup",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkDatabaseState()
  }, [])

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Database className="h-6 w-6 text-primary" />
                Database Setup Wizard
              </CardTitle>
              <CardDescription>Set up the Gemurai Platform database tables and initial data</CardDescription>
            </div>
            <Button
              onClick={checkDatabaseState}
              disabled={isChecking}
              variant="outline"
              className="flex items-center gap-2"
            >
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
          {/* Current State */}
          <div>
            <h3 className="text-lg font-medium mb-3">Current Database State</h3>

            {isChecking ? (
              <div className="flex items-center justify-center p-8">
                <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : currentState ? (
              <div className="space-y-4">
                {currentState.success ? (
                  <Alert
                    className={`${currentState.applicationTableExists ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}
                  >
                    <div className="flex items-center gap-2">
                      {currentState.applicationTableExists ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                      )}
                      <AlertTitle>
                        {currentState.applicationTableExists ? "Database Ready" : "Setup Required"}
                      </AlertTitle>
                    </div>
                    <AlertDescription className="mt-2">
                      {currentState.applicationTableExists
                        ? "All required tables exist. Your database is ready to use."
                        : "The applications table and other core tables need to be created."}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="bg-red-50 border-red-200">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <AlertTitle>Database Connection Failed</AlertTitle>
                    <AlertDescription className="mt-2">
                      {currentState.error || "Unable to connect to the database"}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Tables List */}
                {currentState.tables && currentState.tables.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Existing Tables ({currentState.tables.length})</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {currentState.tables.map((table: any) => (
                        <Badge key={table.table_name} variant="secondary" className="justify-start">
                          {table.table_name}
                          {table.column_count && (
                            <span className="ml-1 text-xs opacity-70">({table.column_count} cols)</span>
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {currentState.tables && currentState.tables.length === 0 && (
                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertTriangle className="h-5 w-5 text-blue-600" />
                    <AlertTitle>Empty Database</AlertTitle>
                    <AlertDescription>
                      No tables found. This appears to be a fresh database that needs initial setup.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <Alert className="bg-red-50 border-red-200">
                <XCircle className="h-5 w-5 text-red-600" />
                <AlertTitle>Unable to Check Database</AlertTitle>
                <AlertDescription>
                  Failed to retrieve database information. Please check your connection.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Setup Action */}
          {currentState && !currentState.applicationTableExists && (
            <div>
              <h3 className="text-lg font-medium mb-3">Database Setup</h3>
              <Alert className="bg-blue-50 border-blue-200 mb-4">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
                <AlertTitle>Setup Required</AlertTitle>
                <AlertDescription>
                  Click the button below to create all required tables and insert initial data. This process is safe and
                  will not affect existing data.
                </AlertDescription>
              </Alert>

              <Button
                onClick={runDatabaseSetup}
                disabled={isLoading}
                className="w-full flex items-center gap-2"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    Setting up database...
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    Run Database Setup
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Setup Results */}
          {setupResult && (
            <div>
              <h3 className="text-lg font-medium mb-3">Setup Results</h3>
              <Alert className={`${setupResult.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                <div className="flex items-center gap-2">
                  {setupResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <AlertTitle>{setupResult.success ? "Setup Successful!" : "Setup Failed"}</AlertTitle>
                </div>
                <AlertDescription className="mt-2">{setupResult.message || setupResult.error}</AlertDescription>

                {setupResult.steps && (
                  <div className="mt-3 space-y-1">
                    {setupResult.steps.map((step: string, index: number) => (
                      <div key={index} className="text-sm flex items-center gap-2">
                        <CheckCheck className="h-4 w-4 text-green-600" />
                        {step}
                      </div>
                    ))}
                  </div>
                )}

                {setupResult.tables && (
                  <div className="mt-3">
                    <div className="text-sm font-medium">Created Tables:</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {setupResult.tables.map((table: string) => (
                        <Badge key={table} variant="secondary" className="text-xs">
                          {table}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </Alert>
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t pt-4">
          <div className="text-sm text-gray-500">
            <Database className="h-4 w-4 inline mr-1" />
            Gemurai Platform Database Setup Wizard
          </div>
        </CardFooter>
      </Card>

      {/* Next Steps */}
      {currentState?.applicationTableExists && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">✅ Next Steps</CardTitle>
            <CardDescription>Your database is ready! Here's what you can do next:</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Test Application Form</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Try submitting a test application to verify everything works.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <a href="/application">Test Form</a>
                </Button>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Admin Dashboard</h4>
                <p className="text-sm text-gray-600 mb-3">Access the admin panel to manage applications and users.</p>
                <Button variant="outline" size="sm" asChild>
                  <a href="/admin">Admin Panel</a>
                </Button>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Database Troubleshooter</h4>
                <p className="text-sm text-gray-600 mb-3">Advanced database diagnostics and connection testing.</p>
                <Button variant="outline" size="sm" asChild>
                  <a href="/database-troubleshooter">Troubleshooter</a>
                </Button>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">API Documentation</h4>
                <p className="text-sm text-gray-600 mb-3">Explore the available API endpoints and documentation.</p>
                <Button variant="outline" size="sm" asChild>
                  <a href="/api-docs">API Docs</a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
