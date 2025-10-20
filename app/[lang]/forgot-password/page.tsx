"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Shield, Lock, Smartphone, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AuthHeader } from "@/components/auth-header"
import { AuthFooter } from "@/components/auth-footer"
import { ClientOnly } from "@/components/client-only"
import { forgotPasswordTranslations } from "../translations/auth"

function ForgotPasswordContent() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const lang = (params?.lang as string) || "en"
  const t = forgotPasswordTranslations[lang as keyof typeof forgotPasswordTranslations] || forgotPasswordTranslations.en
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<"phone" | "sent" | "verify">("phone")
  const [error, setError] = useState<string | null>(null)
  const [otpError, setOtpError] = useState<string | null>(null)
  const [isOtpValid, setIsOtpValid] = useState(false)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [isPhoneValid, setIsPhoneValid] = useState(false)

  // Check for error parameter from reset password redirect
  useEffect(() => {
    const errorParam = searchParams?.get("error")
    if (errorParam === "invalid-link") {
      setError("The password reset link is invalid or has expired. Please request a new one.")
    }
  }, [searchParams])

  // Real-time phone validation
  const validatePhoneInput = (value: string) => {
    if (!value) {
      setPhoneError(null)
      setIsPhoneValid(false)
      return
    }

    // Remove all non-digit characters for validation
    const digitsOnly = value.replace(/\D/g, '')
    
    // Check if it's a valid Rwanda phone number (10 digits starting with 07)
    if (digitsOnly.length < 10) {
      setPhoneError("Phone number is too short")
      setIsPhoneValid(false)
      return
    }
    
    if (digitsOnly.length > 10) {
      setPhoneError("Phone number is too long")
      setIsPhoneValid(false)
      return
    }
    
    if (!digitsOnly.startsWith('07')) {
      setPhoneError("Phone number should start with 07")
      setIsPhoneValid(false)
      return
    }

    setPhoneError(null)
    setIsPhoneValid(true)
  }

  // Real-time OTP validation
  const validateOtpInput = (value: string) => {
    if (!value) {
      setOtpError(null)
      setIsOtpValid(false)
      return
    }

    const otpRegex = /^\d{4}$/
    if (!otpRegex.test(value)) {
      setOtpError("Please enter exactly 4 digits")
      setIsOtpValid(false)
      return
    }

    const otpNumber = parseInt(value, 10)
    if (otpNumber < 1000 || otpNumber > 9999) {
      setOtpError("OTP must be between 1000 and 9999")
      setIsOtpValid(false)
      return
    }

    setOtpError(null)
    setIsOtpValid(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("🔘 Submit button clicked")

    if (!phone) {
      console.log("❌ No phone number provided")
      toast({
        title: t.form.validation.missingPhone.title,
        description: t.form.validation.missingPhone.description,
        variant: "destructive",
      })
      return
    }

    console.log("🚀 Starting password reset for:", phone)
    setIsLoading(true)

    try {
      // Generate a reset token
      const resetToken = crypto.randomUUID()
      console.log("🔑 Generated reset token:", resetToken)

      console.log("📡 Making API call to /api/email/password-reset")

      // Call the password reset SMS API
      const response = await fetch("/api/sms/password-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: phone.trim(),
          resetToken,
        }),
      })

      console.log("📊 API response status:", response.status)

      const result = await response.json()
      console.log("📋 API response data:", result)

      if (result.success) {
        console.log("✅ Password reset request successful")
        
        if (result.demo) {
          // Demo mode - show special message with demo OTP
          const demoOTP = "1234"
          toast({
            title: "Demo Mode",
            description: `Demo OTP: ${demoOTP}. In production, this would be sent via SMS to ${phone}.`,
          })
        } else {
          toast({
            title: t.form.validation.success.title,
            description: t.form.validation.success.description,
          })
        }
        setStep("sent")
      } else {
        console.log("❌ Password reset request failed:", result.message)
        throw new Error(result.message || t.form.validation.error.description)
      }
    } catch (error: any) {
      console.error("❌ Password reset error:", error)
      toast({
        title: t.form.validation.error.title,
        description: error.message || t.form.validation.error.description,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("🔘 OTP verification button clicked")

    // Comprehensive OTP validation
    if (!otp) {
      console.log("❌ No OTP provided")
      toast({
        title: t.form.validation.missingOTP.title,
        description: t.form.validation.missingOTP.description,
        variant: "destructive",
      })
      return
    }

    // Validate OTP format
    const otpRegex = /^\d{4}$/
    if (!otpRegex.test(otp)) {
      console.log("❌ Invalid OTP format:", otp)
      toast({
        title: "Invalid OTP Format",
        description: "Please enter a valid 4-digit OTP code.",
        variant: "destructive",
      })
      return
    }

    // Validate OTP range (1000-9999)
    const otpNumber = parseInt(otp, 10)
    if (otpNumber < 1000 || otpNumber > 9999) {
      console.log("❌ OTP out of range:", otpNumber)
      toast({
        title: "Invalid OTP",
        description: "OTP must be a 4-digit number between 1000 and 9999.",
        variant: "destructive",
      })
      return
    }

    console.log("✅ OTP validation passed:", otp)
    console.log("🔍 Verifying OTP:", otp)
    setIsLoading(true)

    try {
      console.log("📡 Making API call to /api/sms/verify-otp")

      // Call the OTP verification API
      const response = await fetch("/api/sms/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: phone.trim(),
          otp: otp.trim(),
          type: "PASSWORD_RESET",
        }),
      })

      console.log("📊 API response status:", response.status)

      const result = await response.json()
      console.log("📋 API response data:", result)

      if (result.success && result.isValid) {
        console.log("✅ OTP verification successful")
        if (result.demo) {
          if (result.fallback) {
            toast({
              title: "Demo Mode - OTP Verified!",
              description: "Database verification failed, using demo mode. Please check your database connection.",
            })
          } else {
            toast({
              title: "Demo Mode - OTP Verified!",
              description: "Demo OTP verified successfully. In production, this would verify the actual SMS OTP.",
            })
          }
        } else {
          toast({
            title: t.form.validation.otpSuccess.title,
            description: t.form.validation.otpSuccess.description,
          })
        }
        // Redirect to reset password page or show reset password form
        router.push(`/${lang}/reset-password?phone=${encodeURIComponent(phone)}&verified=true`)
      } else {
        console.log("❌ OTP verification failed:", result.message)
        toast({
          title: t.form.validation.otpError.title,
          description: result.message || t.form.validation.otpError.description,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("❌ OTP verification error:", error)
      toast({
        title: t.form.validation.otpError.title,
        description: error.message || t.form.validation.otpError.description,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AuthHeader />

      <div className="flex-1 flex flex-col lg:flex-row gap-y-8">
        {/* Left Side - Security & Trust */}
        <div className="hidden lg:flex lg:w-1/2 bg-blue-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex flex-col justify-center px-12 text-white">
            <div className="max-w-lg">
              <h1 className="text-4xl font-bold mb-6">{t.hero.title}</h1>
              <p className="text-xl mb-8 text-white/90">{t.hero.subtitle}</p>

              {/* Security Features */}
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{t.hero.features.secure.title}</h3>
                    <p className="text-white/80">{t.hero.features.secure.description}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{t.hero.features.protection.title}</h3>
                    <p className="text-white/80">{t.hero.features.protection.description}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{t.hero.features.support.title}</h3>
                    <p className="text-white/80">{t.hero.features.support.description}</p>
                  </div>
                </div>

                <div className="bg-white/10 rounded-lg p-6 mt-8">
                  <h4 className="font-semibold text-lg mb-3">{t.hero.help.title}</h4>
                  <p className="text-white/80 mb-4">{t.hero.help.description}</p>
                  <div className="flex items-center space-x-2 text-sm">
                    <Smartphone className="w-4 h-4" />
                    <span>{t.hero.help.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-20 right-32 w-20 h-20 bg-white/10 rounded-full"></div>
          <div className="absolute top-1/2 right-10 w-16 h-16 bg-white/10 rounded-full"></div>
        </div>

        {/* Right Side - Reset Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 px-4 pt-8 pb-8 min-h-screen overflow-y-auto">
          <div className="w-full max-w-md">
            <Card className="border-gray-300 border-2 rounded-2xl">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-3xl font-bold text-primary mb-2">
                  {step === "phone" ? t.form.phone.title : 
                   step === "sent" ? t.form.sent.title : 
                   t.form.verify.title}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {step === "phone" ? t.form.phone.subtitle : 
                   step === "sent" ? t.form.sent.subtitle : 
                   t.form.verify.subtitle}
                </CardDescription>
                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          Invalid Reset Link
                        </h3>
                        <div className="mt-2 text-sm text-red-700">
                          {error}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardHeader>

              <CardContent className="space-y-8 text-base">
                {step === "phone" ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="phone" className="text-gray-700 font-medium">
                        {t.form.phone.field.label}
                      </Label>
                      <p className="text-sm text-gray-500 mb-2">
                        Enter your phone number to receive a reset code
                      </p>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder={t.form.phone.field.placeholder}
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value)
                          validatePhoneInput(e.target.value)
                        }}
                        className={`h-12 border-gray-300 focus:border-primary text-base ${
                          phoneError ? 'border-red-500 focus:border-red-500' : 
                          isPhoneValid ? 'border-green-500 focus:border-green-500' : ''
                        }`}
                        required
                      />
                      {phoneError && (
                        <div className="text-red-500 text-sm mt-1 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {phoneError}
                        </div>
                      )}
                      {isPhoneValid && (
                        <div className="text-green-500 text-sm mt-1 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Valid phone number
                        </div>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg rounded-lg shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                      disabled={isLoading || !isPhoneValid}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          {t.form.phone.buttons.submitting}
                        </>
                      ) : (
                        t.form.phone.buttons.submit
                      )}
                    </Button>
                  </form>
                ) : step === "sent" ? (
                  <div className="text-center space-y-6">
                    <Smartphone className="w-16 h-16 mx-auto text-primary" />
                    <p className="text-gray-600">
                      {t.form.sent.message.replace("{phone}", phone)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {t.form.sent.smsNote}
                    </p>
                    <Button
                      onClick={() => setStep("verify")}
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg rounded-lg shadow-sm"
                    >
                      {t.form.sent.verifyButton}
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleVerifyOTP} className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="otp" className="text-gray-700 font-medium">
                        {t.form.verify.field.label}
                      </Label>
                      <p className="text-sm text-gray-500 mb-2">
                        Enter the 4-digit code sent to your phone number
                      </p>
                      <Input
                        id="otp"
                        name="otp"
                        type="text"
                        placeholder={t.form.verify.field.placeholder}
                        value={otp}
                        onChange={(e) => {
                          // Only allow numeric input and limit to 4 digits
                          const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                          setOtp(value);
                          validateOtpInput(value);
                        }}
                        className={`h-12 border-gray-300 focus:border-primary text-base text-center text-lg tracking-widest ${
                          otpError ? 'border-red-500 focus:border-red-500' : 
                          isOtpValid ? 'border-green-500 focus:border-green-500' : ''
                        }`}
                        maxLength={4}
                        pattern="[0-9]{4}"
                        inputMode="numeric"
                        required
                      />
                      {otpError && (
                        <div className="text-red-500 text-sm mt-1 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {otpError}
                        </div>
                      )}
                      {isOtpValid && (
                        <div className="text-green-500 text-sm mt-1 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Valid OTP format
                        </div>
                      )}
                      {otp && !otpError && !isOtpValid && (
                        <div className="text-gray-500 text-sm mt-1">
                          {otp.length}/4 digits entered
                        </div>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg rounded-lg shadow-sm"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          {t.form.verify.buttons.submitting}
                        </>
                      ) : (
                        t.form.verify.buttons.submit
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>

              <CardFooter className="text-center pb-10">
                <div className="w-full space-y-6">
                  <div className="text-sm text-gray-600">
                    {t.form.login.text}{" "}
                    <Link href={`/${lang}/login`} className="text-primary hover:underline font-medium">
                      {t.form.login.link}
                    </Link>
                  </div>
                  {step === "sent" && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setStep("phone")
                        setPhone("")
                        setOtp("")
                        setOtpError(null)
                        setIsOtpValid(false)
                        setPhoneError(null)
                        setIsPhoneValid(false)
                      }}
                    >
                      {t.form.sent.tryDifferent}
                    </Button>
                  )}
                  {step === "verify" && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setStep("sent")
                        setOtp("")
                        setOtpError(null)
                        setIsOtpValid(false)
                      }}
                    >
                      {t.form.verify.backToSent}
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      <AuthFooter />
    </div>
  )
}

export default function ForgotPassword() {
  return (
    <ClientOnly fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <ForgotPasswordContent />
    </ClientOnly>
  )
} 