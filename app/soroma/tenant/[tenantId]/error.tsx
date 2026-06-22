"use client"

import { SoromaErrorState } from "@/components/soroma/error-state"

export default function SoromaTenantError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <SoromaErrorState
      title="Tenant module unavailable"
      description="This tenant page failed to load. Retry to continue."
      detail={error.message}
      onRetry={reset}
    />
  )
}
