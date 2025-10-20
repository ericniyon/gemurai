"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthHeader } from "@/components/auth-header"
import { AuthFooter } from "@/components/auth-footer"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, Shield, Key, Users, Award, Globe } from "lucide-react"
import { ClientOnly } from "@/components/client-only"

function SetPasswordContent() {
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  const [mounted, setMounted] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [email, setEmail] = useState<string | null>(null)
  const [phone, setPhone] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isPhoneBased, setIsPhoneBased] = useState(false)
  const { toast } = useToast()

  // Safe access to search params after component mount
  useEffect(() => {
    setMounted(true)
    const searchParams = new URLSearchParams(window.location.search)
    const emailParam = searchParams.get("email")
    const phoneParam = searchParams.get("phone")
    const tokenParam = searchParams.get("token")
    const verifiedParam = searchParams.get("verified")

    setEmail(emailParam)
    setPhone(phoneParam)
    setToken(tokenParam)
    setIsPhoneBased(!!phoneParam && verifiedParam === "true")

    if (!emailParam && !phoneParam) {
      toast({
        title: "Invalid Link",
        description: "This link is invalid or has expired.",
        variant: "destructive",
      })
    }
  }, [toast])

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
    }
  }

  const passwordValidation = validatePassword(password)
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!passwordValidation.isValid) {
      toast({
        title: "Invalid Password",
        description: "Please ensure your password meets all requirements.",
        variant: "destructive",
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please ensure both passwords are identical.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // API call to set password would go here
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setIsSuccess(true)
      toast({
        title: "Password Set Successfully",
        description: "Your password has been set. You can now log in to your account.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to set password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Don't render anything until client-side hydration is complete
  if (!mounted) {
    return null
  }

  if (!email && !phone) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-50 via-white to-navy-50">
        <AuthHeader />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <Card className="shadow-2xl border-0 rounded-2xl overflow-hidden">
              <CardContent className="pt-8 text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-10 h-10 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Invalid Link</h2>
                <p className="text-gray-600 mb-6">This link is invalid or has expired.</p>
                <Button asChild className="w-full bg-navy-600 hover:bg-navy-700 text-white font-semibold py-3 rounded-lg shadow-lg">
                  <Link href={`/${lang}/forgot-password`}>Request New Reset Link</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        <AuthFooter />
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-50 via-white to-navy-50">
        <AuthHeader />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <Card className="shadow-2xl border-0 rounded-2xl overflow-hidden">
              <CardContent className="pt-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-green-600 mb-3">Password Set Successfully!</h2>
                <p className="text-gray-600 mb-6">You can now log in to your KoraLink account.</p>
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-lg">
                  <Link href={`/${lang}/login`}>Go to Login</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        <AuthFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <AuthHeader />

      <div className="flex min-h-screen">
        {/* Left Side - Branding Section */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 relative overflow-hidden">
          {/* Enhanced Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-40 h-40 border-4 border-white rounded-full animate-pulse"></div>
            <div className="absolute top-40 right-20 w-32 h-32 border-3 border-white rounded-full animate-pulse delay-1000"></div>
            <div className="absolute bottom-20 left-20 w-24 h-24 border-3 border-white rounded-full animate-pulse delay-2000"></div>
            <div className="absolute bottom-40 right-10 w-28 h-28 border-4 border-white rounded-full animate-pulse delay-1500"></div>
            <div className="absolute top-1/2 left-1/4 w-16 h-16 border-2 border-white rounded-full animate-pulse delay-500"></div>
            <div className="absolute top-1/3 right-1/3 w-20 h-20 border-2 border-white rounded-full animate-pulse delay-3000"></div>
          </div>
          
          {/* Blue Overlay for Depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-800/30 via-blue-700/20 to-blue-900/40"></div>
          
          <div className="relative z-10 flex flex-col justify-center px-12 py-16 text-white">
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-24 h-24 flex items-center justify-center">
                  <img
                    src="/KoraLink.png"
                    alt="KoraLink Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <h1 className="text-5xl font-bold text-white drop-shadow-lg">KoraLink</h1>
              </div>
              <p className="text-xl text-white/90 font-medium">Digital Community Platform</p>
            </div>
            
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-14 h-14 bg-white/25 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-lg">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-white">Empowering Youth</h3>
                  <p className="text-white/85 leading-relaxed">
                    Connect young professionals with meaningful opportunities that drive their careers forward.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-14 h-14 bg-white/25 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-lg">
                  <Award className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-white">Professional Growth</h3>
                  <p className="text-white/85 leading-relaxed">
                    Access training, mentorship, and resources to develop your skills and advance your career.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-14 h-14 bg-white/25 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-lg">
                  <Globe className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-white">Global Network</h3>
                  <p className="text-white/85 leading-relaxed">
                    Join a community of professionals and employers across Rwanda and beyond.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-12 pt-8 border-t border-white/30">
              <p className="text-white/80 text-sm italic">
                "KoraLink is transforming how young professionals connect with opportunities that matter."
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Form Section */}
        <div className="flex-1 lg:w-1/2 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-navy-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-navy-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Set Your Password</h2>
              <p className="text-gray-600">
                {isPhoneBased 
                  ? "Create a secure password for your KoraLink account (Phone verification completed)" 
                  : "Create a secure password for your KoraLink account"
                }
              </p>
            </div>

            <Card className="shadow-xl border-0 rounded-2xl overflow-hidden">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="contact" className="text-gray-700 font-semibold text-sm uppercase tracking-wide">
                      {isPhoneBased ? "Phone Number" : "Email Address"}
                    </Label>
                    <Input 
                      id="contact" 
                      type={isPhoneBased ? "tel" : "email"} 
                      value={isPhoneBased ? (phone || "") : (email || "")} 
                      disabled 
                      className="bg-gray-50 border-gray-300 text-gray-600 font-medium" 
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="password" className="text-gray-700 font-semibold text-sm uppercase tracking-wide flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your new password"
                        className="border-gray-300 focus:border-navy-500 focus:ring-navy-500 font-medium"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="confirmPassword" className="text-gray-700 font-semibold text-sm uppercase tracking-wide flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your new password"
                        className="border-gray-300 focus:border-navy-500 focus:ring-navy-500 font-medium"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Password Requirements:</p>
                    <div className="bg-gradient-to-r from-gray-50 to-navy-50 rounded-xl p-6 space-y-3 border border-gray-200">
                      <div className={`flex items-center space-x-3 text-sm ${passwordValidation.minLength ? "text-green-600" : "text-gray-500"}`}>
                        <div className={`w-3 h-3 rounded-full ${passwordValidation.minLength ? "bg-green-500" : "bg-gray-300"}`}></div>
                        <span className="font-medium">At least 8 characters long</span>
                      </div>
                      <div className={`flex items-center space-x-3 text-sm ${passwordValidation.hasUpperCase ? "text-green-600" : "text-gray-500"}`}>
                        <div className={`w-3 h-3 rounded-full ${passwordValidation.hasUpperCase ? "bg-green-500" : "bg-gray-300"}`}></div>
                        <span className="font-medium">Contains at least one uppercase letter</span>
                      </div>
                      <div className={`flex items-center space-x-3 text-sm ${passwordValidation.hasLowerCase ? "text-green-600" : "text-gray-500"}`}>
                        <div className={`w-3 h-3 rounded-full ${passwordValidation.hasLowerCase ? "bg-green-500" : "bg-gray-300"}`}></div>
                        <span className="font-medium">Contains at least one lowercase letter</span>
                      </div>
                      <div className={`flex items-center space-x-3 text-sm ${passwordValidation.hasNumbers ? "text-green-600" : "text-gray-500"}`}>
                        <div className={`w-3 h-3 rounded-full ${passwordValidation.hasNumbers ? "bg-green-500" : "bg-gray-300"}`}></div>
                        <span className="font-medium">Contains at least one number</span>
                      </div>
                      <div className={`flex items-center space-x-3 text-sm ${passwordValidation.hasSpecialChar ? "text-green-600" : "text-gray-500"}`}>
                        <div className={`w-3 h-3 rounded-full ${passwordValidation.hasSpecialChar ? "bg-green-500" : "bg-gray-300"}`}></div>
                        <span className="font-medium">Contains at least one special character</span>
                      </div>
                      <div className={`flex items-center space-x-3 text-sm ${passwordsMatch ? "text-green-600" : "text-gray-500"}`}>
                        <div className={`w-3 h-3 rounded-full ${passwordsMatch ? "bg-green-500" : "bg-gray-300"}`}></div>
                        <span className="font-medium">Passwords match</span>
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]" 
                    disabled={isLoading || !passwordValidation.isValid || !passwordsMatch}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Setting Password...
                      </div>
                    ) : (
                      "Set Password"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AuthFooter />
    </div>
  )
}

export default function SetPassword() {
  return (
    <ClientOnly fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-50 via-white to-navy-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-navy-600"></div>
          <p className="text-sm text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    }>
      <SetPasswordContent />
    </ClientOnly>
  )
} 