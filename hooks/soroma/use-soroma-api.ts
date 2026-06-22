"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"

type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string }

async function parseApiResponse<T>(res: Response): Promise<ApiResult<T>> {
  const json = await res.json().catch(() => ({}))
  if (!res.ok || !json.success) {
    return { ok: false, error: json.error || "Request failed" }
  }
  return { ok: true, data: json.data as T }
}

export function useSoromaApi(tenantId?: string) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const base = tenantId ? `/api/v1/soroma/tenant/${tenantId}` : "/api/v1/soroma"

  const request = useCallback(
    async <T>(
      path: string,
      init?: RequestInit & { platform?: boolean }
    ): Promise<ApiResult<T>> => {
      setLoading(true)
      setError(null)
      try {
        const url = init?.platform ? `/api/v1/soroma${path}` : `${base}${path}`
        const res = await fetch(url, {
          ...init,
          headers: {
            "Content-Type": "application/json",
            ...init?.headers,
          },
        })
        const result = await parseApiResponse<T>(res)
        if (!result.ok) setError(result.error)
        return result
      } catch {
        const msg = "Network error"
        setError(msg)
        return { ok: false, error: msg }
      } finally {
        setLoading(false)
      }
    },
    [base]
  )

  const refresh = useCallback(() => router.refresh(), [router])

  const exportCsv = useCallback(
    (rows: Record<string, unknown>[], filename: string) => {
      if (rows.length === 0) return
      const headers = Object.keys(rows[0])
      const csv = [
        headers.join(","),
        ...rows.map((row) =>
          headers
            .map((h) => {
              const val = row[h]
              const str = val == null ? "" : String(val)
              return str.includes(",") ? `"${str.replace(/"/g, '""')}"` : str
            })
            .join(",")
        ),
      ].join("\n")
      const blob = new Blob([csv], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    },
    []
  )

  return { request, loading, error, refresh, exportCsv, setError }
}
