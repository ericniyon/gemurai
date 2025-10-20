"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function FormSubmissionTestRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.push("/test-form-submission")
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Redirecting to form submission test...</p>
      </div>
    </div>
  )
}
