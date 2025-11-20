"use client"

import type React from "react"
import { useState } from "react"
import { useSearchParams, useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Rocket, Target, Heart, Eye, EyeOff } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { AuthHeader } from "@/components/auth-header"
import { AuthFooter } from "@/components/auth-footer"
import { ClientOnly } from "@/components/client-only"
import { registerTranslations } from "../translations/auth"

function RegisterContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  const t = registerTranslations[lang as keyof typeof registerTranslations] || registerTranslations.en
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [activeTab, setActiveTab] = useState("individual")
  const [errorMessage, setErrorMessage] = useState("")
  const [fieldErrors, setFieldErrors] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    contactName: "",
    tinNumber: "",
  })
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "CONSUMER",
    companyName: "",
    contactName: "",
    tinNumber: "",
    isActive: false,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error message when user starts typing
    if (errorMessage) {
      setErrorMessage("")
    }
    // Clear specific field error
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value }))
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    // Set default role based on tab
    if (value === "individual") {
      setFormData((prev) => ({ ...prev, role: "CONSUMER" }))
    } else if (value === "company") {
      setFormData((prev) => ({ ...prev, role: "EMPLOYER" }))
    }
  }

  const validateForm = () => {
    console.log("=== VALIDATION START ===")
    console.log("Form Data:", formData)
    console.log("Active Tab:", activeTab)
    console.log("Is Loading:", isLoading)

    // Clear all field errors first
    setFieldErrors({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      companyName: "",
      contactName: "",
      tinNumber: "",
    })

    let hasErrors = false

    // Individual-specific validation
    if (activeTab === "individual") {
      console.log("=== INDIVIDUAL VALIDATION ===")
      
      if (!formData.fullName || formData.fullName.trim() === "") {
        setFieldErrors(prev => ({ ...prev, fullName: "Full name is required" }))
        console.log("❌ Full Name is missing or empty")
        hasErrors = true
      } else {
        console.log("✅ Full Name:", formData.fullName)
      }
    }

    if (!formData.email || formData.email.trim() === "") {
      setFieldErrors(prev => ({ ...prev, email: "Email is required" }))
      console.log("❌ Email is missing or empty")
      hasErrors = true
    } else {
      console.log("✅ Email:", formData.email)
    }

    if (!formData.phone || formData.phone.trim() === "") {
      setFieldErrors(prev => ({ ...prev, phone: "Phone number is required" }))
      console.log("❌ Phone is missing or empty")
      hasErrors = true
    } else {
      console.log("✅ Phone:", formData.phone)
    }

    if (!formData.password || formData.password.trim() === "") {
      setFieldErrors(prev => ({ ...prev, password: "Password is required" }))
      console.log("❌ Password is missing or empty")
      hasErrors = true
    } else {
      console.log("✅ Password length:", formData.password.length)
    }

    if (!formData.confirmPassword || formData.confirmPassword.trim() === "") {
      setFieldErrors(prev => ({ ...prev, confirmPassword: "Please confirm your password" }))
      console.log("❌ Confirm Password is missing or empty")
      hasErrors = true
    } else {
      console.log("✅ Confirm Password length:", formData.confirmPassword.length)
    }

    // Company-specific validation
    if (activeTab === "company") {
      console.log("=== COMPANY VALIDATION ===")
      
      if (!formData.companyName || formData.companyName.trim() === "") {
        setFieldErrors(prev => ({ ...prev, companyName: "Company name is required" }))
        console.log("❌ Company Name is missing or empty")
        hasErrors = true
      } else {
        console.log("✅ Company Name:", formData.companyName)
      }

      if (!formData.contactName || formData.contactName.trim() === "") {
        setFieldErrors(prev => ({ ...prev, contactName: "Contact person name is required" }))
        console.log("❌ Contact Name is missing or empty")
        hasErrors = true
      } else {
        console.log("✅ Contact Name:", formData.contactName)
      }

      if (!formData.tinNumber || formData.tinNumber.trim() === "") {
        setFieldErrors(prev => ({ ...prev, tinNumber: "TIN number is required" }))
        console.log("❌ TIN Number is missing or empty")
        hasErrors = true
      } else {
        console.log("✅ TIN Number length:", formData.tinNumber.length)
        if (formData.tinNumber.length !== 9) {
          setFieldErrors(prev => ({ ...prev, tinNumber: "TIN number must be exactly 9 characters" }))
          console.log("❌ TIN Number length is not 9:", formData.tinNumber.length)
          hasErrors = true
        }
      }
    }

    // Password validation
    if (formData.password && formData.password.length < 6) {
      setFieldErrors(prev => ({ ...prev, password: "Password must be at least 6 characters long" }))
      console.log("❌ Password too short:", formData.password.length)
      hasErrors = true
    }

    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      setFieldErrors(prev => ({ ...prev, confirmPassword: "Passwords don't match" }))
      console.log("❌ Passwords don't match")
      console.log("Password:", formData.password)
      console.log("Confirm Password:", formData.confirmPassword)
      hasErrors = true
    }

    if (hasErrors) {
      console.log("❌ VALIDATION FAILED")
      return false
    }

    console.log("✅ VALIDATION PASSED")
    return true
  }

  const checkUniqueness = async () => {
    try {
      console.log("🔍 Checking uniqueness for:", {
        email: formData.email,
        phone: formData.phone,
        tinNumber: activeTab === "company" ? formData.tinNumber : null,
      })

      const response = await fetch('/api/v1/auth/check-uniqueness', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          phone: formData.phone,
          tinNumber: activeTab === "company" ? formData.tinNumber : null,
        }),
      })

      console.log("📡 Response status:", response.status)
      const data = await response.json()
      console.log("📡 Response data:", data)

      if (!response.ok) {
        console.error("❌ API error:", data)
        if (response.status === 500) {
          // Database connection issue - allow registration to proceed
          console.log("⚠️ Database connection issue, allowing registration to proceed")
          return true
        }
        throw new Error(data.message || 'Uniqueness check failed')
      }

      if (data.emailExists) {
        console.log("❌ Email already exists, showing field error...")
        setFieldErrors(prev => ({ ...prev, email: "This email address is already registered. Please use a different email." }))
        return false
      }

      if (data.phoneExists) {
        console.log("❌ Phone already exists, showing field error...")
        setFieldErrors(prev => ({ ...prev, phone: "This phone number is already registered. Please use a different phone number." }))
        return false
      }

      if (activeTab === "company" && data.tinNumberExists) {
        console.log("❌ TIN already exists, showing field error...")
        setFieldErrors(prev => ({ ...prev, tinNumber: "This TIN number is already registered. Please use a different TIN number." }))
        return false
      }

      console.log("✅ Uniqueness check passed - all fields are unique")
      return true
    } catch (error) {
      console.error("❌ Check uniqueness error:", error)
      toast({
        title: "Validation Error",
        description: "Unable to check uniqueness. Please try again.",
        variant: "destructive",
      })
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted", { formData, activeTab })

    if (!validateForm()) {
      console.log("Form validation failed")
      return
    }

    // Check for unique email and phone
    console.log("Checking uniqueness...")
    const isUnique = await checkUniqueness()
    if (!isUnique) {
      console.log("Uniqueness check failed")
      return
    }

    console.log("Proceeding with registration...")
    setIsLoading(true)

    try {
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: activeTab === "individual" ? formData.fullName : formData.contactName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: formData.role,
          companyName: formData.companyName,
          contactName: formData.contactName,
          tinNumber: formData.tinNumber,
          isActive: formData.isActive,
        }),
      })

      const data = await response.json()
      console.log("Registration response", { status: response.status, data })

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
      }

      toast({
        title: t.form.validation.success.title,
        description: t.form.validation.success.description,
      })

      router.push(`/${lang}/login`)
    } catch (error) {
      console.error("Registration error", error)
      toast({
        title: t.form.validation.error.title,
        description: error instanceof Error ? error.message : t.form.validation.error.description,
        variant: "destructive",
      })
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

        <div className="relative z-10">
          <AuthHeader />
        </div>

        <div className="relative z-10 flex-1 flex flex-col lg:flex-row gap-y-8">
          {/* Left Side - Branding & Vision */}
          <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ backgroundColor: '#0249ad' }}>
            <div className="relative z-10 flex flex-col justify-center px-12 text-white">
              <div className="max-w-lg">
                <h1 className="text-4xl font-bold mb-6">{t.hero.title}</h1>
                <p className="text-xl mb-8 text-white/90">{t.hero.subtitle}</p>

                {/* Vision & Values */}
                <div className="space-y-6">
                  <div className="flex items-start space-x-4 group">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-all duration-300 shadow-md">
                      <Rocket className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{t.hero.values.innovation.title}</h3>
                      <p className="text-white/80">{t.hero.values.innovation.description}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 group">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-all duration-300 shadow-md">
                      <Target className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{t.hero.values.impact.title}</h3>
                      <p className="text-white/80">{t.hero.values.impact.description}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 group">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-all duration-300 shadow-md">
                      <Heart className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{t.hero.values.inclusion.title}</h3>
                      <p className="text-white/80">{t.hero.values.inclusion.description}</p>
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

          {/* Right Side - Registration Form */}
          <div className="w-full lg:w-1/2 flex items-center justify-center p-8 px-4 pt-8 pb-8 min-h-[calc(100vh-80px)] overflow-y-auto">
            <Card className="w-full max-w-2xl border-2 border-blue-100 rounded-3xl shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-bold text-gray-900">{t.form.title}</CardTitle>
                <CardDescription className="text-gray-600 mt-2">{t.form.subtitle}</CardDescription>
                {errorMessage && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          Validation Error
                        </h3>
                        <div className="mt-2 text-sm text-red-700">
                          {errorMessage}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="individual" onValueChange={handleTabChange} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-xl">
                    <TabsTrigger 
                      value="individual" 
                      className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
                    >
                      {t.form.tabs.individual}
                    </TabsTrigger>
                    <TabsTrigger 
                      value="company" 
                      className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
                    >
                      {t.form.tabs.company}
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="individual">
                    <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700">{t.form.fullName.label}</Label>
                        <Input
                          id="fullName"
                          name="fullName"
                          type="text"
                          placeholder={t.form.fullName.placeholder}
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="h-11 rounded-lg"
                          style={{ border: '1px solid rgb(191, 219, 254)', borderWidth: '1px', paddingLeft: '1rem' }}
                        />
                        {fieldErrors.fullName && (
                          <p className="text-sm text-red-500 mt-1">{fieldErrors.fullName}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-semibold text-gray-700">{t.form.email.label}</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder={t.form.email.placeholder}
                          value={formData.email}
                          onChange={handleInputChange}
                          className="h-11 rounded-lg"
                          style={{ border: '1px solid rgb(191, 219, 254)', borderWidth: '1px', paddingLeft: '1rem' }}
                        />
                        {fieldErrors.email && (
                          <p className="text-sm text-red-500 mt-1">{fieldErrors.email}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">{t.form.phone.label}</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder={t.form.phone.placeholder}
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="h-11 rounded-lg"
                          style={{ border: '1px solid rgb(191, 219, 254)', borderWidth: '1px', paddingLeft: '1rem' }}
                        />
                        {fieldErrors.phone && (
                          <p className="text-sm text-red-500 mt-1">{fieldErrors.phone}</p>
                        )}
                      </div>

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
                            className="h-11 rounded-lg pr-10"
                            style={{ border: '1px solid rgb(191, 219, 254)', borderWidth: '1px', paddingLeft: '1rem' }}
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                            onClick={() => setShowPassword(!showPassword)}
                            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setShowPassword(!showPassword) }}
                            tabIndex={-1}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
                          </button>
                        </div>
                        {fieldErrors.password && (
                          <p className="text-sm text-red-500 mt-1">{fieldErrors.password}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">{t.form.confirmPassword.label}</Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder={t.form.confirmPassword.placeholder}
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="h-11 rounded-lg pr-10"
                            style={{ border: '1px solid rgb(191, 219, 254)', borderWidth: '1px', paddingLeft: '1rem' }}
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setShowConfirmPassword(!showConfirmPassword) }}
                            tabIndex={-1}
                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                          >
                            {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
                          </button>
                        </div>
                        {fieldErrors.confirmPassword && (
                          <p className="text-sm text-red-500 mt-1">{fieldErrors.confirmPassword}</p>
                        )}
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300" 
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t.form.buttons.registering || "Creating Account..."}
                          </>
                        ) : (
                          t.form.buttons.register || "Create Account"
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                  <TabsContent value="company">
                    <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                      <div className="space-y-2">
                        <Label htmlFor="companyName" className="text-sm font-semibold text-gray-700">{t.form.companyName.label}</Label>
                        <Input
                          id="companyName"
                          name="companyName"
                          type="text"
                          placeholder={t.form.companyName.placeholder}
                          value={formData.companyName}
                          onChange={handleInputChange}
                          className="h-11 rounded-lg"
                          style={{ border: '1px solid rgb(191, 219, 254)', borderWidth: '1px', paddingLeft: '1rem' }}
                        />
                        {fieldErrors.companyName && (
                          <p className="text-sm text-red-500 mt-1">{fieldErrors.companyName}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactName" className="text-sm font-semibold text-gray-700">{t.form.contactName.label}</Label>
                        <Input
                          id="contactName"
                          name="contactName"
                          type="text"
                          placeholder={t.form.contactName.placeholder}
                          value={formData.contactName}
                          onChange={handleInputChange}
                          className="h-11 rounded-lg"
                          style={{ border: '1px solid rgb(191, 219, 254)', borderWidth: '1px', paddingLeft: '1rem' }}
                        />
                        {fieldErrors.contactName && (
                          <p className="text-sm text-red-500 mt-1">{fieldErrors.contactName}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tinNumber" className="text-sm font-semibold text-gray-700">{t.form.tinNumber.label}</Label>
                        <Input
                          id="tinNumber"
                          name="tinNumber"
                          type="text"
                          placeholder={t.form.tinNumber.placeholder}
                          value={formData.tinNumber}
                          onChange={handleInputChange}
                          minLength={9}
                          maxLength={9}
                          className="h-11 rounded-lg"
                          style={{ border: '1px solid rgb(191, 219, 254)', borderWidth: '1px', paddingLeft: '1rem' }}
                        />
                        {fieldErrors.tinNumber && (
                          <p className="text-sm text-red-500 mt-1">{fieldErrors.tinNumber}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-semibold text-gray-700">{t.form.email.label}</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder={t.form.email.placeholder}
                          value={formData.email}
                          onChange={handleInputChange}
                          className="h-11 rounded-lg"
                          style={{ border: '1px solid rgb(191, 219, 254)', borderWidth: '1px', paddingLeft: '1rem' }}
                        />
                        {fieldErrors.email && (
                          <p className="text-sm text-red-500 mt-1">{fieldErrors.email}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">{t.form.phone.label}</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder={t.form.phone.placeholder}
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="h-11 rounded-lg"
                          style={{ border: '1px solid rgb(191, 219, 254)', borderWidth: '1px', paddingLeft: '1rem' }}
                        />
                        {fieldErrors.phone && (
                          <p className="text-sm text-red-500 mt-1">{fieldErrors.phone}</p>
                        )}
                      </div>
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
                            className="h-11 rounded-lg pr-10"
                            style={{ border: '1px solid rgb(191, 219, 254)', borderWidth: '1px', paddingLeft: '1rem' }}
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                            onClick={() => setShowPassword(!showPassword)}
                            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setShowPassword(!showPassword) }}
                            tabIndex={-1}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
                          </button>
                        </div>
                        {fieldErrors.password && (
                          <p className="text-sm text-red-500 mt-1">{fieldErrors.password}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">{t.form.confirmPassword.label}</Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder={t.form.confirmPassword.placeholder}
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="h-11 rounded-lg pr-10"
                            style={{ border: '1px solid rgb(191, 219, 254)', borderWidth: '1px', paddingLeft: '1rem' }}
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setShowConfirmPassword(!showConfirmPassword) }}
                            tabIndex={-1}
                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                          >
                            {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
                          </button>
                        </div>
                        {fieldErrors.confirmPassword && (
                          <p className="text-sm text-red-500 mt-1">{fieldErrors.confirmPassword}</p>
                        )}
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300" 
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t.form.buttons.registering || "Creating Account..."}
                          </>
                        ) : (
                          t.form.buttons.register || "Create Account"
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-center pt-6">
                <p className="text-sm text-gray-600">
                  {t.form.login.text}{" "}
                  <Link href={`/${lang}/login`} className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                    {t.form.login.link}
                  </Link>
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>

        <div className="relative z-10">
          <AuthFooter />
        </div>
      </div>
    </div>
  )
}

export default function Register() {
  return (
    <ClientOnly>
      <RegisterContent />
    </ClientOnly>
  )
} 