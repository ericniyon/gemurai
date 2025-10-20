"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestResetPage() {
  const testEmail = "test@example.com"
  const testToken = "test-token-123"

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Test Password Reset Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Test Set Password (Initial Setup):</p>
              <Button asChild className="w-full">
                <a href={`/set-password?email=${encodeURIComponent(testEmail)}`}>Test Initial Password Setup</a>
              </Button>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Test Reset Password (With Token):</p>
              <Button asChild className="w-full" variant="outline">
                <a href={`/set-password?token=${testToken}&email=${encodeURIComponent(testEmail)}`}>
                  Test Password Reset
                </a>
              </Button>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Test Invalid Link:</p>
              <Button asChild className="w-full" variant="destructive">
                <a href="/set-password">Test Invalid Link</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
