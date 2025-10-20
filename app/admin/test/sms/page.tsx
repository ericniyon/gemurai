"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function SMSTestPage() {
  const [phone, setPhone] = useState("")
  const [name, setName] = useState("")
  const [messageType, setMessageType] = useState("welcome")
  const [status, setStatus] = useState("")
  const [score, setScore] = useState("80")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; message?: string } | null>(null)
  const [customMessage, setCustomMessage] = useState("")

  const handleSendSMS = async (endpoint: string, data: any) => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch(`/api/test/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      setResult(result)
    } catch (error: any) {
      setResult({
        success: false,
        message: `Error: ${error.message}`,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSendWelcome = () => {
    handleSendSMS("sms", { phone, name })
  }

  const handleSendStatus = () => {
    handleSendSMS("sms/status", { phone, name, status })
  }

  const handleSendEvaluation = () => {
    handleSendSMS("sms/evaluation", { phone, name, score: Number.parseInt(score) })
  }

  const handleSendCustom = () => {
    handleSendSMS("sms/custom", { phone, message: customMessage })
  }

  const handleSendOTP = () => {
    handleSendSMS("sms/otp", { phone })
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">SMS Testing Console</h1>
      <p className="text-gray-500 mb-8">Use this page to test SMS functionality with Twilio</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recipient Information</CardTitle>
            <CardDescription>Enter the phone number and name of the recipient</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" placeholder="+250788123456" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <p className="text-xs text-gray-500">Format: +250XXXXXXXXX (Rwanda) or international format</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Recipient Name</Label>
              <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>SMS delivery status and response</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Sending SMS...</span>
              </div>
            ) : result ? (
              <Alert variant={result.success ? "default" : "destructive"}>
                {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
                <AlertDescription>{result.message}</AlertDescription>
              </Alert>
            ) : (
              <div className="text-center p-6 text-gray-500">
                <p>No SMS sent yet. Use the options below to send a test message.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="welcome" className="mt-8">
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="welcome">Welcome</TabsTrigger>
          <TabsTrigger value="status">Status Update</TabsTrigger>
          <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
          <TabsTrigger value="otp">OTP</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>

        <TabsContent value="welcome" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Welcome Message</CardTitle>
              <CardDescription>Send a welcome message to a new DCC</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                This will send a welcome message to the recipient congratulating them on becoming a Level C DCC.
              </p>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSendWelcome} disabled={loading || !phone || !name}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Send Welcome SMS
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Status Update</CardTitle>
              <CardDescription>Send an application status update</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Application Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="pending_documents">Pending Documents</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSendStatus} disabled={loading || !phone || !name || !status}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Send Status Update
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="evaluation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evaluation Feedback</CardTitle>
              <CardDescription>Send evaluation results to an applicant</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="score">Evaluation Score (%)</Label>
                <Input
                  id="score"
                  type="number"
                  min="0"
                  max="100"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSendEvaluation} disabled={loading || !phone || !name}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Send Evaluation SMS
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="otp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>OTP Verification</CardTitle>
              <CardDescription>Send a one-time password for verification</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                This will generate a 4-digit OTP code and send it to the recipient. In development mode, the OTP will
                also be returned in the response.
              </p>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSendOTP} disabled={loading || !phone}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Send OTP
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Message</CardTitle>
              <CardDescription>Send a custom SMS message</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Input
                  id="message"
                  placeholder="Enter your custom message"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSendCustom} disabled={loading || !phone || !customMessage}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Send Custom SMS
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
