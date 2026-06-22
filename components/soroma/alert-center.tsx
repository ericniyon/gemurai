"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SoromaStatusBadge } from "./status-badge"

type AlertItem = {
  id: string
  title: string
  type: string
  severity: string
  status: string
  tenantId?: string | null
  tenantName?: string | null
  metadata?: {
    escalationLevel?: number
    slaDueAt?: string
  } | null
}

export function SoromaAlertCenter({
  alerts,
  title = "Alert Center",
  runRulesPath,
}: {
  alerts: AlertItem[]
  title?: string
  runRulesPath?: string
}) {
  const [items, setItems] = useState(alerts)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [comment, setComment] = useState("")
  const [evidenceUrl, setEvidenceUrl] = useState("")
  const [error, setError] = useState<string | null>(null)

  async function call(path: string, body?: unknown) {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    })
    const data = await res.json()
    if (!res.ok || !data.success) {
      throw new Error(data.error ?? "Request failed")
    }
    return data.data
  }

  async function updateAlert(
    alert: AlertItem,
    action: "in_progress" | "resolve" | "reopen" | "escalate"
  ) {
    setLoadingId(alert.id)
    setError(null)
    try {
      const updated = await call(`/api/v1/soroma/alerts/${alert.id}/actions`, {
        action,
      })
      setItems((prev) => prev.map((a) => (a.id === alert.id ? { ...a, ...updated } : a)))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update alert")
    } finally {
      setLoadingId(null)
    }
  }

  async function submitComment(alert: AlertItem) {
    if (!comment.trim()) return
    setLoadingId(alert.id)
    setError(null)
    try {
      await call(`/api/v1/soroma/alerts/${alert.id}/comments`, { comment })
      setComment("")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add comment")
    } finally {
      setLoadingId(null)
    }
  }

  async function submitEvidence(alert: AlertItem) {
    if (!evidenceUrl.trim()) return
    setLoadingId(alert.id)
    setError(null)
    try {
      await call(`/api/v1/soroma/alerts/${alert.id}/evidence`, {
        label: "Evidence Link",
        url: evidenceUrl,
      })
      setEvidenceUrl("")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add evidence")
    } finally {
      setLoadingId(null)
    }
  }

  async function runRules() {
    if (!runRulesPath) return
    setError(null)
    try {
      await call(runRulesPath)
      window.location.reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to run rules")
    }
  }

  return (
    <div className="sf-card sf-card-elevated p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-[var(--sf-text-primary)]">{title}</h3>
        {runRulesPath && (
          <Button size="sm" variant="outline" onClick={runRules}>
            Run Alert Rules
          </Button>
        )}
      </div>
      {error && (
        <p className="sf-inline-error mb-3 rounded-lg px-3 py-2 text-sm">
          {error}
        </p>
      )}
      <div className="space-y-3">
        {items.length === 0 && (
          <p className="text-sm text-[var(--sf-text-muted)]">No alerts available.</p>
        )}
        {items.map((alert) => (
          <div
            key={alert.id}
            className="rounded-lg border border-[var(--sf-border)] bg-[var(--sf-page-bg)] p-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium text-[var(--sf-text-primary)]">{alert.title}</p>
              <SoromaStatusBadge status={alert.severity} />
              <SoromaStatusBadge status={alert.status} />
              {alert.tenantName ? (
                <span className="text-xs text-[var(--sf-text-muted)]">{alert.tenantName}</span>
              ) : null}
              <span className="ml-auto text-xs text-[var(--sf-text-muted)]">{alert.type}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Button
                size="sm"
                variant="outline"
                disabled={loadingId === alert.id}
                onClick={() => updateAlert(alert, "in_progress")}
              >
                In Progress
              </Button>
              <Button
                size="sm"
                className="sf-btn-primary border-0"
                disabled={loadingId === alert.id}
                onClick={() => updateAlert(alert, "resolve")}
              >
                Resolve
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={loadingId === alert.id}
                onClick={() => updateAlert(alert, "reopen")}
              >
                Reopen
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={loadingId === alert.id}
                onClick={() => updateAlert(alert, "escalate")}
              >
                Escalate
              </Button>
            </div>
            <div className="mt-2 grid gap-2 md:grid-cols-2">
              <div className="flex gap-2">
                <Input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add comment"
                  className="h-8"
                />
                <Button size="sm" variant="outline" onClick={() => submitComment(alert)}>
                  Comment
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  placeholder="Evidence URL"
                  className="h-8"
                />
                <Button size="sm" variant="outline" onClick={() => submitEvidence(alert)}>
                  Evidence
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
