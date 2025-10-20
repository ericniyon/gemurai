"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"

export default function DCCTestPage() {
  const [email, setEmail] = useState("dcc@djyh.rw")
  const [password, setPassword] = useState("Login@123")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const { user, isAuthenticated, login } = useAuth()

  const handleTestLogin = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/debug/test-dcc-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })
      
      const data = await response.json()
      setResult({
        status: response.status,
        data,
        headers: Object.fromEntries(response.headers.entries())
      })
      
      if (data.success) {
        // Try to login through the auth store
        const loginResult = await login(email, password)
        console.log("Auth store login result:", loginResult)
      }
      
    } catch (error) {
      setResult({
        error: error instanceof Error ? error.message : String(error)
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAuthStoreLogin = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      const loginResult = await login(email, password)
      setResult({
        authStoreLogin: loginResult
      })
    } catch (error) {
      setResult({
        error: error instanceof Error ? error.message : String(error)
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>DCC Login Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="dcc@djyh.rw"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Login@123"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button onClick={handleTestLogin} disabled={loading}>
                {loading ? "Testing..." : "Test Direct Login"}
              </Button>
              <Button onClick={handleAuthStoreLogin} disabled={loading}>
                {loading ? "Testing..." : "Test Auth Store Login"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Auth State</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify({
                isAuthenticated,
                user: user ? {
                  id: user.id,
                  email: user.email,
                  role: user.role,
                  name: user.name
                } : null
              }, null, 2)}
            </pre>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {isAuthenticated && user && (
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Access Test</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-green-600 font-medium">
                  ✅ User is authenticated as {user.role}
                </p>
                <div className="flex gap-4">
                  <Button onClick={() => window.location.href = '/en/dashboard'}>
                    Go to Dashboard
                  </Button>
                  <Button onClick={() => window.location.href = '/en/dashboard/my-application'}>
                    Go to My Application
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 