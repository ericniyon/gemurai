"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SoromaStatusBadge } from "./status-badge"

type ConnectionItem = {
  id: string
  connectorName: string
  tenantName?: string
  status: string
  successRate?: number | null
  lastSyncAt?: string | null
}

type JobItem = {
  id: string
  status: string
  jobType: string
  connectorName?: string
  tenantName?: string
  errorMessage?: string | null
  createdAt?: string | null
}

export function SoromaIntegrationSyncCenter({
  mode,
  tenantId,
  connections,
  jobs,
}: {
  mode: "platform" | "tenant"
  tenantId?: string
  connections: ConnectionItem[]
  jobs: JobItem[]
}) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
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

  async function triggerSync(connectionId: string) {
    if (!tenantId) return
    setBusy(connectionId)
    setError(null)
    try {
      await call(
        `/api/v1/soroma/tenant/${tenantId}/integrations/connections/${connectionId}/sync`,
        { jobType: "MANUAL_SYNC" }
      )
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sync failed")
    } finally {
      setBusy(null)
    }
  }

  async function retryJob(jobId: string) {
    setBusy(jobId)
    setError(null)
    try {
      await call(`/api/v1/soroma/integrations/jobs/${jobId}/retry`, {
        reason: "Manual retry requested",
      })
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Retry failed")
    } finally {
      setBusy(null)
    }
  }

  async function runQueue() {
    setBusy("queue")
    setError(null)
    try {
      await call("/api/v1/soroma/integrations/sync-jobs")
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Queue run failed")
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="sf-card sf-card-elevated p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-[var(--sf-text-primary)]">
          Sync Orchestration Center
        </h3>
        {mode === "platform" && (
          <Button size="sm" variant="outline" onClick={runQueue} disabled={busy === "queue"}>
            Process Queue
          </Button>
        )}
      </div>

      {error && (
        <p className="sf-inline-error mb-3 rounded-lg px-3 py-2 text-sm">
          {error}
        </p>
      )}

      <div className="space-y-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--sf-text-muted)]">
            Connections
          </p>
          <div className="space-y-2">
            {connections.length === 0 && (
              <p className="text-sm text-[var(--sf-text-muted)]">No connections configured.</p>
            )}
            {connections.map((connection) => (
              <div
                key={connection.id}
                className="rounded-lg border border-[var(--sf-border)] bg-[var(--sf-page-bg)] p-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-[var(--sf-text-primary)]">
                    {connection.connectorName}
                    {connection.tenantName ? ` · ${connection.tenantName}` : ""}
                  </p>
                  <SoromaStatusBadge status={connection.status} />
                  <span className="ml-auto text-xs text-[var(--sf-text-muted)]">
                    {connection.successRate != null
                      ? `${connection.successRate}%`
                      : "No success rate"}
                  </span>
                </div>
                {tenantId && (
                  <div className="mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy === connection.id}
                      onClick={() => triggerSync(connection.id)}
                    >
                      Trigger Sync
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--sf-text-muted)]">
            Sync Jobs (Recent)
          </p>
          <div className="space-y-2">
            {jobs.length === 0 && (
              <p className="text-sm text-[var(--sf-text-muted)]">No sync jobs yet.</p>
            )}
            {jobs.slice(0, 12).map((job) => (
              <div
                key={job.id}
                className="sf-surface-soft rounded-lg border border-[var(--sf-border)] p-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-[var(--sf-text-primary)]">
                    {job.jobType}
                    {job.connectorName ? ` · ${job.connectorName}` : ""}
                    {job.tenantName ? ` · ${job.tenantName}` : ""}
                  </p>
                  <SoromaStatusBadge status={job.status} />
                  <span className="ml-auto text-xs text-[var(--sf-text-muted)]">
                    {job.createdAt ? new Date(job.createdAt).toLocaleString() : ""}
                  </span>
                </div>
                {job.errorMessage && (
                  <p className="mt-1 text-xs text-[var(--sf-danger-text)]">{job.errorMessage}</p>
                )}
                {job.status === "FAILED" && (
                  <div className="mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy === job.id}
                      onClick={() => retryJob(job.id)}
                    >
                      Retry
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
