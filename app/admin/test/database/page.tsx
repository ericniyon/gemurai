"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, Database } from "lucide-react"

interface TestResult {
  name: string
  status: "success" | "error" | "warning" | "pending"
  message: string
  details?: any
}

export default function DatabaseTestPage() {
  const [results, setResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const addResult = (result: TestResult) => {
    setResults((prev) => [...prev, result])
  }

  const clearResults = () => {
    setResults([])
  }

  const runDatabaseTests = async () => {
    setIsRunning(true)
    clearResults()

    // Test 1: Database Connection
    addResult({ name: "Database Connection", status: "pending", message: "Testing connection..." })
    try {
      const response = await fetch("/api/test/database/connection")
      const data = await response.json()

      if (data.success) {
        addResult({
          name: "Database Connection",
          status: "success",
          message: "Database connected successfully",
          details: data.details,
        })
      } else {
        addResult({
          name: "Database Connection",
          status: "error",
          message: data.message || "Connection failed",
          details: data.error,
        })
      }
    } catch (error: any) {
      addResult({
        name: "Database Connection",
        status: "error",
        message: `Connection test failed: ${error.message}`,
      })
    }

    // Test 2: Tables Existence
    addResult({ name: "Database Tables", status: "pending", message: "Checking tables..." })
    try {
      const response = await fetch("/api/test/database/tables")
      const data = await response.json()

      if (data.success) {
        addResult({
          name: "Database Tables",
          status: "success",
          message: `Found ${data.tables.length} tables`,
          details: data.tables,
        })
      } else {
        addResult({
          name: "Database Tables",
          status: "error",
          message: data.message || "Failed to check tables",
        })
      }
    } catch (error: any) {
      addResult({
        name: "Database Tables",
        status: "error",
        message: `Table check failed: ${error.message}`,
      })
    }

    // Test 3: User Table Operations
    addResult({ name: "User Operations", status: "pending", message: "Testing user operations..." })
    try {
      const response = await fetch("/api/test/database/users")
      const data = await response.json()

      if (data.success) {
        addResult({
          name: "User Operations",
          status: "success",
          message: `User operations working. Found ${data.userCount} users`,
          details: data.details,
        })
      } else {
        addResult({
          name: "User Operations",
          status: "error",
          message: data.message || "User operations failed",
        })
      }
    } catch (error: any) {
      addResult({
        name: "User Operations",
        status: "error",
        message: `User test failed: ${error.message}`,
      })
    }

    // Test 4: Application Table Operations
    addResult({ name: "Application Operations", status: "pending", message: "Testing application operations..." })
    try {
      const response = await fetch("/api/test/database/applications")
      const data = await response.json()

      if (data.success) {
        addResult({
          name: "Application Operations",
          status: "success",
          message: `Application operations working. Found ${data.applicationCount} applications`,
          details: data.details,
        })
      } else {
        addResult({
          name: "Application Operations",
          status: "error",
          message: data.message || "Application operations failed",
        })
      }
    } catch (error: any) {
      addResult({
        name: "Application Operations",
        status: "error",
        message: `Application test failed: ${error.message}`,
      })
    }

    // Test 5: Email/SMS Logs
    addResult({ name: "Log Operations", status: "pending", message: "Testing log operations..." })
    try {
      const response = await fetch("/api/test/database/logs")
      const data = await response.json()

      if (data.success) {
        addResult({
          name: "Log Operations",
          status: "success",
          message: `Log operations working. Found ${data.emailLogs} email logs, ${data.smsLogs} SMS logs`,
          details: data.details,
        })
      } else {
        addResult({
          name: "Log Operations",
          status: "error",
          message: data.message || "Log operations failed",
        })
      }
    } catch (error: any) {
      addResult({
        name: "Log Operations",
        status: "error",
        message: `Log test failed: ${error.message}`,
      })
    }

    setIsRunning(false)
  }

  const testDataInsertion = async () => {
    setIsRunning(true)

    addResult({ name: "Data Insertion Test", status: "pending", message: "Testing data insertion..." })
    try {
      const response = await fetch("/api/test/database/insert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testEmail: `test-${Date.now()}@example.com`,
          testName: `Test User ${Date.now()}`,
        }),
      })
      const data = await response.json()

      if (data.success) {
        addResult({
          name: "Data Insertion Test",
          status: "success",
          message: "Test data inserted successfully",
          details: data.details,
        })
      } else {
        addResult({
          name: "Data Insertion Test",
          status: "error",
          message: data.message || "Data insertion failed",
        })
      }
    } catch (error: any) {
      addResult({
        name: "Data Insertion Test",
        status: "error",
        message: `Data insertion failed: ${error.message}`,
      })
    }

    setIsRunning(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-blue-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800"
      case "error":
        return "bg-red-100 text-red-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Database className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Database Diagnostics</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Database Tests</CardTitle>
            <CardDescription>Run comprehensive database connectivity and functionality tests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={runDatabaseTests} disabled={isRunning} className="w-full">
              {isRunning ? "Running Tests..." : "Run Database Tests"}
            </Button>

            <Button onClick={testDataInsertion} disabled={isRunning} variant="outline" className="w-full">
              {isRunning ? "Testing..." : "Test Data Insertion"}
            </Button>

            <Button onClick={clearResults} variant="outline" className="w-full">
              Clear Results
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Environment Info</CardTitle>
            <CardDescription>Current database configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm">
              <strong>Database URL:</strong> {process.env.DATABASE_URL ? "Set" : "Not Set"}
            </div>
            <div className="text-sm">
              <strong>Direct URL:</strong> {process.env.DIRECT_URL ? "Set" : "Not Set"}
            </div>
            <div className="text-sm">
              <strong>Environment:</strong> {process.env.NODE_ENV || "development"}
            </div>
          </CardContent>
        </Card>
      </div>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>Database diagnostic results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      <span className="font-medium">{result.name}</span>
                    </div>
                    <Badge className={getStatusColor(result.status)}>{result.status}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{result.message}</p>
                  {result.details && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-blue-600">View Details</summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
