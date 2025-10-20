"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function TestEmailPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSendTestEmail = async () => {
    setIsLoading(true)
    
    try {
      console.log("🧪 Sending test email...")
      
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      console.log("📊 Test email response:", result)

      if (result.success) {
        toast({
          title: "Test Email Sent!",
          description: "Test email sent successfully to niyoeri6@gmail.com. Check your inbox and spam folder.",
        })
      } else {
        toast({
          title: "Test Email Failed",
          description: result.message || "Failed to send test email",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("❌ Test email error:", error)
      toast({
        title: "Test Email Error",
        description: "An error occurred while sending the test email",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Test Email</CardTitle>
          <CardDescription>
            Send a test email to niyoeri6@gmail.com to verify email functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              <strong>Target Email:</strong> niyoeri6@gmail.com
            </p>
            <p className="text-sm text-gray-600">
              <strong>Subject:</strong> Gemurai Test Email
            </p>
          </div>
          
          <Button
            onClick={handleSendTestEmail}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Test Email...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send Test Email
              </>
            )}
          </Button>
          
          <div className="text-xs text-gray-500 text-center">
            Check your email inbox and spam folder after clicking the button
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 