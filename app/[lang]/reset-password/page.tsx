"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter, useParams } from "next/navigation"
import { ClientOnly } from "@/components/client-only"

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const params = useParams()
  const lang = (params?.lang as string) || "en"

  useEffect(() => {
    // Check for phone-based OTP verification flow
    const phone = searchParams?.get("phone")
    const verified = searchParams?.get("verified")
    
    if (phone && verified === "true") {
      // Redirect to set-password page for phone-based reset
      router.replace(`/${lang}/set-password?phone=${encodeURIComponent(phone)}&verified=true`)
    } else {
      // Check for email-based flow
      const email = searchParams?.get("email")
      const token = searchParams?.get("token")

      if (email && token) {
        router.replace(`/${lang}/set-password?token=${token}&email=${encodeURIComponent(email)}`)
      } else if (token) {
        // If only token is provided, redirect to forgot password with a message
        router.replace(`/${lang}/forgot-password?error=invalid-link`)
      } else {
        router.replace(`/${lang}/forgot-password`)
      }
    }
  }, [searchParams, router, lang])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  )
}

export default function ResetPassword() {
  return (
    <ClientOnly fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </ClientOnly>
  )
} 