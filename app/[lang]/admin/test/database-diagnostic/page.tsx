"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, AlertCircle, Database, Users, FileText, RefreshCw, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DiagnosticResult {
  success: boolean
  message: string
  data?: any
  error?: string
}

export default function DatabaseDiagnostic() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<{
    connection: DiagnosticResult | null
    tables: DiagnosticResult | null
    users: DiagnosticResult | null
    applications: DiagnosticResult | null
    envVars: DiagnosticResult | null
  }>({
    connection: null,
    tables: null,
    users: null,
    applications: null,
    envVars: null,
  })
  const [showEnvVars, setShowEnvVars] = useState(false)

  const runDiagnostic = async (type: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/test/database/diagnostic?type=${type}`)
      const data = await response.json()

      setResults((prev) => ({
        ...prev,
        [type]: data,
      }))

      if (!data.success) {
        toast({
          title: `${type} check failed`,
          description: data.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        [type]: {
          success: false,
          message: "Failed to run diagnostic",
          error: error instanceof Error ? error.message : "Unknown error",
        },
      }))
    } finally {
      setLoading(false)
    }
  }

  const runAllDiagnostics = async () => {
    const diagnostics = ["connection", "envVars", "tables", "users", "applications"]
    for (const diagnostic of diagnostics) {
      await runDiagnostic(diagnostic)
    }
  }

  const getStatusIcon = (result: DiagnosticResult | null) => {
    if (!result) return <AlertCircle className="h-5 w-5 text-gray-400" />
    if (result.success) return <CheckCircle className="h-5 w-5 text-green-500" />
    return <XCircle className="h-5 w-5 text-red-500" />
  }

  const getStatusBadge = (result: DiagnosticResult | null) => {
    if (!result) return <Badge variant="secondary">Not Tested</Badge>
    if (result.success) return <Badge className="bg-green-100 text-green-800">Success</Badge>
    return <Badge className="bg-red-100 text-red-800">Failed</Badge>
  }

  useEffect(() => {
    runAllDiagnostics()
  }, [])

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Database Diagnostic</h1>
          <p className="text-muted-foreground">Comprehensive database connection and data analysis</p>
        </div>
        <Button onClick={runAllDiagnostics} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Run All Tests
        </Button>
      </div>

      {/* Quick Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4" />
              Connection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getStatusIcon(results.connection)}
              {getStatusBadge(results.connection)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Environment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getStatusIcon(results.envVars)}
              {getStatusBadge(results.envVars)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Tables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getStatusIcon(results.tables)}
              {getStatusBadge(results.tables)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getStatusIcon(results.users)}
              {getStatusBadge(results.users)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getStatusIcon(results.applications)}
              {getStatusBadge(results.applications)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="connection" className="space-y-4">
        <TabsList>
          <TabsTrigger value="connection">Connection</TabsTrigger>
          <TabsTrigger value="environment">Environment</TabsTrigger>
          <TabsTrigger value="tables">Tables</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="solutions">Solutions</TabsTrigger>
        </TabsList>

        <TabsContent value="connection">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Connection Test
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {results.connection && (
                <Alert
                  className={results.connection.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}
                >
                  <AlertDescription>
                    <strong>Status:</strong> {results.connection.message}
                    {results.connection.error && (
                      <div className="mt-2">
                        <strong>Error:</strong> {results.connection.error}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <Button onClick={() => runDiagnostic("connection")} disabled={loading}>
                Test Connection
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="environment">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Environment Variables
                <Button variant="ghost" size="sm" onClick={() => setShowEnvVars(!showEnvVars)}>
                  {showEnvVars ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {results.envVars && (
                <Alert
                  className={results.envVars.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}
                >
                  <AlertDescription>
                    <strong>Status:</strong> {results.envVars.message}
                    {results.envVars.data && showEnvVars && (
                      <div className="mt-4">
                        <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                          {JSON.stringify(results.envVars.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <Button onClick={() => runDiagnostic("envVars")} disabled={loading}>
                Check Environment
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tables">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Database Tables
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {results.tables && (
                <Alert className={results.tables.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  <AlertDescription>
                    <strong>Status:</strong> {results.tables.message}
                    {results.tables.data && (
                      <div className="mt-4">
                        <strong>Tables found:</strong>
                        <ul className="list-disc list-inside mt-2">
                          {results.tables.data.tables?.map((table: any) => (
                            <li key={table.name} className="text-sm">
                              {table.name} ({table.count} records)
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <Button onClick={() => runDiagnostic("tables")} disabled={loading}>
                Check Tables
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Data Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Users Data */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Users Data</h3>
                {results.users && (
                  <Alert
                    className={results.users.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}
                  >
                    <AlertDescription>
                      <strong>Status:</strong> {results.users.message}
                      {results.users.data && (
                        <div className="mt-4">
                          <strong>Users found:</strong> {results.users.data.count}
                          {results.users.data.users && (
                            <div className="mt-2">
                              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                                {JSON.stringify(results.users.data.users, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
                <Button onClick={() => runDiagnostic("users")} disabled={loading} className="mt-2">
                  Check Users
                </Button>
              </div>

              {/* Applications Data */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Applications Data</h3>
                {results.applications && (
                  <Alert
                    className={
                      results.applications.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                    }
                  >
                    <AlertDescription>
                      <strong>Status:</strong> {results.applications.message}
                      {results.applications.data && (
                        <div className="mt-4">
                          <strong>Applications found:</strong> {results.applications.data.count}
                          {results.applications.data.applications && (
                            <div className="mt-2">
                              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                                {JSON.stringify(results.applications.data.applications, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
                <Button onClick={() => runDiagnostic("applications")} disabled={loading} className="mt-2">
                  Check Applications
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="solutions">
          <Card>
            <CardHeader>
              <CardTitle>Common Solutions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>If you can't see data in your database:</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Check if DATABASE_URL is correctly set in .env.local</li>
                    <li>Verify your PostgreSQL server is running</li>
                    <li>
                      Run: <code className="bg-gray-100 px-1 rounded">npx prisma db push</code>
                    </li>
                    <li>
                      Run: <code className="bg-gray-100 px-1 rounded">npx prisma db seed</code>
                    </li>
                    <li>Check database permissions</li>
                    <li>Verify the database name exists</li>
                  </ol>
                </AlertDescription>
              </Alert>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Quick Fix Commands:</strong>
                  <div className="mt-2 space-y-1">
                    <div>
                      <code className="bg-gray-100 px-2 py-1 rounded block">npx prisma generate</code>
                    </div>
                    <div>
                      <code className="bg-gray-100 px-2 py-1 rounded block">npx prisma db push</code>
                    </div>
                    <div>
                      <code className="bg-gray-100 px-2 py-1 rounded block">npx prisma db seed</code>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Database URL Format:</strong>
                  <div className="mt-2">
                    <code className="bg-gray-100 px-2 py-1 rounded block">
                      postgresql://username:password@localhost:5432/database_name
                    </code>
                  </div>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
