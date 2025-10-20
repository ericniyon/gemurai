"use client"

import { useState, useEffect } from "react"

export function useDatabaseStatus() {
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [isChecking, setIsChecking] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  const checkConnection = async () => {
    setIsChecking(true)
    try {
      const response = await fetch("/api/test/database/connection", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Database connection failed")
      }

      const data = await response.json()
      setIsConnected(data.connected)
      setError(data.connected ? null : "Database connection failed")
      setLastChecked(new Date())
    } catch (err: any) {
      setIsConnected(false)
      setError(err.message || "Failed to check database connection")
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    // Check connection on mount
    checkConnection()

    // Set up interval to check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000)

    return () => clearInterval(interval)
  }, [])

  return {
    isConnected,
    isChecking,
    error,
    lastChecked,
    checkConnection,
  }
}
