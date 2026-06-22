"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SoromaStatusBadge } from "./status-badge"
import { Loader2 } from "lucide-react"
import type { WorkflowEntityType } from "@/lib/soroma/workflows/types"

export type WorkflowBoardItem = {
  id: string
  label: string
  status: string
  entityType: WorkflowEntityType
  actions: { action: string; label: string; permission?: string }[]
}

const TRANSITION_PATH: Record<WorkflowEntityType, string> = {
  SoromaPurchaseOrder: "purchase-orders",
  SoromaProductionBatch: "batches",
  SoromaShipment: "shipments",
  SoromaCAPA: "compliance/capas",
  SoromaOrder: "orders",
}

export function SoromaWorkflowBoard({
  tenantId,
  title,
  items,
}: {
  tenantId: string
  title: string
  items: WorkflowBoardItem[]
}) {
  const router = useRouter()
  const [loadingKey, setLoadingKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function runTransition(
    entityType: WorkflowEntityType,
    entityId: string,
    action: string
  ) {
    const key = `${entityId}:${action}`
    setLoadingKey(key)
    setError(null)
    const segment = TRANSITION_PATH[entityType]
    try {
      const res = await fetch(
        `/api/v1/soroma/tenant/${tenantId}/${segment}/${entityId}/transition`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        }
      )
      const data = await res.json()
      if (!res.ok || !data.success) {
        setError(data.error ?? "Transition failed")
        return
      }
      router.refresh()
    } catch {
      setError("Unable to complete transition")
    } finally {
      setLoadingKey(null)
    }
  }

  if (items.length === 0) {
    return (
      <div className="sf-card sf-card-elevated p-5">
        <h3 className="font-semibold text-[var(--sf-text-primary)]">{title}</h3>
        <p className="mt-2 text-sm text-[var(--sf-text-muted)]">
          No records available for workflow actions.
        </p>
      </div>
    )
  }

  return (
    <div className="sf-card sf-card-elevated p-5">
      <h3 className="mb-4 font-semibold text-[var(--sf-text-primary)]">{title}</h3>
      {error && (
        <p className="sf-inline-error mb-3 rounded-lg px-3 py-2 text-sm" role="alert">
          {error}
        </p>
      )}
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-lg border border-[var(--sf-border)] bg-[var(--sf-page-bg)] p-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-[var(--sf-text-primary)]">
                  {item.label}
                </p>
                <div className="mt-1">
                  <SoromaStatusBadge status={item.status} />
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {item.actions.length === 0 ? (
                  <span className="text-xs text-[var(--sf-text-muted)]">No actions</span>
                ) : (
                  item.actions.map((a) => {
                    const key = `${item.id}:${a.action}`
                    const loading = loadingKey === key
                    return (
                      <Button
                        key={a.action}
                        size="sm"
                        variant={a.action === "approve" ? "default" : "outline"}
                        className={a.action === "approve" ? "sf-btn-primary h-8 border-0 text-xs" : "h-8 text-xs"}
                        disabled={!!loadingKey}
                        onClick={() =>
                          runTransition(item.entityType, item.id, a.action)
                        }
                      >
                        {loading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          a.label
                        )}
                      </Button>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
