"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function SessionExpiredPage() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (isClient) {
      // Redirect to the application page with the expired parameter
      router.push("/application?expired=true")
    }
  }, [router, isClient])

  if (!isClient) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  )
} 