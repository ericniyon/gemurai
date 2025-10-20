"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"

export default function TestLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const { login, isAuthenticated, user, logout } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setResult(null)

    try {
      const response = await login(email, password)
      setResult({
        success: response.success,
        message: response.message,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestToken = async () => {
    try {
      const response = await fetch("/api/debug/token-test")
      const data = await response.json()
      setResult({
        success: data.success,
        message: data.message,
        debug: data.debug,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      })
    }
  }

  const handleTestEnv = async () => {
    try {
      const response = await fetch("/api/debug/env-test")
      const data = await response.json()
      setResult({
        success: data.success,
        message: data.message,
        envInfo: data.envInfo,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Login Test Page</h1>
          
          <div className="mb-6 p-4 bg-blue-50 rounded">
            <h2 className="font-semibold text-blue-900">Current Auth State</h2>
            <p className="text-sm text-blue-700">Authenticated: {isAuthenticated ? "Yes" : "No"}</p>
            {user && (
              <p className="text-sm text-blue-700">User: {user.email} ({user.role})</p>
            )}
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-6 space-y-2">
            <button
              onClick={handleTestToken}
              className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Test Token Verification
            </button>
            
            <button
              onClick={handleTestEnv}
              className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Test Environment Variables
            </button>
            
            {isAuthenticated && (
              <button
                onClick={logout}
                className="w-full py-2 px-4 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            )}
          </div>

          {result && (
            <div className="mt-6 p-4 bg-gray-50 rounded">
              <h3 className="font-semibold text-gray-900 mb-2">Result</h3>
              <pre className="text-xs text-gray-700 overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 