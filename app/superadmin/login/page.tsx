"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Eye, EyeOff, Shield, Lock, User } from "lucide-react"
import { useAuthStore } from "@/lib/stores/auth-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const { user, isLoading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const authStore = useAuthStore()

  // Handle redirect if already authenticated
  useEffect(() => {
    if (user && !isLoading) {
      router.replace("/superadmin/dashboard")
    }
  }, [user, isLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    console.log("🔐 Login attempt started", { email: formData.email })
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/v1/auth/superadmin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include',
      })

      console.log("📡 Login response status:", response.status)
      const data = await response.json()
      console.log("📦 Login response data:", data)

      if (!response.ok) {
        throw new Error(data.message || 'Invalid credentials')
      }

      if (data.success) {
        console.log("✅ Login successful")
        // Update auth store with user data
        authStore.setUser(data.user)
        authStore.setIsAuthenticated(true)
        
        // Show success message
        toast({
          title: "Login Successful",
          description: "Welcome back! Redirecting to dashboard...",
        })

        // Redirect to dashboard
        router.push("/superadmin/dashboard")
      } else {
        throw new Error(data.message || 'Invalid credentials')
      }
    } catch (error) {
      console.error("❌ Login error:", error)
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
      setError(errorMessage)
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Login Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-center">Secure Login</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the admin panel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="admin@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className={`pl-10 ${error ? "border-red-500" : ""}`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className={`pl-10 pr-10 ${error ? "border-red-500" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Security Notice */}
            <div className="text-xs text-gray-500 text-center pt-4 border-t">
              <p>This is a secure admin portal. All activities are logged and monitored.</p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Need help? Contact your system administrator</p>
        </div>
      </div>
    </div>
  )
} 