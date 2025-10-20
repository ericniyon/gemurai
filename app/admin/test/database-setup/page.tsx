"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Database, Play, CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function DatabaseSetup() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<{
    seed: { success: boolean; message: string; data?: any } | null
  }>({
    seed: null,
  })

  const runSeed = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test/database/seed", {
        method: "POST",
      })
      const data = await response.json()

      setResults((prev) => ({
        ...prev,
        seed: data,
      }))

      if (data.success) {
        toast({
          title: "Database seeded successfully",
          description: data.message,
        })
      } else {
        toast({
          title: "Seeding failed",
          description: data.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      const errorResult = {
        success: false,
        message: "Failed to seed database",
        error: error instanceof Error ? error.message : "Unknown error",
      }

      setResults((prev) => ({
        ...prev,
        seed: errorResult,
      }))

      toast({
        title: "Error",
        description: "Failed to seed database",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Database Setup</h1>
        <p className="text-muted-foreground">Initialize your database with sample data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Seed Database */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Seed Database
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This will create sample users and applications in your database.
            </p>

            {results.seed && (
              <Alert className={results.seed.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                <AlertDescription>
                  <div className="flex items-center gap-2 mb-2">
                    {results.seed.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <strong>{results.seed.success ? "Success" : "Failed"}</strong>
                  </div>
                  <p>{results.seed.message}</p>

                  {results.seed.data && results.seed.data.users && (
                    <div className="mt-4">
                      <strong>Test Accounts Created:</strong>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        {results.seed.data.users.map((user: any, index: number) => (
                          <li key={index} className="text-sm">
                            <strong>{user.email}</strong> ({user.role}) - Password: {user.password}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <Button onClick={runSeed} disabled={loading} className="w-full">
              <Play className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Seeding..." : "Seed Database"}
            </Button>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Setup Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <Badge variant="outline" className="mb-2">
                  Step 1
                </Badge>
                <p className="text-sm">Make sure your PostgreSQL database is running</p>
              </div>

              <div>
                <Badge variant="outline" className="mb-2">
                  Step 2
                </Badge>
                <p className="text-sm">Check your .env.local file has correct DATABASE_URL</p>
              </div>

              <div>
                <Badge variant="outline" className="mb-2">
                  Step 3
                </Badge>
                <p className="text-sm">Run the database diagnostic to check connection</p>
              </div>

              <div>
                <Badge variant="outline" className="mb-2">
                  Step 4
                </Badge>
                <p className="text-sm">Seed the database with sample data</p>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Manual Setup Commands:</strong>
                <div className="mt-2 space-y-1">
                  <code className="bg-gray-100 px-2 py-1 rounded block text-xs">npx prisma generate</code>
                  <code className="bg-gray-100 px-2 py-1 rounded block text-xs">npx prisma db push</code>
                  <code className="bg-gray-100 px-2 py-1 rounded block text-xs">npx prisma db seed</code>
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" asChild>
              <a href="/admin/test/database-diagnostic">
                <Database className="mr-2 h-4 w-4" />
                Run Diagnostics
              </a>
            </Button>

            <Button variant="outline" asChild>
              <a href="/admin/users">
                <RefreshCw className="mr-2 h-4 w-4" />
                View Users
              </a>
            </Button>

            <Button variant="outline" asChild>
              <a href="/admin/applications">
                <RefreshCw className="mr-2 h-4 w-4" />
                View Applications
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
