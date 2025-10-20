"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSessionTimeRemaining, updateSessionActivity, hasActiveSession } from "@/lib/session-manager"
import { ClientOnly } from "@/components/client-only"

interface SessionTimerProps {
  applicationId: string
  redirectPath?: string
}

export function SessionTimer({
  applicationId,
  redirectPath = "/application",
}: SessionTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [formattedTime, setFormattedTime] = useState<string>("00:00")
  const router = useRouter()

  useEffect(() => {
    // Initial check
    if (!hasActiveSession()) {
      router.push(redirectPath)
      return
    }

    // Update session activity
    updateSessionActivity(applicationId)

    // Set initial time
    const initialTime = getSessionTimeRemaining()
    setTimeRemaining(initialTime)
    setFormattedTime(formatTime(initialTime))

    // Set up interval to update time
    const interval = setInterval(() => {
      const remaining = getSessionTimeRemaining()

      if (remaining <= 0) {
        clearInterval(interval)
        router.push(redirectPath)
        return
      }

      setTimeRemaining(remaining)
      setFormattedTime(formatTime(remaining))
    }, 1000)

    // Set up activity listener
    const activityHandler = () => {
      updateSessionActivity(applicationId)
    }

    // Add event listeners
    window.addEventListener("click", activityHandler)
    window.addEventListener("keypress", activityHandler)
    window.addEventListener("scroll", activityHandler)
    window.addEventListener("mousemove", activityHandler)

    // Clean up
    return () => {
      clearInterval(interval)
      window.removeEventListener("click", activityHandler)
      window.removeEventListener("keypress", activityHandler)
      window.removeEventListener("scroll", activityHandler)
      window.removeEventListener("mousemove", activityHandler)
    }
  }, [applicationId, redirectPath, router])

  // Format time as MM:SS
  function formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <ClientOnly>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Session expires in:</span>
        <span className={`font-mono font-medium ${timeRemaining < 300000 ? "text-red-500" : "text-green-500"}`}>
          {formattedTime}
        </span>
      </div>
    </ClientOnly>
  )
}
