"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Database, Code, Server } from "lucide-react"

export default function DatabaseTroubleshooter() {
  const [activeTab, setActiveTab] = useState("connection")
  const [isLoading, setIsLoading] = useState(false)
  const [connectionResult, setConnectionResult] = useState<any>(null)
  const [envVars, setEnvVars] = useState<any>(null)
  const [testQuery, setTestQuery] = useState("SELECT NOW() as time, version() as version")
  const [queryResult, setQueryResult] = useState<any>(null)
  const [isQueryLoading, setIsQueryLoading] = useState(false)
  const [fixAttempted, setFixAttempted] = useState(false)

  const testConnection = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/test/database/connection", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      })
      const data = await response.json()
      setConnectionResult(data)
    } catch (error) {
      setConnectionResult({
        success: false,
        error: "Failed to fetch connection status",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const checkEnvVars = async () => {
    try {
      const response = await fetch("/api/test/database/env-vars")
      const data = await response.json()
      setEnvVars(data)
    } catch (error) {
      setEnvVars({
        success: false,
        error: "Failed to fetch environment variables",
      })
    }
  }

  const runTestQuery = async () => {
    setIsQueryLoading(true)
    try {
      const response = await fetch("/api/test/database/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: testQuery }),
      })
      const data = await response.json()
      setQueryResult(data)
    } catch (error) {
      setQueryResult({
        success: false,
        error: "Failed to execute query",
      })
    } finally {
      setIsQueryLoading(false)
    }
  }

  const attemptFix = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/test/database/fix-connection", {
        method: "POST",
      })
      const data = await response.json()
      setFixAttempted(true)
      // Test connection again after fix attempt
      await testConnection()
    } catch (error) {
      console.error("Fix attempt failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    testConnection()
    checkEnvVars()
  }, [])

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Database className="h-6 w-6 text-primary" />
                Database Connection Troubleshooter
              </CardTitle>
              <CardDescription>Diagnose and fix Neon database connection issues</CardDescription>
            </div>
            <Button onClick={testConnection} disabled={isLoading} className="flex items-center gap-2">
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Test Connection
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {connectionResult && (
            <Alert
              className={`mb-4 ${
                connectionResult.success
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              <div className="flex items-center gap-2">
                {connectionResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <AlertTitle>{connectionResult.success ? "Connection Successful" : "Connection Failed"}</AlertTitle>
              </div>
              <AlertDescription className="mt-2">
                {connectionResult.success
                  ? `Connected to database using ${connectionResult.method || "unknown"} method`
                  : connectionResult.message || "Unable to connect to database"}
              </AlertDescription>
              {connectionResult.data && (
                <div className="mt-2 p-2 bg-white/50 rounded text-sm">
                  <div>
                    <strong>Time:</strong>{" "}
                    {connectionResult.data.current_time || connectionResult.data[0]?.current_time}
                  </div>
                  <div>
                    <strong>Version:</strong> {connectionResult.data.version || connectionResult.data[0]?.version}
                  </div>
                </div>
              )}
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="connection">Connection</TabsTrigger>
              <TabsTrigger value="environment">Environment</TabsTrigger>
              <TabsTrigger value="query">Test Query</TabsTrigger>
            </TabsList>

            <TabsContent value="connection" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Connection Status</h3>
                {connectionResult?.success === false && (
                  <div className="space-y-4">
                    <Alert className="bg-amber-50 border-amber-200">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                      <AlertTitle>Connection Issue Detected</AlertTitle>
                      <AlertDescription>
                        {connectionResult.error || connectionResult.message || "Unknown connection error"}
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                      <h4 className="font-medium">Common Solutions:</h4>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Verify your DATABASE_URL environment variable is correct</li>
                        <li>Check if your Neon database is active and accessible</li>
                        <li>Ensure your IP is allowed in Neon's IP restrictions</li>
                        <li>Try using the Neon serverless driver configuration</li>
                      </ul>
                    </div>

                    <Button onClick={attemptFix} disabled={isLoading} className="w-full">
                      {isLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                          Attempting Fix...
                        </>
                      ) : (
                        "Attempt Automatic Fix"
                      )}
                    </Button>

                    {fixAttempted && (
                      <Alert
                        className={
                          connectionResult.success ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"
                        }
                      >
                        <AlertTitle>{connectionResult.success ? "Fix Successful" : "Fix Attempted"}</AlertTitle>
                        <AlertDescription>
                          {connectionResult.success
                            ? "Connection has been restored successfully!"
                            : "Automatic fix attempted but connection issues persist. Please try manual solutions."}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}

                {connectionResult?.success === true && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <AlertTitle>Connection is Healthy</AlertTitle>
                    <AlertDescription>Your database connection is working properly. No action needed.</AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>

            <TabsContent value="environment" className="space-y-4">
              <h3 className="text-lg font-medium">Environment Variables</h3>
              {envVars ? (
                <div className="space-y-4">
                  {Object.entries(envVars.variables || {}).map(([key, value]: [string, any]) => (
                    <div key={key} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{key}</div>
                        <Badge
                          variant={value.set ? "default" : "destructive"}
                          className={value.set ? "bg-green-100 text-green-800" : ""}
                        >
                          {value.set ? "Set" : "Missing"}
                        </Badge>
                      </div>
                      {value.set && value.masked && <div className="mt-1 text-sm text-gray-500">{value.masked}</div>}
                    </div>
                  ))}

                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertTitle>Required Variables</AlertTitle>
                    <AlertDescription className="space-y-1">
                      <p>Make sure these environment variables are properly set:</p>
                      <ul className="list-disc pl-5 text-sm">
                        <li>
                          <strong>DATABASE_URL</strong> - Main connection string for Neon
                        </li>
                        <li>
                          <strong>POSTGRES_URL</strong> or <strong>POSTGRES_PRISMA_URL</strong> - For Prisma
                        </li>
                        <li>
                          <strong>DIRECT_URL</strong> - Direct connection without pooling (optional)
                        </li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <div className="flex justify-center p-4">
                  <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              )}
            </TabsContent>

            <TabsContent value="query" className="space-y-4">
              <h3 className="text-lg font-medium">Test SQL Query</h3>
              <div className="space-y-2">
                <Label htmlFor="query">SQL Query</Label>
                <Textarea
                  id="query"
                  value={testQuery}
                  onChange={(e) => setTestQuery(e.target.value)}
                  className="font-mono"
                  rows={3}
                />
              </div>

              <Button onClick={runTestQuery} disabled={isQueryLoading} className="flex items-center gap-2">
                {isQueryLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Code className="h-4 w-4" />
                    Run Query
                  </>
                )}
              </Button>

              {queryResult && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Result:</h4>
                  <div
                    className={`p-3 rounded-lg ${
                      queryResult.success ? "bg-green-50 border border-green-100" : "bg-red-50 border border-red-100"
                    }`}
                  >
                    {queryResult.success ? (
                      <pre className="whitespace-pre-wrap text-sm overflow-auto max-h-60">
                        {JSON.stringify(queryResult.data, null, 2)}
                      </pre>
                    ) : (
                      <div className="text-red-600">{queryResult.error || "Query failed"}</div>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <div className="text-sm text-gray-500">
            <Server className="h-4 w-4 inline mr-1" />
            Database: {connectionResult?.database || "Unknown"}
          </div>
          <div className="text-sm text-gray-500">
            Last checked:{" "}
            {connectionResult?.timestamp ? new Date(connectionResult.timestamp).toLocaleString() : "Never"}
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Neon Database Connection Guide</CardTitle>
          <CardDescription>Follow these steps to fix common Neon connection issues</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-medium">1. Check Your Connection String</h3>
            <p className="text-sm text-gray-600">Ensure your DATABASE_URL is in the correct format:</p>
            <div className="bg-gray-50 p-3 rounded font-mono text-sm">
              postgresql://username:password@endpoint:5432/database?sslmode=require
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">2. Configure Neon for Serverless</h3>
            <p className="text-sm text-gray-600">Add this configuration to your database.ts file:</p>
            <div className="bg-gray-50 p-3 rounded font-mono text-sm">
              <pre>{`import { neonConfig } from "@neondatabase/serverless"

neonConfig.fetchConnectionCache = true
neonConfig.wsProxy = (host) => \`\${host}:5432/v1\`
neonConfig.useSecureWebSocket = true`}</pre>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">3. Use Connection Pooling</h3>
            <p className="text-sm text-gray-600">
              Enable connection pooling in your Neon project settings and use the pooled connection URL.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">4. Implement Retry Logic</h3>
            <p className="text-sm text-gray-600">Add retry logic for transient connection issues:</p>
            <div className="bg-gray-50 p-3 rounded font-mono text-sm">
              <pre>{`const executeWithRetry = async (fn, maxRetries = 3) => {
  let lastError
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempt - 1)))
      }
    }
  }
  throw lastError
}`}</pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
