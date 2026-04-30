"use client"

import type React from "react"
import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Rocket, Target, Heart, Eye, EyeOff, User, UserPlus, Mail, Phone, Lock, Building, Hash, Users, HeartHandshake, Check } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { AuthHeader } from "@/components/auth-header"
import { AuthFooter } from "@/components/auth-footer"
import { ClientOnly } from "@/components/client-only"
import { registerTranslations } from "../translations/auth"

function RegisterContent() {
  const router = useRouter()
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  const t = registerTranslations[lang as keyof typeof registerTranslations] || registerTranslations.en
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [activeTab, setActiveTab] = useState("individual")
  const [step, setStep] = useState(1)
  const STEPS_TOTAL = 2
  const [errorMessage, setErrorMessage] = useState("")
  const [fieldErrors, setFieldErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    contactName: "",
    tinNumber: "",
    businessSize: "",
    nationalId: "",
    dateOfBirth: "",
  })
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "FARMER",
    companyName: "",
    contactName: "",
    tinNumber: "",
    businessSize: "",
    isActive: false,
    // Optional: personal, identification, contact
    gender: "",
    dateOfBirth: "",
    nationalId: "",
    alternatePhone: "",
    district: "",
    address: "",
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

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    if (value === "individual") {
      setFormData((prev) => ({ ...prev, role: "FARMER" }))
    } else {
      setFormData((prev) => ({ ...prev, role: "COOP_ADMIN" }))
    }
  }

  const validateStep = (stepNumber: number): boolean => {
    const clearAll = () => setFieldErrors({
      firstName: "", lastName: "", email: "", phone: "", password: "", confirmPassword: "",
      companyName: "", contactName: "", tinNumber: "", businessSize: "", nationalId: "", dateOfBirth: "",
    })
    if (stepNumber === 1) {
      clearAll()
      let hasErrors = false
      if (activeTab === "individual") {
        if (!formData.firstName?.trim()) {
          setFieldErrors(prev => ({ ...prev, firstName: "First name is required" }))
          hasErrors = true
        }
        if (!formData.lastName?.trim()) {
          setFieldErrors(prev => ({ ...prev, lastName: "Last name is required" }))
          hasErrors = true
        }
      } else {
        if (!formData.companyName?.trim()) {
          setFieldErrors(prev => ({ ...prev, companyName: "Company name is required" }))
          hasErrors = true
        }
        if (!formData.contactName?.trim()) {
          setFieldErrors(prev => ({ ...prev, contactName: "Contact person name is required" }))
          hasErrors = true
        }
        if (!formData.tinNumber?.trim()) {
          setFieldErrors(prev => ({ ...prev, tinNumber: "TIN number is required" }))
          hasErrors = true
        } else if (formData.tinNumber.length !== 9) {
          setFieldErrors(prev => ({ ...prev, tinNumber: "TIN number must be exactly 9 characters" }))
          hasErrors = true
        }
        if (!formData.businessSize || !["SMALL", "MEDIUM", "LARGE"].includes(formData.businessSize)) {
          setFieldErrors(prev => ({ ...prev, businessSize: "Please select a business size" }))
          hasErrors = true
        }
      }
      return !hasErrors
    }
    if (stepNumber === 2) {
      clearAll()
      let hasErrors = false
      if (!formData.email?.trim()) {
        setFieldErrors(prev => ({ ...prev, email: "Email is required" }))
        hasErrors = true
      }
      if (!formData.phone?.trim()) {
        setFieldErrors(prev => ({ ...prev, phone: "Phone number is required" }))
        hasErrors = true
      }
      if (!formData.password?.trim()) {
        setFieldErrors(prev => ({ ...prev, password: "Password is required" }))
        hasErrors = true
      } else if (formData.password.length < 6) {
        setFieldErrors(prev => ({ ...prev, password: "Password must be at least 6 characters long" }))
        hasErrors = true
      }
      if (!formData.confirmPassword?.trim()) {
        setFieldErrors(prev => ({ ...prev, confirmPassword: "Please confirm your password" }))
        hasErrors = true
      } else if (formData.password !== formData.confirmPassword) {
        setFieldErrors(prev => ({ ...prev, confirmPassword: "Passwords don't match" }))
        hasErrors = true
      }
      return !hasErrors
    }
    return true
  }

  const validateForm = () => {
    setFieldErrors({
      firstName: "", lastName: "", email: "", phone: "", password: "", confirmPassword: "",
      companyName: "", contactName: "", tinNumber: "", businessSize: "", nationalId: "", dateOfBirth: "",
    })
    let hasErrors = false
    if (activeTab === "individual") {
      if (!formData.firstName?.trim()) {
        setFieldErrors(prev => ({ ...prev, firstName: "First name is required" }))
        hasErrors = true
      }
      if (!formData.lastName?.trim()) {
        setFieldErrors(prev => ({ ...prev, lastName: "Last name is required" }))
        hasErrors = true
      }
    }
    if (!formData.email || formData.email.trim() === "") {
      setFieldErrors(prev => ({ ...prev, email: "Email is required" }))
      hasErrors = true
    }
    if (!formData.phone || formData.phone.trim() === "") {
      setFieldErrors(prev => ({ ...prev, phone: "Phone number is required" }))
      hasErrors = true
    }
    if (!formData.password || formData.password.trim() === "") {
      setFieldErrors(prev => ({ ...prev, password: "Password is required" }))
      hasErrors = true
    }
    if (!formData.confirmPassword || formData.confirmPassword.trim() === "") {
      setFieldErrors(prev => ({ ...prev, confirmPassword: "Please confirm your password" }))
      hasErrors = true
    }
    if (["cooperative", "company", "ngo"].includes(activeTab)) {
      if (!formData.companyName || formData.companyName.trim() === "") {
        setFieldErrors(prev => ({ ...prev, companyName: "Company name is required" }))
        hasErrors = true
      }
      if (!formData.contactName || formData.contactName.trim() === "") {
        setFieldErrors(prev => ({ ...prev, contactName: "Contact person name is required" }))
        hasErrors = true
      }
      if (!formData.tinNumber || formData.tinNumber.trim() === "") {
        setFieldErrors(prev => ({ ...prev, tinNumber: "TIN number is required" }))
        hasErrors = true
      } else if (formData.tinNumber.length !== 9) {
        setFieldErrors(prev => ({ ...prev, tinNumber: "TIN number must be exactly 9 characters" }))
        hasErrors = true
      }
      if (!formData.businessSize || !["SMALL", "MEDIUM", "LARGE"].includes(formData.businessSize)) {
        setFieldErrors(prev => ({ ...prev, businessSize: "Please select a business size" }))
        hasErrors = true
      }
    }
    if (formData.password && formData.password.length < 6) {
      setFieldErrors(prev => ({ ...prev, password: "Password must be at least 6 characters long" }))
      hasErrors = true
    }
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      setFieldErrors(prev => ({ ...prev, confirmPassword: "Passwords don't match" }))
      hasErrors = true
    }
    return !hasErrors
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

      if (["cooperative", "company", "ngo"].includes(activeTab) && data.tinNumberExists) {
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
    if (step !== 2) return

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
      const response = await fetch('/api/v1/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registrationType: activeTab,
          name: activeTab === "individual" ? `${formData.firstName} ${formData.lastName}`.trim() : formData.contactName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: formData.role,
          // Optional: personal, identification, contact
          gender: formData.gender || undefined,
          dateOfBirth: formData.dateOfBirth || undefined,
          nationalId: formData.nationalId || undefined,
          alternatePhone: formData.alternatePhone || undefined,
          district: formData.district || undefined,
          address: formData.address || undefined,
          // Company
          businessName: formData.companyName || undefined,
          contactPerson: formData.contactName || undefined,
          tin: formData.tinNumber || undefined,
          businessSize: formData.businessSize || undefined,
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

  const inputBaseClass = "h-12 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-[#0099f2] focus:ring-2 focus:ring-[#0099f2]/20 focus:outline-none transition-all duration-200"
  const inputStyle = { paddingLeft: 40, paddingRight: 12, paddingTop: 14, paddingBottom: 14 }
  const inputStylePassword = { paddingLeft: 40, paddingRight: 40, paddingTop: 14, paddingBottom: 14 }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <AuthHeader />

      <div className="flex-1 flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
        {/* Left - Blue Brand Panel */}
        <div className="hidden lg:flex lg:w-[40%] xl:w-[42%] relative overflow-hidden bg-[#0099f2]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0099f2] via-[#0082d9] to-[#006bb8]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_20%_80%,rgba(255,255,255,0.12),transparent)]" />
          <div className="relative z-10 flex flex-col justify-center p-8 xl:p-10 w-full">
            <div className="max-w-xs">
              <Link href={`/${lang}`} className="inline-block mb-6">
                <div className="relative w-32 h-10">
                  <Image src="/yden.png" alt="HarvestPlus by YDEN" fill className="object-contain brightness-0 invert opacity-95" priority />
                </div>
              </Link>
              <h2 className="text-2xl xl:text-3xl font-bold text-white tracking-tight mb-3 leading-tight">
                {t.hero.title}
              </h2>
              <p className="text-white/90 text-sm leading-relaxed mb-6">
                {t.hero.subtitle}
              </p>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
                    <Rocket className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm mb-0.5">{t.hero.values.innovation.title}</h3>
                    <p className="text-white/80 text-xs leading-relaxed">{t.hero.values.innovation.description}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm mb-0.5">{t.hero.values.impact.title}</h3>
                    <p className="text-white/80 text-xs leading-relaxed">{t.hero.values.impact.description}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm mb-0.5">{t.hero.values.inclusion.title}</h3>
                    <p className="text-white/80 text-xs leading-relaxed">{t.hero.values.inclusion.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right - Registration Form */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-16 bg-gradient-to-b from-slate-50 to-white overflow-y-auto">
          <div className="w-full max-w-full">
            {/* Mobile Brand */}
            <div className="lg:hidden text-center mb-8">
              <Link href={`/${lang}`} className="inline-block mb-4">
                <div className="relative w-32 h-10 mx-auto">
                  <Image src="/yden.png" alt="HarvestPlus by YDEN" fill className="object-contain" priority />
                </div>
              </Link>
              <h1 className="text-xl font-bold text-slate-900">{t.hero.title}</h1>
              <p className="text-slate-500 text-sm mt-1">{t.hero.subtitle}</p>
            </div>

            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/60 overflow-hidden ring-1 ring-slate-900/5">
              <div className="relative px-5 py-8 overflow-hidden bg-gradient-to-br from-white via-[#0099f2]/[0.03] to-[#0099f2]/[0.06]">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#0099f2] via-[#0082d9] to-[#006bb8]" />
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#0099f2]/[0.08] rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                <div className="relative flex items-start gap-4">
                  <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0099f2]/25 to-[#0099f2]/10 flex items-center justify-center ring-1 ring-[#0099f2]/20 shadow-sm">
                    <UserPlus className="h-7 w-7 text-[#0099f2]" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{t.form.title}</h2>
                    <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">{t.form.subtitle}</p>
                  </div>
                </div>
              </div>

              <div className="px-5 py-6 pt-6 border-t border-slate-100/80">
                {errorMessage && (
                  <div className="mb-5 p-4 rounded-2xl border border-red-200/80 bg-red-50/95">
                    <p className="text-sm font-medium text-red-800">{errorMessage}</p>
                  </div>
                )}

                {/* Stepper */}
                <div className="mb-6">
                  <p className="text-sm font-medium text-slate-500 mb-3">
                    {(t.form.stepper?.stepOf ?? "Step {current} of {total}")
                      .replace("{current}", String(step))
                      .replace("{total}", String(STEPS_TOTAL))}
                    {" — "}
                    {step === 1 && (t.form.stepper?.step2 ?? "Your details")}
                    {step === 2 && (t.form.stepper?.step3 ?? "Contact & password")}
                  </p>
                  <div className="flex items-center gap-1">
                    {[1, 2].map((s) => {
                      const isActive = step === s
                      const isComplete = step > s
                      return (
                        <div key={s} className="flex flex-1 items-center">
                          <div
                            className={cn(
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 font-semibold text-sm transition-all",
                              isComplete && "border-[#0099f2] bg-[#0099f2] text-white",
                              isActive && !isComplete && "border-[#0099f2] bg-[#0099f2] text-white shadow-md",
                              !isActive && !isComplete && "border-slate-200 bg-slate-100 text-slate-400"
                            )}
                          >
                            {isComplete ? <Check className="h-4 w-4" /> : s}
                          </div>
                          {s < 2 && <div className={cn("mx-0.5 h-0.5 flex-1 rounded-full", step > s ? "bg-[#0099f2]/60" : "bg-slate-200")} />}
                        </div>
                      )
                    })}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Step 1: Account type + role-specific form (shown as soon as a type is selected) */}
                  {step === 1 && (
                    <div className="space-y-5 animate-in fade-in duration-200">
                      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                        <TabsList className="grid w-full grid-cols-4 h-auto p-1.5 bg-slate-100/80 rounded-2xl gap-1">
                          <TabsTrigger value="individual" className="rounded-xl text-xs sm:text-sm font-medium text-slate-600 data-[state=active]:bg-white data-[state=active]:text-[#0099f2] data-[state=active]:shadow-md data-[state=active]:shadow-slate-200/50 transition-all duration-200 flex items-center justify-center gap-1.5 py-2.5">
                            <User className="h-4 w-4 shrink-0" />
                            <span className="truncate">{t.form.tabs.individual}</span>
                          </TabsTrigger>
                          <TabsTrigger value="cooperative" className="rounded-xl text-xs sm:text-sm font-medium text-slate-600 data-[state=active]:bg-white data-[state=active]:text-[#0099f2] data-[state=active]:shadow-md data-[state=active]:shadow-slate-200/50 transition-all duration-200 flex items-center justify-center gap-1.5 py-2.5">
                            <Users className="h-4 w-4 shrink-0" />
                            <span className="truncate">{t.form.tabs.cooperative}</span>
                          </TabsTrigger>
                          <TabsTrigger value="company" className="rounded-xl text-xs sm:text-sm font-medium text-slate-600 data-[state=active]:bg-white data-[state=active]:text-[#0099f2] data-[state=active]:shadow-md data-[state=active]:shadow-slate-200/50 transition-all duration-200 flex items-center justify-center gap-1.5 py-2.5">
                            <Building className="h-4 w-4 shrink-0" />
                            <span className="truncate">{t.form.tabs.company}</span>
                          </TabsTrigger>
                          <TabsTrigger value="ngo" className="rounded-xl text-xs sm:text-sm font-medium text-slate-600 data-[state=active]:bg-white data-[state=active]:text-[#0099f2] data-[state=active]:shadow-md data-[state=active]:shadow-slate-200/50 transition-all duration-200 flex items-center justify-center gap-1.5 py-2.5">
                            <HeartHandshake className="h-4 w-4 shrink-0" />
                            <span className="truncate">{t.form.tabs.ngo}</span>
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                      {activeTab === "individual" && (
                        <>
                          <div className="space-y-4">
                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                              <span className="w-1 h-4 rounded-full bg-[#0099f2]" />
                              {t.form.sections.personalInfo}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                              <div className="space-y-2">
                                <Label htmlFor="firstName" className="text-sm font-medium text-slate-700">{t.form.firstName.label} *</Label>
                                <div className="relative group">
                                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0099f2] transition-colors pointer-events-none z-10">
                                    <User className="h-5 w-5" strokeWidth={2} />
                                  </div>
                                  <Input id="firstName" name="firstName" type="text" placeholder={t.form.firstName.placeholder} value={formData.firstName} onChange={handleInputChange} style={inputStyle} className={inputBaseClass} />
                                </div>
                                {fieldErrors.firstName && <p className="text-sm text-red-500 mt-1">{fieldErrors.firstName}</p>}
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="lastName" className="text-sm font-medium text-slate-700">{t.form.lastName.label} *</Label>
                                <div className="relative group">
                                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0099f2] transition-colors pointer-events-none z-10">
                                    <User className="h-5 w-5" strokeWidth={2} />
                                  </div>
                                  <Input id="lastName" name="lastName" type="text" placeholder={t.form.lastName.placeholder} value={formData.lastName} onChange={handleInputChange} style={inputStyle} className={inputBaseClass} />
                                </div>
                                {fieldErrors.lastName && <p className="text-sm text-red-500 mt-1">{fieldErrors.lastName}</p>}
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-700">{t.form.gender.label}</Label>
                                <div className="flex gap-2 p-1 rounded-xl bg-slate-100/80 border border-slate-200/80" role="group" aria-label={t.form.gender.label}>
                                  {[
                                    { value: "MALE", label: "Male" },
                                    { value: "FEMALE", label: "Female" },
                                    { value: "OTHER", label: "Other" },
                                  ].map((opt) => (
                                    <label
                                      key={opt.value}
                                      className={cn(
                                        "flex-1 flex items-center justify-center rounded-lg py-2.5 text-sm font-medium cursor-pointer transition-all duration-200",
                                        formData.gender === opt.value
                                          ? "bg-white text-[#0099f2] shadow-md border border-[#0099f2]/30 ring-1 ring-[#0099f2]/20"
                                          : "text-slate-600 hover:text-slate-900 hover:bg-white/60 border border-transparent"
                                      )}
                                    >
                                      <input
                                        type="radio"
                                        name="gender"
                                        value={opt.value}
                                        checked={formData.gender === opt.value}
                                        onChange={handleInputChange}
                                        className="sr-only"
                                      />
                                      {opt.label}
                                    </label>
                                  ))}
                                </div>
                                <p className="text-xs text-slate-500">{t.form.gender.placeholder}</p>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                              <span className="w-1 h-4 rounded-full bg-[#0099f2]" />
                              {t.form.sections.identification}
                            </h3>
                            <div className="flex flex-col sm:flex-row gap-5">
                              <div className="space-y-2 flex-1 min-w-0">
                                <Label htmlFor="dateOfBirth" className="text-sm font-medium text-slate-700">{t.form.dateOfBirth.label}</Label>
                                <Input id="dateOfBirth" name="dateOfBirth" type="date" placeholder={t.form.dateOfBirth.placeholder} value={formData.dateOfBirth} onChange={handleInputChange} style={inputStyle} className={inputBaseClass} />
                              </div>
                              <div className="space-y-2 flex-1 min-w-0">
                                <Label htmlFor="nationalId" className="text-sm font-medium text-slate-700">{t.form.nationalId.label}</Label>
                                <Input id="nationalId" name="nationalId" type="text" placeholder={t.form.nationalId.placeholder} value={formData.nationalId} onChange={handleInputChange} style={inputStyle} className={inputBaseClass} />
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                      {["cooperative", "company", "ngo"].includes(activeTab) && (
                        <div className="space-y-4">
                          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-1 h-4 rounded-full bg-[#0099f2]" />
                            {activeTab === "cooperative" && t.form.sections.cooperativeInfo}
                            {activeTab === "company" && t.form.sections.companyInfo}
                            {activeTab === "ngo" && t.form.sections.ngoInfo}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                              <Label htmlFor="companyName-s2" className="text-sm font-medium text-slate-700">{t.form.companyName.label} *</Label>
                              <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0099f2] transition-colors pointer-events-none z-10">
                                  <Building className="h-5 w-5" strokeWidth={2} />
                                </div>
                                <Input id="companyName-s2" name="companyName" type="text" placeholder={t.form.companyName.placeholder} value={formData.companyName} onChange={handleInputChange} style={inputStyle} className={inputBaseClass} />
                              </div>
                              {fieldErrors.companyName && <p className="text-sm text-red-500 mt-1">{fieldErrors.companyName}</p>}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="contactName-s2" className="text-sm font-medium text-slate-700">{t.form.contactName.label} *</Label>
                              <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0099f2] transition-colors pointer-events-none z-10">
                                  <User className="h-5 w-5" strokeWidth={2} />
                                </div>
                                <Input id="contactName-s2" name="contactName" type="text" placeholder={t.form.contactName.placeholder} value={formData.contactName} onChange={handleInputChange} style={inputStyle} className={inputBaseClass} />
                              </div>
                              {fieldErrors.contactName && <p className="text-sm text-red-500 mt-1">{fieldErrors.contactName}</p>}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="tinNumber-s2" className="text-sm font-medium text-slate-700">{t.form.tinNumber.label} *</Label>
                              <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0099f2] transition-colors pointer-events-none z-10">
                                  <Hash className="h-5 w-5" strokeWidth={2} />
                                </div>
                                <Input id="tinNumber-s2" name="tinNumber" type="text" placeholder={t.form.tinNumber.placeholder} value={formData.tinNumber} onChange={handleInputChange} minLength={9} maxLength={9} style={inputStyle} className={inputBaseClass} />
                              </div>
                              {fieldErrors.tinNumber && <p className="text-sm text-red-500 mt-1">{fieldErrors.tinNumber}</p>}
                              <p className="text-xs text-slate-500">9 digits required</p>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-slate-700">{t.form.businessSize.label} *</Label>
                              <div className="flex gap-2 p-1 rounded-xl bg-slate-100/80 border border-slate-200/80" role="group" aria-label={t.form.businessSize.label}>
                                {[
                                  { value: "SMALL", label: t.form.businessSize.options.small },
                                  { value: "MEDIUM", label: t.form.businessSize.options.medium },
                                  { value: "LARGE", label: t.form.businessSize.options.large },
                                ].map((opt) => (
                                  <label
                                    key={opt.value}
                                    className={cn(
                                      "flex-1 flex items-center justify-center rounded-lg py-2.5 text-sm font-medium cursor-pointer transition-all duration-200",
                                      formData.businessSize === opt.value
                                        ? "bg-white text-[#0099f2] shadow-md border border-[#0099f2]/30 ring-1 ring-[#0099f2]/20"
                                        : "text-slate-600 hover:text-slate-900 hover:bg-white/60 border border-transparent"
                                    )}
                                  >
                                    <input
                                      type="radio"
                                      name="businessSize"
                                      value={opt.value}
                                      checked={formData.businessSize === opt.value}
                                      onChange={handleInputChange}
                                      className="sr-only"
                                    />
                                    {opt.label}
                                  </label>
                                ))}
                              </div>
                              {fieldErrors.businessSize && <p className="text-sm text-red-500 mt-1">{fieldErrors.businessSize}</p>}
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="flex justify-end pt-2">
                        <Button type="button" onClick={() => { if (validateStep(1)) setStep(2) }} className="rounded-2xl bg-gradient-to-r from-[#0099f2] to-[#0082d9] text-white shadow-lg hover:shadow-xl">
                          {t.form.buttons.next ?? "Continue"}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Contact & password */}
                  {step === 2 && (
                    <div className="space-y-5 animate-in fade-in duration-200">
                      <div className="space-y-4">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                          <span className="w-1 h-4 rounded-full bg-[#0099f2]" />
                          {t.form.sections.contact}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-slate-700">{t.form.email.label} *</Label>
                            <div className="relative group">
                              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0099f2] transition-colors pointer-events-none z-10">
                                <Mail className="h-5 w-5" strokeWidth={2} />
                              </div>
                              <Input id="email" name="email" type="email" placeholder={t.form.email.placeholder} value={formData.email} onChange={handleInputChange} style={inputStyle} className={inputBaseClass} />
                            </div>
                            {fieldErrors.email && <p className="text-sm text-red-500 mt-1">{fieldErrors.email}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone" className="text-sm font-medium text-slate-700">{t.form.phone.label} *</Label>
                            <div className="relative group">
                              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0099f2] transition-colors pointer-events-none z-10">
                                <Phone className="h-5 w-5" strokeWidth={2} />
                              </div>
                              <Input id="phone" name="phone" type="tel" placeholder={t.form.phone.placeholder} value={formData.phone} onChange={handleInputChange} style={inputStyle} className={inputBaseClass} />
                            </div>
                            {fieldErrors.phone && <p className="text-sm text-red-500 mt-1">{fieldErrors.phone}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="alternatePhone" className="text-sm font-medium text-slate-700">{t.form.alternatePhone.label}</Label>
                            <Input id="alternatePhone" name="alternatePhone" type="tel" placeholder={t.form.alternatePhone.placeholder} value={formData.alternatePhone} onChange={handleInputChange} style={inputStyle} className={inputBaseClass} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="district" className="text-sm font-medium text-slate-700">{t.form.district.label}</Label>
                            <Input id="district" name="district" type="text" placeholder={t.form.district.placeholder} value={formData.district} onChange={handleInputChange} style={inputStyle} className={inputBaseClass} />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="address" className="text-sm font-medium text-slate-700">{t.form.address.label}</Label>
                            <Input id="address" name="address" type="text" placeholder={t.form.address.placeholder} value={formData.address} onChange={handleInputChange} style={inputStyle} className={inputBaseClass} />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                          <span className="w-1 h-4 rounded-full bg-[#0099f2]" />
                          {t.form.sections.accountDetails}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium text-slate-700">{t.form.password.label}</Label>
                            <div className="relative group">
                              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0099f2] transition-colors pointer-events-none z-10">
                                <Lock className="h-5 w-5" strokeWidth={2} />
                              </div>
                              <Input id="password" name="password" type={showPassword ? "text" : "password"} placeholder={t.form.password.placeholder} value={formData.password} onChange={handleInputChange} style={inputStylePassword} className={inputBaseClass} />
                              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0099f2] p-2 rounded-lg hover:bg-slate-100 transition-colors" aria-label={showPassword ? "Hide password" : "Show password"}>
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                            {fieldErrors.password && <p className="text-sm text-red-500 mt-1">{fieldErrors.password}</p>}
                            <p className="text-xs text-slate-500">Must be at least 6 characters</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">{t.form.confirmPassword.label}</Label>
                            <div className="relative group">
                              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0099f2] transition-colors pointer-events-none z-10">
                                <Lock className="h-5 w-5" strokeWidth={2} />
                              </div>
                              <Input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder={t.form.confirmPassword.placeholder} value={formData.confirmPassword} onChange={handleInputChange} style={inputStylePassword} className={inputBaseClass} />
                              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0099f2] p-2 rounded-lg hover:bg-slate-100 transition-colors" aria-label={showConfirmPassword ? "Hide password" : "Show password"}>
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                            {fieldErrors.confirmPassword && <p className="text-sm text-red-500 mt-1">{fieldErrors.confirmPassword}</p>}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3 justify-between pt-2">
                        <Button type="button" variant="outline" onClick={() => setStep(1)} className="rounded-2xl">
                          {t.form.buttons.back ?? "Back"}
                        </Button>
                        <Button type="submit" className="rounded-2xl font-semibold text-white bg-gradient-to-r from-[#0099f2] to-[#0082d9] shadow-lg shadow-[#0099f2]/30 hover:shadow-xl hover:from-[#0082d9] hover:to-[#006bb8] transition-all duration-200" disabled={isLoading}>
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {t.form.buttons.registering || "Creating Account..."}
                            </>
                          ) : (
                            t.form.buttons.register || "Create Account"
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </form>
              </div>

              <div className="px-5 py-5 border-t border-slate-100">
                <p className="text-center text-sm text-slate-600">
                  <span>{t.form.login.text} </span>
                  <Link href={`/${lang}/login`} className="font-semibold text-[#0099f2] hover:text-[#0082d9] transition-colors">
                    {t.form.login.link}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AuthFooter />
    </div>
  )
}

export default function Register() {
  return (
    <ClientOnly fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-[#0099f2]"></div>
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    }>
      <RegisterContent />
    </ClientOnly>
  )
} 