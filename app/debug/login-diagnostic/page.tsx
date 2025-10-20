"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react"

interface TestResult {
  name: string
  status: 'pending' | 'success' | 'error' | 'running'
  message: string
  details?: any
  duration?: number
}

export default function LoginDiagnostic() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [results, setResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const updateResult = (name: string, status: TestResult['status'], message: string, details?: any, duration?: number) => {
    setResults(prev => prev.map(r => 
      r.name === name ? { ...r, status, message, details, duration } : r
    ))
  }

  const runTest = async (name: string, testFn: () => Promise<void>) => {
    const startTime = Date.now()
    updateResult(name, 'running', 'Running...')
    
    try {
      await testFn()
      const duration = Date.now() - startTime
      updateResult(name, 'success', 'Passed', undefined, duration)
    } catch (error) {
      const duration = Date.now() - startTime
      updateResult(name, 'error', error.message, error, duration)
    }
  }

  const runAllTests = async () => {
    if (!email || !password) {
      alert("Please enter email and password")
      return
    }

    setIsRunning(true)
    
    // Initialize results
    const initialResults: TestResult[] = [
      { name: 'Server Health Check', status: 'pending', message: 'Waiting...' },
      { name: 'Database Health Check', status: 'pending', message: 'Waiting...' },
      { name: 'Simple Login Test', status: 'pending', message: 'Waiting...' },
      { name: 'Main Login Endpoint', status: 'pending', message: 'Waiting...' },
      { name: 'Fallback Login Endpoint', status: 'pending', message: 'Waiting...' },
      { name: 'Network Connectivity', status: 'pending', message: 'Waiting...' }
    ]
    
    setResults(initialResults)

    // Test 1: Server Health Check
    await runTest('Server Health Check', async () => {
      const response = await fetch('/api/debug/health', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (!response.ok) {
        throw new Error(`Server health check failed: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      if (!data.success) {
        throw new Error(data.message || 'Server health check failed')
      }
    })

    // Test 2: Database Health Check
    await runTest('Database Health Check', async () => {
      const response = await fetch('/api/debug/database-health', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (!response.ok) {
        throw new Error(`Database health check failed: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Database health check failed')
      }
    })

    // Test 3: Simple Login Test
    await runTest('Simple Login Test', async () => {
      const response = await fetch('/api/debug/login-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(`Login test failed: ${data.error || `${response.status} ${response.statusText}`}`)
      }
      
      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Login test failed')
      }
    })

    // Test 4: Main Login Endpoint
    await runTest('Main Login Endpoint', async () => {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(`Main login failed: ${data.error || data.message || `${response.status} ${response.statusText}`}`)
      }
      
      if (!data.success) {
        throw new Error(data.error || data.message || 'Main login failed')
      }
    })

    // Test 5: Fallback Login Endpoint
    await runTest('Fallback Login Endpoint', async () => {
      const response = await fetch('/api/v1/auth/login-fallback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(`Fallback login failed: ${data.error || data.message || `${response.status} ${response.statusText}`}`)
      }
      
      if (!data.success) {
        throw new Error(data.error || data.message || 'Fallback login failed')
      }
    })

    // Test 6: Network Connectivity
    await runTest('Network Connectivity', async () => {
      try {
        const response = await fetch('https://httpbin.org/get', {
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        })
        
        if (!response.ok) {
          throw new Error('External network test failed')
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          throw new Error('Network timeout - slow connection')
        }
        throw new Error(`Network connectivity issue: ${error.message}`)
      }
    })

    setIsRunning(false)
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />
      case 'running': return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      success: 'default',
      error: 'destructive',
      running: 'secondary',
      pending: 'outline'
    } as const
    
    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Login Diagnostic Tool</h1>
        <p className="text-gray-600">Test all login endpoints and diagnose connection issues</p>
      </div>

      <div className="grid gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Test Credentials</CardTitle>
            <CardDescription>Enter your login credentials to test all endpoints</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <Button 
              onClick={runAllTests} 
              disabled={isRunning || !email || !password}
              className="w-full"
            >
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>Results of all login endpoint tests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.map((result) => (
                  <div key={result.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <div className="font-medium">{result.name}</div>
                        <div className="text-sm text-gray-600">{result.message}</div>
                        {result.duration && (
                          <div className="text-xs text-gray-500">{result.duration}ms</div>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(result.status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>How to use:</strong>
            <ol className="list-decimal ml-4 mt-2 space-y-1">
              <li>Enter your login credentials above</li>
              <li>Click "Run All Tests" to diagnose the login issue</li>
              <li>Check which tests pass/fail to identify the problem</li>
              <li>If "Fallback Login Endpoint" passes, you can temporarily use that for login</li>
              <li>Share the results with your development team for debugging</li>
            </ol>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
} 