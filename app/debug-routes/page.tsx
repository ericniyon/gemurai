"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugRoutesPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Route Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Available Routes:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>/set-password - Password setup page</li>
                  <li>/reset-password - Password reset page</li>
                  <li>/forgot-password - Request password reset</li>
                  <li>/login - Login page</li>
                  <li>/register - Registration page</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold">Current URL:</h3>
                <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                  {typeof window !== "undefined" ? window.location.href : "Server-side rendering"}
                </p>
              </div>

              <div>
                <h3 className="font-semibold">Environment:</h3>
                <p className="text-sm">Mode: {process.env.NODE_ENV || "development"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
