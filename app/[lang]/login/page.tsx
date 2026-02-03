"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams, useParams } from "next/navigation"
import Image from "next/image"
import { Loader2, Shield, Eye, EyeOff, Lock, Mail, Phone, Building, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AuthHeader } from "@/components/auth-header"
import { AuthFooter } from "@/components/auth-footer"
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
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const identifier = loginMethod === "email" ? formData.email : formData.phone
      
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

      if (loginMethod === "email" && !isValidEmail(identifier)) {
        setError(t.form.errors.invalidEmail)
        setIsLoading(false)
        return
      }

      if (loginMethod === "phone" && !isValidPhone(identifier)) {
        setError(t.form.errors.invalidPhone)
        setIsLoading(false)
        return
      }

      const result = await login(identifier, formData.password)
      
      if (result.success) {
        const redirect = searchParams?.get("redirect") || `/${lang}/dashboard`
        if (window.location.pathname !== redirect) {
          router.replace(redirect)
        }
      } else {
        setError(result.message || t.form.errors.invalidCredentials)
      }
    } catch (error) {
      setError(t.form.errors.serverError)
    } finally {
      setIsLoading(false)
    }
  }

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,}$/
    return phoneRegex.test(phone)
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <AuthHeader />

      <div className="flex-1 flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
        {/* Left - Blue Brand Panel */}
        <div className="hidden lg:flex lg:w-[42%] xl:w-[45%] relative overflow-hidden bg-[#0099f2]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0099f2] via-[#0082d9] to-[#006bb8]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_20%_80%,rgba(255,255,255,0.12),transparent)]" />
          <div className="relative z-10 flex flex-col justify-center p-12 xl:p-20 w-full">
            <div className="max-w-md">
              <Link href={`/${lang}`} className="inline-block mb-12">
                <div className="relative w-40 h-12">
                  <Image
                    src="/yden.png"
                    alt="HarvestPlus by YDEN"
                    fill
                    className="object-contain brightness-0 invert opacity-95"
                    priority
                  />
                </div>
              </Link>
              <h2 className="text-3xl xl:text-4xl font-bold text-white tracking-tight mb-4 leading-tight">
                {t.welcome.title}
              </h2>
              <p className="text-white/90 text-lg leading-relaxed mb-12">
                {t.welcome.subtitle}
              </p>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">{t.mission.title}</h3>
                    <p className="text-white/80 text-sm leading-relaxed">{t.mission.content}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">{t.vision.title}</h3>
                    <p className="text-white/80 text-sm leading-relaxed">{t.vision.content}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-6 mt-12 pt-8 border-t border-white/25">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{t.features.learn.title}</p>
                    <p className="text-white/70 text-xs">{t.features.learn.subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <Building className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{t.features.earn.title}</p>
                    <p className="text-white/70 text-xs">{t.features.earn.subtitle}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right - Login Form */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-16 bg-gradient-to-b from-slate-50 to-white">
          <div className="w-full max-w-[420px]">
            {/* Mobile Brand */}
            <div className="lg:hidden text-center mb-8">
              <Link href={`/${lang}`} className="inline-block mb-4">
                <div className="relative w-32 h-10 mx-auto">
                  <Image src="/yden.png" alt="HarvestPlus by YDEN" fill className="object-contain" priority />
                </div>
              </Link>
              <h1 className="text-xl font-bold text-slate-900">{t.welcome.title}</h1>
              <p className="text-slate-500 text-sm mt-1">{t.welcome.subtitle}</p>
            </div>

            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/60 overflow-hidden ring-1 ring-slate-900/5">
              <div className="relative px-8 py-7 overflow-hidden bg-gradient-to-br from-white via-[#0099f2]/[0.02] to-[#0099f2]/[0.04]">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#0099f2] via-[#0082d9] to-[#006bb8]" />
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#0099f2]/[0.06] rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                <div className="relative flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0099f2]/20 to-[#0099f2]/5 flex items-center justify-center ring-1 ring-[#0099f2]/15 shadow-sm">
                    <Lock className="h-5 w-5 text-[#0099f2]" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{t.form.title}</h2>
                    <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">{t.form.subtitle}</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-8 pt-6 space-y-5 border-t border-slate-100/80">
                {error && (
                  <Alert variant="destructive" className="rounded-2xl border-red-200/80 bg-red-50/95">
                    <AlertDescription className="text-sm font-medium">{error}</AlertDescription>
                  </Alert>
                )}

                <div>
                  <Tabs value={loginMethod} onValueChange={(value) => setLoginMethod(value as "email" | "phone")}>
                    <TabsList className="grid w-full grid-cols-2 h-11 p-1 bg-slate-100/80 rounded-2xl">
                      <TabsTrigger
                        value="email"
                        className="rounded-xl text-sm font-medium text-slate-600 data-[state=active]:bg-white data-[state=active]:text-[#0099f2] data-[state=active]:shadow-md data-[state=active]:shadow-slate-200/50 data-[state=active]:border-0 transition-all duration-200"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        {t.form.loginMethod.email}
                      </TabsTrigger>
                      <TabsTrigger
                        value="phone"
                        className="rounded-xl text-sm font-medium text-slate-600 data-[state=active]:bg-white data-[state=active]:text-[#0099f2] data-[state=active]:shadow-md data-[state=active]:shadow-slate-200/50 data-[state=active]:border-0 transition-all duration-200"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        {t.form.loginMethod.phone}
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={loginMethod} className="text-sm font-medium text-slate-700">
                    {loginMethod === "email" ? t.form.email.label : t.form.phone.label}
                  </Label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0099f2] transition-colors pointer-events-none z-10">
                      {loginMethod === "email" ? (
                        <Mail className="h-5 w-5" strokeWidth={2} />
                      ) : (
                        <Phone className="h-5 w-5" strokeWidth={2} />
                      )}
                    </div>
                    <Input
                      id={loginMethod}
                      name={loginMethod}
                      type={loginMethod === "email" ? "email" : "tel"}
                      placeholder={loginMethod === "email" ? t.form.email.placeholder : t.form.phone.placeholder}
                      value={loginMethod === "email" ? formData.email : formData.phone}
                      onChange={handleInputChange}
                      autoComplete={loginMethod === "email" ? "email" : "tel"}
                      style={{ paddingLeft: 48, paddingRight: 20, paddingTop: 14, paddingBottom: 14 }}
                      className="h-12 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-[#0099f2] focus:ring-2 focus:ring-[#0099f2]/20 focus:outline-none transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                      {t.form.password.label}
                    </Label>
                    <Link
                      href={`/${lang}/forgot-password`}
                      className="text-xs font-medium text-[#0099f2] hover:text-[#0082d9] transition-colors"
                    >
                      {t.form.buttons.forgotPassword}
                    </Link>
                  </div>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0099f2] transition-colors pointer-events-none z-10">
                      <Lock className="h-5 w-5" strokeWidth={2} />
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t.form.password.placeholder}
                      value={formData.password}
                      onChange={handleInputChange}
                      autoComplete="current-password"
                      style={{ paddingLeft: 48, paddingRight: 48, paddingTop: 14, paddingBottom: 14 }}
                      className="h-12 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-[#0099f2] focus:ring-2 focus:ring-[#0099f2]/20 focus:outline-none transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0099f2] p-2 rounded-lg hover:bg-slate-100 transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-2xl font-semibold text-white bg-gradient-to-r from-[#0099f2] to-[#0082d9] shadow-lg shadow-[#0099f2]/30 hover:shadow-xl hover:shadow-[#0099f2]/40 hover:from-[#0082d9] hover:to-[#006bb8] transition-all duration-200"
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
              </form>

              <div className="px-8 py-5 border-t border-slate-100">
                <p className="text-center text-sm text-slate-600">
                  <span>{t.form.buttons.noAccount} </span>
                  <Link
                    href={`/${lang}/register`}
                    className="font-semibold text-[#0099f2] hover:text-[#0082d9] transition-colors"
                  >
                    {t.form.buttons.register}
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

export default function Login() {
  return (
    <ClientOnly fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-[#0099f2]"></div>
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </ClientOnly>
  )
}
