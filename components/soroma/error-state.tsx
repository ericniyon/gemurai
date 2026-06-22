"use client"

import { Button } from "@/components/ui/button"

export function SoromaErrorState({
  title,
  description,
  detail,
  retryLabel = "Retry",
  onRetry,
  fallbackHref,
  fallbackLabel,
}: {
  title: string
  description: string
  detail?: string
  retryLabel?: string
  onRetry?: () => void
  fallbackHref?: string
  fallbackLabel?: string
}) {
  return (
    <div className="sf-card sf-card-elevated mx-auto max-w-xl space-y-4 p-8 text-center">
      <h2 className="text-xl font-semibold text-[var(--sf-text-primary)]">{title}</h2>
      <p className="text-sm text-[var(--sf-text-muted)]">{description}</p>
      {detail ? <p className="text-xs text-[var(--sf-text-muted)]/80">{detail}</p> : null}
      <div className="flex items-center justify-center gap-2">
        {onRetry ? (
          <Button variant="outline" onClick={onRetry}>
            {retryLabel}
          </Button>
        ) : null}
        {fallbackHref && fallbackLabel ? (
          <Button onClick={() => (window.location.href = fallbackHref)}>{fallbackLabel}</Button>
        ) : null}
      </div>
    </div>
  )
}
