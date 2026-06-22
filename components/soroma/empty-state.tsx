"use client"

import type { LucideIcon } from "lucide-react"
import { Inbox } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SoromaEmptyState({
  title = "No data available",
  description = "No records match the selected filters yet.",
  actionLabel,
  onAction,
  icon: Icon = Inbox,
}: {
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  icon?: LucideIcon
}) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center rounded-[var(--sf-radius)] border border-dashed border-[var(--sf-border)] bg-[var(--sf-surface)] px-6 py-10 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--sf-green-100)]">
        <Icon className="h-5 w-5 text-[var(--sf-green-700)]" aria-hidden />
      </div>
      <p className="text-sm font-semibold text-[var(--sf-text-primary)]">{title}</p>
      <p className="mt-1 max-w-md text-sm text-[var(--sf-text-muted)]">{description}</p>
      {actionLabel && onAction ? (
        <Button className="mt-4 h-9" variant="outline" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
