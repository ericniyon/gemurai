"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function MinimalApplicationPage() {
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")

    try {
      // Test basic form submission
      const testData = {
        id: `test_${Date.now()}`,
        phone: formData.phone,
        email: formData.email,
        status: "TEMPORARY",
        formData: formData,
        currentStep: 1,
      }

      const response = await fetch("/api/v1/applications/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      })

      const result = await response.json()

      if (result.success) {
        setStatus("success")
        setMessage("Form submitted successfully!")
      } else {
        setStatus("error")
        setMessage(result.message || "Submission failed")
      }
    } catch (error: any) {
      setStatus("error")
      setMessage(error.message || "Network error")
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Minimal Application Form Test</CardTitle>
            <p className="text-sm text-gray-600">This is a simplified version to test basic functionality</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Enter your first name"
                />
              </div>

              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Enter your last name"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter your phone number"
                />
              </div>

              <Button type="submit" disabled={status === "loading"} className="w-full">
                {status === "loading" ? "Submitting..." : "Submit Test Form"}
              </Button>

              {status === "success" && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded">
                  <CheckCircle className="h-5 w-5" />
                  {message}
                </div>
              )}

              {status === "error" && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded">
                  <AlertCircle className="h-5 w-5" />
                  {message}
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Mounted:</strong> {mounted ? "✓ Yes" : "✗ No"}
              </p>
              <p>
                <strong>Window:</strong> {typeof window !== "undefined" ? "✓ Available" : "✗ Not available"}
              </p>
              <p>
                <strong>Fetch:</strong> {typeof fetch !== "undefined" ? "✓ Available" : "✗ Not available"}
              </p>
              <p>
                <strong>Form Data:</strong> {JSON.stringify(formData)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
