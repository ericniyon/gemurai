"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams, useParams } from "next/navigation"
import { Loader2, Shield, Building, User, ShoppingBag, Briefcase, Eye, EyeOff, Mail, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AuthHeader } from "@/components/auth-header"
import { AuthFooter } from "@/components/auth-footer"
import { TEST_CREDENTIALS } from "@/lib/test-credentials"
import { ClientOnly } from "@/components/client-only"
import { loginTranslations } from "../translations/auth"
import { useAuth } from "@/hooks/use-auth"

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  const t = loginTranslations[lang as keyof typeof loginTranslations] || loginTranslations.en
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email")
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
  })
  const { login, isAuthenticated } = useAuth()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const redirect = searchParams?.get("redirect") || `/${lang}/dashboard`
      if (window.location.pathname !== redirect) {
        router.replace(redirect)
      }
    }
  }, [isAuthenticated, router, searchParams, lang])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Determine which identifier to use based on login method
      const identifier = loginMethod === "email" ? formData.email : formData.phone
      
      // Validation
      if (!identifier) {
        setError(loginMethod === "email" ? t.form.errors.missingEmail : t.form.errors.missingPhone)
        setIsLoading(false)
        return
      }

      if (!formData.password) {
        setError(t.form.errors.missingPassword)
        setIsLoading(false)
        return
      }

      // Email validation
      if (loginMethod === "email" && !isValidEmail(identifier)) {
        setError(t.form.errors.invalidEmail)
        setIsLoading(false)
        return
      }

      // Phone validation
      if (loginMethod === "phone" && !isValidPhone(identifier)) {
        setError(t.form.errors.invalidPhone)
        setIsLoading(false)
        return
      }

      const result = await login(identifier, formData.password)
      
      if (result.success) {
        const redirect = searchParams?.get("redirect") || `/${lang}/dashboard`
        // Use router.replace to prevent going back to login page
        // Only redirect if we're not already on the target page
        if (window.location.pathname !== redirect) {
          router.replace(redirect)
        }
      } else {
        console.error("Login failed:", result.message || "Unknown error")
        setError(result.message || t.form.errors.invalidCredentials)
      }
    } catch (error) {
      console.error("Login error:", error)
      setError(t.form.errors.serverError)
    } finally {
      setIsLoading(false)
    }
  }

  // Validation functions
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const isValidPhone = (phone: string): boolean => {
    // Basic phone validation - allows digits, spaces, dashes, and plus sign
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,}$/
    return phoneRegex.test(phone)
  }

  const handleQuickLogin = async (userType: keyof typeof TEST_CREDENTIALS) => {
    setIsLoading(true)
    setError(null)

    try {
      const credentials = TEST_CREDENTIALS[userType]
      const result = await login(credentials.email, credentials.password)

      if (result.success) {
        const redirect = searchParams?.get("redirect") || `/${lang}/dashboard`
        if (window.location.pathname !== redirect) {
          router.replace(redirect)
        }
      } else {
        console.error("Quick login failed:", result.message)
        setError(result.message || t.form.errors.invalidCredentials)
      }
    } catch (error) {
      console.error("Quick login error:", error)
      setError(t.form.errors.serverError)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
      <div className="relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-180px] right-[-120px] h-[420px] w-[420px] rounded-full bg-gradient-to-br from-blue-500/20 via-indigo-400/10 to-purple-400/10 blur-3xl" />
          <div className="absolute bottom-[-160px] left-[-160px] h-[380px] w-[380px] rounded-full bg-gradient-to-tr from-emerald-400/15 via-sky-400/10 to-blue-400/5 blur-3xl" />
        </div>

        {/* Navigation */}
        <div className="relative z-10">
          <AuthHeader />
        </div>

        {/* Login Section */}
        <div className="relative z-10 flex flex-col lg:flex-row min-h-[calc(100vh-80px)] gap-y-8">
          {/* Left Side - Mission & Vision */}
          <div className="hidden lg:flex w-1/2 text-white relative overflow-hidden" style={{ backgroundColor: '#0249ad' }}>
            <div className="relative z-10 flex flex-col justify-center p-12">
              <div className="max-w-lg">
                {/* Header */}
                <div className="mb-12">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <Shield className="w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4 text-white">
                    {t.welcome.title}
                  </h2>
                  <p className="text-white/90 text-lg">
                    {t.welcome.subtitle}
                  </p>
                </div>

                <div className="space-y-8">
                  <div className="flex items-start space-x-4 group">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-all duration-300 shadow-md">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2 text-white">{t.mission.title}</h3>
                      <p className="text-white/80 leading-relaxed">{t.mission.content}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 group">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-all duration-300 shadow-md">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2 text-white">{t.vision.title}</h3>
                      <p className="text-white/80 leading-relaxed">{t.vision.content}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mt-12">
                    <div className="text-center group">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-white/30 transition-all duration-300 shadow-md">
                        <Shield className="w-8 h-8" />
                      </div>
                      <h4 className="font-semibold text-white mb-2">{t.features.learn.title}</h4>
                      <p className="text-sm text-white/80 leading-relaxed">{t.features.learn.subtitle}</p>
                    </div>
                    <div className="text-center group">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-white/30 transition-all duration-300 shadow-md">
                        <Building className="w-8 h-8" />
                      </div>
                      <h4 className="font-semibold text-white mb-2">{t.features.earn.title}</h4>
                      <p className="text-sm text-white/80 leading-relaxed">{t.features.earn.subtitle}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-20 right-32 w-20 h-20 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute top-1/2 right-10 w-16 h-16 bg-white/10 rounded-full blur-2xl"></div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full lg:w-1/2 flex items-center justify-center p-8 px-4 pt-8 pb-8 min-h-[calc(100vh-80px)] flex-grow overflow-y-auto">
            <div className="w-full max-w-md">
              <Tabs defaultValue="login" className="w-full">
                <TabsContent value="login">
                  <Card className="border-2 border-blue-100 rounded-3xl shadow-xl bg-white/90 backdrop-blur-sm">
                    <form onSubmit={handleSubmit}>
                      <CardHeader className="pb-6">
                        <CardTitle className="text-2xl font-bold text-gray-900">{t.form.title}</CardTitle>
                        <CardDescription className="text-gray-600 mt-2">{t.form.subtitle}</CardDescription>
                        {error && (
                          <Alert variant="destructive" className="mt-4 rounded-xl">
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-5">
                        {/* Login Method Tabs */}
                        <div className="space-y-4">
                          <Tabs value={loginMethod} onValueChange={(value) => setLoginMethod(value as "email" | "phone")} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-xl p-1">
                              <TabsTrigger value="email" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                <Mail className="h-4 w-4" />
                                {t.form.loginMethod.email}
                              </TabsTrigger>
                              <TabsTrigger value="phone" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                <Phone className="h-4 w-4" />
                                {t.form.loginMethod.phone}
                              </TabsTrigger>
                            </TabsList>
                          </Tabs>
                        </div>

                        {/* Email/Phone Input */}
                        <div className="space-y-2">
                          <Label htmlFor={loginMethod} className="text-sm font-semibold text-gray-700">
                            {loginMethod === "email" ? t.form.email.label : t.form.phone.label}
                          </Label>
                          <Input
                            id={loginMethod}
                            name={loginMethod}
                            type={loginMethod === "email" ? "email" : "tel"}
                            placeholder={loginMethod === "email" ? t.form.email.placeholder : t.form.phone.placeholder}
                            value={loginMethod === "email" ? formData.email : formData.phone}
                            onChange={handleInputChange}
                            autoComplete={loginMethod === "email" ? "email" : "tel"}
                            className="h-11 rounded-lg"
                            style={{ border: '1px solid rgb(191, 219, 254)', borderWidth: '1px', paddingLeft: '1rem' }}
                          />
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2">
                          <Label htmlFor="password" className="text-sm font-semibold text-gray-700">{t.form.password.label}</Label>
                          <div className="relative">
                            <Input
                              id="password"
                              name="password"
                              type={showPassword ? "text" : "password"}
                              placeholder={t.form.password.placeholder}
                              value={formData.password}
                              onChange={handleInputChange}
                              autoComplete="current-password"
                              className="h-11 rounded-lg pr-10"
                              style={{ border: '1px solid rgb(191, 219, 254)', borderWidth: '1px', paddingLeft: '1rem' }}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex flex-col gap-4 pt-6">
                        <Button 
                          type="submit" 
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300" 
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {t.form.buttons.loggingIn}
                            </>
                          ) : (
                            t.form.buttons.login
                          )}
                        </Button>
                        <div className="text-center text-sm space-y-2">
                          <Link href={`/${lang}/forgot-password`} className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                            {t.form.buttons.forgotPassword}
                          </Link>
                          <div>
                            <span className="text-gray-500">{t.form.buttons.noAccount} </span>
                            <Link href={`/${lang}/register`} className="text-blue-600 font-semibold hover:text-blue-700 hover:underline">
                              {t.form.buttons.register}
                            </Link>
                          </div>
                        </div>
                      </CardFooter>
                    </form>
                  </Card>
                </TabsContent>

                <TabsContent value="quick-login">
                  <Card className="border-2 border-blue-100 rounded-3xl shadow-xl bg-white/90 backdrop-blur-sm">
                    <CardHeader className="pb-6">
                      <CardTitle className="text-2xl font-bold text-gray-900">{t.form.quickLogin.title}</CardTitle>
                      <CardDescription className="text-gray-600 mt-2">{t.form.quickLogin.subtitle}</CardDescription>
                      {error && (
                        <Alert variant="destructive" className="mt-4 rounded-xl">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button
                          variant="outline"
                          className="h-auto py-6 flex flex-col items-center gap-3 border-2 border-blue-200 hover:border-blue-400 rounded-xl bg-white hover:bg-blue-50 transition-all duration-300 shadow-sm hover:shadow-md"
                          onClick={() => handleQuickLogin("DCC")}
                          disabled={isLoading}
                        >
                          <Shield className="h-6 w-6 text-blue-600" />
                          <div className="space-y-1">
                            <h3 className="font-semibold text-gray-900">{t.form.quickLogin.dcc.title}</h3>
                            <p className="text-sm text-gray-600">{t.form.quickLogin.dcc.subtitle}</p>
                          </div>
                        </Button>
                        <Button
                          variant="outline"
                          className="h-auto py-6 flex flex-col items-center gap-3 border-2 border-blue-200 hover:border-blue-400 rounded-xl bg-white hover:bg-blue-50 transition-all duration-300 shadow-sm hover:shadow-md"
                          onClick={() => handleQuickLogin("EMPLOYER")}
                          disabled={isLoading}
                        >
                          <Briefcase className="h-6 w-6 text-blue-600" />
                          <div className="space-y-1">
                            <h3 className="font-semibold text-gray-900">{t.form.quickLogin.employer.title}</h3>
                            <p className="text-sm text-gray-600">{t.form.quickLogin.employer.subtitle}</p>
                          </div>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <AuthFooter />
        </div>
      </div>
    </div>
  )
}

export default function Login() {
  return (
    <ClientOnly fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </ClientOnly>
  )
} 