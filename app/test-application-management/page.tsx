"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, Clock, Users, Database, TestTube, AlertCircle, UserPlus, Shield } from "lucide-react"
import { ApplicationApprovalDialog } from "@/components/application-approval-dialog"

interface TestApplication {
  id: string
  email: string
  phone: string
  status: string
  formData: any
  createdAt: string
  user?: {
    id: string
    name: string
    email: string
    role: string
  }
}

interface TestResult {
  test: string
  status: "success" | "error" | "pending"
  message: string
  data?: any
}

export default function TestApplicationManagement() {
  const { toast } = useToast()
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [applications, setApplications] = useState<TestApplication[]>([])
  const [selectedApplication, setSelectedApplication] = useState<TestApplication | null>(null)
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Test 1: Create Test Applications
  const createTestApplications = async () => {
    setIsLoading(true)
    const testData = [
      {
        email: "test.consumer@example.com",
        phone: "+250788123456",
        formData: {
          q1: "John",
          q2: "Doe",
          q7: "test.consumer@example.com",
          q8: "+250788123456",
          // interests field removed
          skills: ["computer basics"],
          province: "Kigali City",
          district: "Gasabo",
          sector: "Kimironko",
          cell: "Kimironko",
          village: "Kibagabaga",
        },
      },
      {
        email: "test.dcc@example.com",
        phone: "+250788654321",
        formData: {
          q1: "Jane",
          q2: "Smith",
          q7: "test.dcc@example.com",
          q8: "+250788654321",
          // interests field removed
          skills: ["digital services", "training", "business management"],
          province: "Southern Province",
          district: "Huye",
          sector: "Tumba",
          cell: "Tumba",
          village: "Matyazo",
        },
      },
      {
        email: "test.pending@example.com",
        phone: "+250788987654",
        formData: {
          q1: "Bob",
          q2: "Johnson",
          q7: "test.pending@example.com",
          q8: "+250788987654",
          // interests field removed
          skills: ["farming", "mobile apps"],
          province: "Northern Province",
          district: "Musanze",
          sector: "Muhoza",
          cell: "Muhoza",
          village: "Cyuve",
        },
      },
    ]

    const results: TestResult[] = []

    for (const data of testData) {
      try {
        const response = await fetch("/api/v1/applications/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })

        const result = await response.json()

        if (result.success) {
          results.push({
            test: `Create application for ${data.email}`,
            status: "success",
            message: `Application created with ID: ${result.applicationId}`,
            data: result,
          })
        } else {
          results.push({
            test: `Create application for ${data.email}`,
            status: "error",
            message: result.message || "Failed to create application",
          })
        }
      } catch (error) {
        results.push({
          test: `Create application for ${data.email}`,
          status: "error",
          message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        })
      }
    }

    setTestResults((prev) => [...prev, ...results])
    setIsLoading(false)
    await fetchApplications()
  }

  // Test 2: Fetch Applications
  const fetchApplications = async () => {
    try {
      const response = await fetch("/api/v1/applications")
      const result = await response.json()

      if (result.success) {
        setApplications(result.data)
        setTestResults((prev) => [
          ...prev,
          {
            test: "Fetch applications",
            status: "success",
            message: `Fetched ${result.data.length} applications`,
            data: result.data,
          },
        ])
      } else {
        setTestResults((prev) => [
          ...prev,
          {
            test: "Fetch applications",
            status: "error",
            message: result.message || "Failed to fetch applications",
          },
        ])
      }
    } catch (error) {
      setTestResults((prev) => [
        ...prev,
        {
          test: "Fetch applications",
          status: "error",
          message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ])
    }
  }

  // Test 3: Auto-Approve Application (Consumer Account Creation)
  const testAutoApproval = async (applicationId: string) => {
    try {
      const response = await fetch("/api/v1/applications/auto-approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId,
          autoCreateUser: true,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setTestResults((prev) => [
          ...prev,
          {
            test: `Auto-approve application ${applicationId}`,
            status: "success",
            message: `Application approved. User created: ${result.userCreated}`,
            data: result,
          },
        ])

        toast({
          title: "Auto-Approval Success",
          description: `Application approved and ${result.userCreated ? "user account created" : "no user created"}`,
        })
      } else {
        setTestResults((prev) => [
          ...prev,
          {
            test: `Auto-approve application ${applicationId}`,
            status: "error",
            message: result.message || "Auto-approval failed",
          },
        ])
      }
    } catch (error) {
      setTestResults((prev) => [
        ...prev,
        {
          test: `Auto-approve application ${applicationId}`,
          status: "error",
          message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ])
    }

    await fetchApplications()
  }

  // Test 4: Manual Approval with DCC Upgrade
  const testManualApproval = async (applicationId: string) => {
    try {
      // First create consumer account
      const approvalResponse = await fetch("/api/v1/applications/approve-and-create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId,
        }),
      })

      const approvalResult = await approvalResponse.json()

      if (approvalResult.success) {
        // Then upgrade to DCC
        const upgradeResponse = await fetch("/api/v1/users/upgrade-to-dcc", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: approvalResult.user.id,
            applicationId,
            reason: "Test DCC upgrade",
          }),
        })

        const upgradeResult = await upgradeResponse.json()

        setTestResults((prev) => [
          ...prev,
          {
            test: `Manual approval + DCC upgrade ${applicationId}`,
            status: upgradeResult.success ? "success" : "error",
            message: `Consumer created: ${approvalResult.success}, DCC upgrade: ${upgradeResult.success}`,
            data: { approval: approvalResult, upgrade: upgradeResult },
          },
        ])

        toast({
          title: "Manual Approval Success",
          description: `Consumer account created and ${upgradeResult.success ? "upgraded to DCC" : "DCC upgrade failed"}`,
        })
      } else {
        setTestResults((prev) => [
          ...prev,
          {
            test: `Manual approval ${applicationId}`,
            status: "error",
            message: approvalResult.message || "Manual approval failed",
          },
        ])
      }
    } catch (error) {
      setTestResults((prev) => [
        ...prev,
        {
          test: `Manual approval ${applicationId}`,
          status: "error",
          message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ])
    }

    await fetchApplications()
  }

  // Test 5: Update Application Status
  const testStatusUpdate = async (applicationId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/v1/applications/${applicationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      })

      const result = await response.json()

      setTestResults((prev) => [
        ...prev,
        {
          test: `Update status to ${newStatus}`,
          status: result.success ? "success" : "error",
          message: result.message || `Status ${result.success ? "updated" : "update failed"}`,
          data: result,
        },
      ])
    } catch (error) {
      setTestResults((prev) => [
        ...prev,
        {
          test: `Update status to ${newStatus}`,
          status: "error",
          message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ])
    }

    await fetchApplications()
  }

  // Test 6: Delete Application
  const testDeleteApplication = async (applicationId: string) => {
    try {
      const response = await fetch(`/api/v1/applications/${applicationId}`, {
        method: "DELETE",
      })

      const result = await response.json()

      setTestResults((prev) => [
        ...prev,
        {
          test: `Delete application ${applicationId}`,
          status: result.success ? "success" : "error",
          message: result.message || `Application ${result.success ? "deleted" : "deletion failed"}`,
          data: result,
        },
      ])

      if (result.success) {
        toast({
          title: "Application Deleted",
          description: "Application has been successfully deleted",
        })
      }
    } catch (error) {
      setTestResults((prev) => [
        ...prev,
        {
          test: `Delete application ${applicationId}`,
          status: "error",
          message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ])
    }

    await fetchApplications()
  }

  // Test 7: Email Service Test
  const testEmailService = async () => {
    try {
      const response = await fetch("/api/test/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: "test@example.com",
          subject: "Test Email",
          message: "This is a test email from the application management system",
        }),
      })

      const result = await response.json()

      setTestResults((prev) => [
        ...prev,
        {
          test: "Email service test",
          status: result.success ? "success" : "error",
          message: result.message || `Email ${result.success ? "sent" : "failed"}`,
          data: result,
        },
      ])
    } catch (error) {
      setTestResults((prev) => [
        ...prev,
        {
          test: "Email service test",
          status: "error",
          message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ])
    }
  }

  // Run All Tests
  const runAllTests = async () => {
    setTestResults([])
    setIsLoading(true)

    try {
      // Test database connection
      await fetch("/api/test/database/connection")

      // Create test applications
      await createTestApplications()

      // Test email service
      await testEmailService()

      toast({
        title: "All Tests Completed",
        description: "Check the results below for detailed information",
      })
    } catch (error) {
      toast({
        title: "Test Error",
        description: "Some tests failed to complete",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Clear all test data
  const clearTestData = async () => {
    setTestResults([])
    setApplications([])
    toast({
      title: "Test Data Cleared",
      description: "All test results have been cleared",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "TEMPORARY":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3 mr-1" />
            Draft
          </Badge>
        )
      case "SUBMITTED":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Submitted
          </Badge>
        )
      case "APPROVED":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        )
      case "REJECTED":
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getTestStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "error":
        return <XCircle className="w-4 h-4 text-red-600" />
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Application Management Testing</h1>
            <p className="text-gray-600">Test all application approval and management features</p>
          </div>
          <TestTube className="w-12 h-12 text-blue-600" />
        </div>
      </div>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Test Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button onClick={runAllTests} disabled={isLoading}>
              {isLoading ? "Running Tests..." : "Run All Tests"}
            </Button>
            <Button onClick={createTestApplications} variant="outline">
              Create Test Applications
            </Button>
            <Button onClick={fetchApplications} variant="outline">
              Fetch Applications
            </Button>
            <Button onClick={testEmailService} variant="outline">
              Test Email Service
            </Button>
            <Button onClick={clearTestData} variant="destructive">
              Clear Test Data
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="results" className="space-y-6">
        <TabsList>
          <TabsTrigger value="results">Test Results</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              {testResults.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No test results yet. Run some tests to see results.</p>
              ) : (
                <div className="space-y-4">
                  {testResults.map((result, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                      {getTestStatusIcon(result.status)}
                      <div className="flex-1">
                        <h4 className="font-medium">{result.test}</h4>
                        <p className="text-sm text-gray-600">{result.message}</p>
                        {result.data && (
                          <details className="mt-2">
                            <summary className="text-xs text-blue-600 cursor-pointer">View Data</summary>
                            <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                              {JSON.stringify(result.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Applications ({applications.length})
                <Button onClick={fetchApplications} variant="outline" size="sm">
                  Refresh
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No applications found. Create some test applications first.
                </p>
              ) : (
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div key={app.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">
                            {app.formData?.q1} {app.formData?.q2}
                          </h4>
                          <p className="text-sm text-gray-600">{app.email}</p>
                        </div>
                        {getStatusBadge(app.status)}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" onClick={() => testAutoApproval(app.id)} disabled={app.status === "APPROVED"}>
                          <UserPlus className="w-4 h-4 mr-1" />
                          Auto-Approve
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedApplication(app)
                            setIsApprovalDialogOpen(true)
                          }}
                          disabled={app.status === "APPROVED"}
                        >
                          <Shield className="w-4 h-4 mr-1" />
                          Manual Approve
                        </Button>

                        <Button size="sm" variant="outline" onClick={() => testStatusUpdate(app.id, "UNDER_REVIEW")}>
                          Set Under Review
                        </Button>

                        <Button size="sm" variant="outline" onClick={() => testStatusUpdate(app.id, "REJECTED")}>
                          Reject
                        </Button>

                        <Button size="sm" variant="destructive" onClick={() => testDeleteApplication(app.id)}>
                          Delete
                        </Button>
                      </div>

                      {app.user && (
                        <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                          <p className="text-sm text-green-800">
                            <Users className="w-4 h-4 inline mr-1" />
                            User Account: {app.user.name} ({app.user.role})
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approval Dialog */}
      {selectedApplication && (
        <ApplicationApprovalDialog
          open={isApprovalDialogOpen}
          onOpenChange={setIsApprovalDialogOpen}
          application={selectedApplication}
          onApproved={() => {
            fetchApplications()
            setIsApprovalDialogOpen(false)
          }}
        />
      )}
    </div>
  )
}
