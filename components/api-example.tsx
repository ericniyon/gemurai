"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { api } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

export function ApiExample() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is already logged in
    const token = api.getToken()
    if (token) {
      setIsLoggedIn(true)
      fetchUserData()
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await api.login(email, password)

      if (response.success) {
        setIsLoggedIn(true)
        toast({
          title: "Login successful",
          description: "You have been logged in successfully",
        })
        fetchUserData()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    api.clearToken()
    setIsLoggedIn(false)
    setUserData(null)
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    })
  }

  const fetchUserData = async () => {
    setIsLoading(true)
    try {
      // This would typically use the current user's ID
      // For demo purposes, we're getting the first page of users
      const response = await api.getUsers(1, 10)

      if (response.success && response.data) {
        setUserData(response.data)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>API Example</CardTitle>
      </CardHeader>
      <CardContent>
        {!isLoggedIn ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-md">
              <h3 className="font-medium">API Data Example</h3>
              {isLoading ? (
                <p>Loading data...</p>
              ) : userData ? (
                <pre className="text-xs mt-2 overflow-auto max-h-40">{JSON.stringify(userData, null, 2)}</pre>
              ) : (
                <p>No data available</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchUserData} disabled={isLoading} variant="outline" className="flex-1">
                Refresh Data
              </Button>
              <Button onClick={handleLogout} variant="destructive" className="flex-1">
                Logout
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
