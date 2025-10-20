"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, XCircle, Clock, Database, FileText, User, Mail, RefreshCw, Play, Eye } from "lucide-react"

interface TestResult {
  step: string
  status: "pending" | "running" | "success" | "error"
  message: string
  data?: any
  duration?: number
}

interface ApplicationData {
  id: string
  phone: string
  email?: string
  status: string
  formData: any
  currentStep: number
}

export default function TestFormSubmissionPage() {
  const { toast } = useToast()
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [currentTestIndex, setCurrentTestIndex] = useState(-1)
  const [testApplicationId, setTestApplicationId] = useState<string | null>(null)
  const [overallProgress, setOverallProgress] = useState(0)

  // Sample test data
  const testFormData: { [key: string]: string | string[] } = {
    q1: "John",
    q2: "Doe",
    q3: "1990-01-15",
    q4: "Male",
    q5: "1 1990 7 0123456 7 89",
    q6: "Single",
    q7: "john.doe@test.com",
    q8: "0788123456",
    province: "Kigali City",
    district: "Gasabo",
    sector: "Kimironko",
    cell: "Kibagabaga",
    village: "Nyarutarama",
    q9: "Bachelor's Degree",
    q10: "Computer Science",
    q11: "University of Rwanda",
    q12: "2015",
    q13: ["English", "Kinyarwanda", "French"],
    q14: ["Microsoft Office", "Programming", "Digital Marketing"],
    q15: "Software Developer",
    q16: "ABC Tech Company",
    q17: "2020-01-01",
    q18: "2023-12-31",
    q19: "Developed web applications and managed databases",
    q20: "I want to help my community access digital services and improve their digital literacy.",
    q21: ["Community Development", "Technology", "Education"],
    q22: "Yes",
    q23: "I have experience organizing community events and teaching computer skills to youth.",
  }

  const initializeTests = () => {
    const tests: TestResult[] = [
      { step: "Database Connection", status: "pending", message: "Checking database connectivity" },
      { step: "Form Data Validation", status: "pending", message: "Validating test form data" },
      { step: "Create Application", status: "pending", message: "Creating new application in database" },
      { step: "Auto-Save Progress", status: "pending", message: "Testing auto-save functionality" },
      { step: "Update Application", status: "pending", message: "Updating application with new data" },
      { step: "Step Navigation", status: "pending", message: "Testing step-by-step progress saving" },
      { step: "Final Submission", status: "pending", message: "Submitting complete application" },
      { step: "Database Verification", status: "pending", message: "Verifying data persistence in database" },
      { step: "Email Notification", status: "pending", message: "Testing email confirmation" },
      { step: "Application Submission", status: "pending", message: "Verifying application appears in user's applications" },
    ]
    setTestResults(tests)
    setCurrentTestIndex(-1)
    setOverallProgress(0)
    setTestApplicationId(null)
  }

  const updateTestResult = (
    index: number,
    status: TestResult["status"],
    message: string,
    data?: any,
    duration?: number,
  ) => {
    setTestResults((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], status, message, data, duration }
      return updated
    })
  }

  const runTest = async (testIndex: number): Promise<boolean> => {
    const startTime = Date.now()
    setCurrentTestIndex(testIndex)
    updateTestResult(testIndex, "running", "Running test...")

    try {
      switch (testIndex) {
        case 0: // Database Connection
          return await testDatabaseConnection(testIndex, startTime)
        case 1: // Form Data Validation
          return await testFormDataValidation(testIndex, startTime)
        case 2: // Create Application
          return await testCreateApplication(testIndex, startTime)
        case 3: // Auto-Save Progress
          return await testAutoSaveProgress(testIndex, startTime)
        case 4: // Update Application
          return await testUpdateApplication(testIndex, startTime)
        case 5: // Step Navigation
          return await testStepNavigation(testIndex, startTime)
        case 6: // Final Submission
          return await testFinalSubmission(testIndex, startTime)
        case 7: // Database Verification
          return await testDatabaseVerification(testIndex, startTime)
        case 8: // Email Notification
          return await testEmailNotification(testIndex, startTime)
        case 9: // Application Submission
          return await testApplicationSubmission(testIndex, startTime)
        default:
          throw new Error("Unknown test")
      }
    } catch (error: any) {
      const duration = Date.now() - startTime
      updateTestResult(testIndex, "error", `Test failed: ${error.message}`, { error: error.message }, duration)
      return false
    }
  }

  const testDatabaseConnection = async (testIndex: number, startTime: number): Promise<boolean> => {
    const response = await fetch("/api/test/database/connection")
    const data = await response.json()
    const duration = Date.now() - startTime

    if (data.success && data.connected) {
      updateTestResult(testIndex, "success", "Database connection successful", data, duration)
      return true
    } else {
      updateTestResult(testIndex, "error", "Database connection failed", data, duration)
      return false
    }
  }

  const testFormDataValidation = async (testIndex: number, startTime: number): Promise<boolean> => {
    // Validate required fields
    const requiredFields = ["q1", "q2", "q7", "q8"] // firstName, lastName, email, phone
    const missingFields = requiredFields.filter((field) => !testFormData[field])
    const duration = Date.now() - startTime

    if (missingFields.length === 0) {
      updateTestResult(
        testIndex,
        "success",
        "All required fields present",
        { validatedFields: requiredFields },
        duration,
      )
      return true
    } else {
      updateTestResult(
        testIndex,
        "error",
        `Missing required fields: ${missingFields.join(", ")}`,
        { missingFields },
        duration,
      )
      return false
    }
  }

  const testCreateApplication = async (testIndex: number, startTime: number): Promise<boolean> => {
    const applicationId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    setTestApplicationId(applicationId)

    const applicationData = {
      id: applicationId,
      phone: testFormData.q8,
      email: testFormData.q7,
      status: "TEMPORARY",
      formData: testFormData,
      currentStep: 1,
    }

    const response = await fetch("/api/v1/applications/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(applicationData),
    })

    const data = await response.json()
    const duration = Date.now() - startTime

    if (data.success) {
      updateTestResult(
        testIndex,
        "success",
        "Application created successfully",
        { applicationId: data.data.id },
        duration,
      )
      return true
    } else {
      updateTestResult(testIndex, "error", `Failed to create application: ${data.message}`, data, duration)
      return false
    }
  }

  const testAutoSaveProgress = async (testIndex: number, startTime: number): Promise<boolean> => {
    if (!testApplicationId) {
      updateTestResult(testIndex, "error", "No application ID available", {}, Date.now() - startTime)
      return false
    }

    // Simulate auto-save with partial data
    const partialData = {
      ...testFormData,
      q20: "Updated motivation text for auto-save test",
    }

    const applicationData = {
      id: testApplicationId,
      phone: testFormData.q8,
      email: testFormData.q7,
      status: "TEMPORARY",
      formData: partialData,
      currentStep: 2,
    }

    const response = await fetch("/api/v1/applications/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(applicationData),
    })

    const data = await response.json()
    const duration = Date.now() - startTime

    if (data.success) {
      updateTestResult(testIndex, "success", "Auto-save functionality working", { updatedStep: 2 }, duration)
      return true
    } else {
      updateTestResult(testIndex, "error", `Auto-save failed: ${data.message}`, data, duration)
      return false
    }
  }

  const testUpdateApplication = async (testIndex: number, startTime: number): Promise<boolean> => {
    if (!testApplicationId) {
      updateTestResult(testIndex, "error", "No application ID available", {}, Date.now() - startTime)
      return false
    }

    // Test updating with more complete data
    const updatedData = {
      ...testFormData,
      q21: ["Community Development", "Technology", "Education", "Healthcare"],
      q23: "Updated experience description with additional details for testing.",
    }

    const applicationData = {
      id: testApplicationId,
      phone: testFormData.q8,
      email: testFormData.q7,
      status: "TEMPORARY",
      formData: updatedData,
      currentStep: 4,
    }

    const response = await fetch("/api/v1/applications/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(applicationData),
    })

    const data = await response.json()
    const duration = Date.now() - startTime

    if (data.success) {
      updateTestResult(testIndex, "success", "Application update successful", { updatedStep: 4 }, duration)
      return true
    } else {
      updateTestResult(testIndex, "error", `Update failed: ${data.message}`, data, duration)
      return false
    }
  }

  const testStepNavigation = async (testIndex: number, startTime: number): Promise<boolean> => {
    if (!testApplicationId) {
      updateTestResult(testIndex, "error", "No application ID available", {}, Date.now() - startTime)
      return false
    }

    // Test progressing through multiple steps
    const steps = [5, 6, 7] // Simulate moving through final steps
    let allSuccessful = true

    for (const step of steps) {
      const applicationData = {
        id: testApplicationId,
        phone: testFormData.q8,
        email: testFormData.q7,
        status: "TEMPORARY",
        formData: testFormData,
        currentStep: step,
      }

      const response = await fetch("/api/v1/applications/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(applicationData),
      })

      const data = await response.json()
      if (!data.success) {
        allSuccessful = false
        break
      }
    }

    const duration = Date.now() - startTime

    if (allSuccessful) {
      updateTestResult(testIndex, "success", "Step navigation working correctly", { completedSteps: steps }, duration)
      return true
    } else {
      updateTestResult(testIndex, "error", "Step navigation failed", {}, duration)
      return false
    }
  }

  const testFinalSubmission = async (testIndex: number, startTime: number): Promise<boolean> => {
    if (!testApplicationId) {
      updateTestResult(testIndex, "error", "No application ID available", {}, Date.now() - startTime)
      return false
    }

    // Submit final application
    const applicationData = {
      id: testApplicationId,
      phone: testFormData.q8,
      email: testFormData.q7,
      status: "SUBMITTED",
      formData: testFormData,
      currentStep: 8, // Final step
    }

    const response = await fetch("/api/v1/applications/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(applicationData),
    })

    const data = await response.json()
    const duration = Date.now() - startTime

    if (data.success) {
      updateTestResult(testIndex, "success", "Application submitted successfully", { status: "SUBMITTED" }, duration)
      return true
    } else {
      updateTestResult(testIndex, "error", `Submission failed: ${data.message}`, data, duration)
      return false
    }
  }

  const testDatabaseVerification = async (testIndex: number, startTime: number): Promise<boolean> => {
    if (!testApplicationId) {
      updateTestResult(testIndex, "error", "No application ID available", {}, Date.now() - startTime)
      return false
    }

    // Verify the application exists in database
    const response = await fetch(`/api/v1/applications/${testApplicationId}`)
    const data = await response.json()
    const duration = Date.now() - startTime

    if (data.success && data.data) {
      const application = data.data
      const isValid =
        application.id === testApplicationId &&
        application.status === "SUBMITTED" &&
        application.email === testFormData.q7 &&
        application.phone === testFormData.q8

      if (isValid) {
        updateTestResult(
          testIndex,
          "success",
          "Application verified in database",
          {
            applicationId: application.id,
            status: application.status,
            dataIntegrity: "Valid",
          },
          duration,
        )
        return true
      } else {
        updateTestResult(testIndex, "error", "Data integrity check failed", { application }, duration)
        return false
      }
    } else {
      updateTestResult(testIndex, "error", "Application not found in database", data, duration)
      return false
    }
  }

  const testEmailNotification = async (testIndex: number, startTime: number): Promise<boolean> => {
    // Test email notification
    const response = await fetch("/api/email/application-submission", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testFormData.q7,
        name: `${testFormData.q1} ${testFormData.q2}`,
      }),
    })

    const data = await response.json()
    const duration = Date.now() - startTime

    if (data.success) {
      updateTestResult(
        testIndex,
        "success",
        "Email notification sent successfully",
        {
          recipient: testFormData.q7,
          emailService: "Working",
        },
        duration,
      )
      return true
    } else {
      updateTestResult(testIndex, "error", `Email notification failed: ${data.message}`, data, duration)
      return false
    }
  }

  const testApplicationSubmission = async (testIndex: number, startTime: number): Promise<boolean> => {
    // Test if application appears in user's applications
    const response = await fetch("/api/v1/applications/my")
    const data = await response.json()
    const duration = Date.now() - startTime

    if (data.success && data.applications) {
      const foundApplication = data.applications.find((app: any) => app.id === testApplicationId)

      if (foundApplication) {
        updateTestResult(
          testIndex,
          "success",
          "Application found in user's applications",
          {
            foundInUserApplications: true,
            applicationStatus: foundApplication.status,
          },
          duration,
        )
        return true
      } else {
        updateTestResult(
          testIndex,
          "error",
          "Application not found in user's applications",
          {
            totalApplications: data.applications.length,
          },
          duration,
        )
        return false
      }
    } else {
      updateTestResult(testIndex, "error", "Failed to access user's applications", data, duration)
      return false
    }
  }

  const runAllTests = async () => {
    setIsRunning(true)
    initializeTests()

    for (let i = 0; i < testResults.length; i++) {
      const success = await runTest(i)
      setOverallProgress(((i + 1) / testResults.length) * 100)

      if (!success && i < 7) {
        // Stop on critical failures (before email/admin tests)
        toast({
          title: "Test Failed",
          description: `Test "${testResults[i].step}" failed. Stopping test suite.`,
          variant: "destructive",
        })
        break
      }

      // Add delay between tests
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    setCurrentTestIndex(-1)
    setIsRunning(false)

    const successCount = testResults.filter((t) => t.status === "success").length
    const totalTests = testResults.length

    toast({
      title: "Test Suite Complete",
      description: `${successCount}/${totalTests} tests passed`,
      variant: successCount === totalTests ? "default" : "destructive",
    })
  }

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />
      case "running":
        return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Success
          </Badge>
        )
      case "error":
        return <Badge variant="destructive">Failed</Badge>
      case "running":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Running
          </Badge>
        )
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  useEffect(() => {
    initializeTests()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-6 w-6" />
                  Form Submission Flow Test
                </CardTitle>
                <CardDescription>
                  Comprehensive testing of the application form submission and database storage
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={runAllTests} disabled={isRunning} className="flex items-center gap-2">
                  {isRunning ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Running Tests...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Run All Tests
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open("/application", "_blank")}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View Form
                </Button>
              </div>
            </div>
          </CardHeader>

          {isRunning && (
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span>{Math.round(overallProgress)}%</span>
                </div>
                <Progress value={overallProgress} className="h-2" />
              </div>
            </CardContent>
          )}
        </Card>

        {/* Test Data Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Test Data Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">Personal Info</span>
                </div>
                <div className="pl-6 space-y-1 text-gray-600">
                  <p>
                    Name: {testFormData.q1} {testFormData.q2}
                  </p>
                  <p>DOB: {testFormData.q3}</p>
                  <p>Gender: {testFormData.q4}</p>
                  <p>ID: {testFormData.q5}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span className="font-medium">Contact Info</span>
                </div>
                <div className="pl-6 space-y-1 text-gray-600">
                  <p>Email: {testFormData.q7}</p>
                  <p>Phone: {testFormData.q8}</p>
                  <p>
                    Location: {testFormData.village}, {testFormData.sector}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  <span className="font-medium">Test Application</span>
                </div>
                <div className="pl-6 space-y-1 text-gray-600">
                  <p>ID: {testApplicationId || "Not created yet"}</p>
                  <p>Status: Will be tested</p>
                  <p>Steps: 1-8 (Complete flow)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>Each test verifies a different aspect of the form submission flow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testResults.map((test, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border transition-all duration-200 ${
                    currentTestIndex === index
                      ? "border-blue-200 bg-blue-50"
                      : test.status === "success"
                        ? "border-green-200 bg-green-50"
                        : test.status === "error"
                          ? "border-red-200 bg-red-50"
                          : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(test.status)}
                      <div>
                        <h3 className="font-medium">{test.step}</h3>
                        <p className="text-sm text-gray-600">{test.message}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {test.duration && <span className="text-xs text-gray-500">{test.duration}ms</span>}
                      {getStatusBadge(test.status)}
                    </div>
                  </div>

                  {test.data && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <details className="text-xs">
                        <summary className="cursor-pointer text-gray-600 hover:text-gray-800">View Details</summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                          {JSON.stringify(test.data, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        {!isRunning && testResults.some((t) => t.status !== "pending") && (
          <Card>
            <CardHeader>
              <CardTitle>Test Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {testResults.filter((t) => t.status === "success").length}
                  </div>
                  <div className="text-sm text-green-700">Passed</div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {testResults.filter((t) => t.status === "error").length}
                  </div>
                  <div className="text-sm text-red-700">Failed</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">
                    {testResults.filter((t) => t.status === "pending").length}
                  </div>
                  <div className="text-sm text-gray-700">Pending</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{testResults.length}</div>
                  <div className="text-sm text-blue-700">Total Tests</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
