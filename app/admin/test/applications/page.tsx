"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Database, RefreshCw } from "lucide-react"

interface Application {
  id: string
  email: string
  phone: string
  status: string
  currentStep: number
  createdAt: string
  updatedAt: string
}

export default function ApplicationTestPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [count, setCount] = useState(0)
  const [recentApplications, setRecentApplications] = useState<Application[]>([])
  const [refreshing, setRefreshing] = useState(false)

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/test/database/applications/count")
      const data = await response.json()

      if (data.success) {
        setCount(data.count)
        setRecentApplications(data.recentApplications || [])

        toast({
          title: "Database Check",
          description: data.message,
        })
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to check applications",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to database",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchApplications()
    setRefreshing(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Application Database Test</h1>
        <Button onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Application Database Status
          </CardTitle>
          <CardDescription>This page checks if applications are being saved to the database</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="text-lg">Checking database...</div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">{count}</div>
                  <div className="text-sm text-gray-500">Applications in Database</div>
                </div>
              </div>

              {count === 0 ? (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <p className="text-yellow-800">No applications found in the database. This could mean:</p>
                  <ul className="list-disc pl-5 mt-2 text-yellow-700 text-sm">
                    <li>No applications have been submitted yet</li>
                    <li>Applications are being saved to localStorage instead of the database</li>
                    <li>There's an issue with the database connection or configuration</li>
                  </ul>
                  <p className="mt-2 text-sm text-yellow-800">
                    Try submitting a new application and check this page again.
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-medium">Recent Applications</h3>
                  <div className="space-y-4">
                    {recentApplications.map((app) => (
                      <div key={app.id} className="p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{app.email}</div>
                            <div className="text-sm text-gray-500">{app.phone}</div>
                          </div>
                          <Badge>{app.status}</Badge>
                        </div>
                        <div className="mt-2 text-sm text-gray-500">
                          <span>Step {app.currentStep}</span>
                          <span className="mx-2">•</span>
                          <span>Created: {formatDate(app.createdAt)}</span>
                          <span className="mx-2">•</span>
                          <span>Updated: {formatDate(app.updatedAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-blue-800 font-medium">Troubleshooting Steps:</p>
                <ol className="list-decimal pl-5 mt-2 text-blue-700 text-sm">
                  <li>Make sure your database is running and accessible</li>
                  <li>Check that your DATABASE_URL in .env.local is correct</li>
                  <li>Verify that the application table exists in your database</li>
                  <li>
                    Try submitting a test application at{" "}
                    <a href="/application" className="underline">
                      /application
                    </a>
                  </li>
                  <li>Check the browser console and server logs for errors</li>
                </ol>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
