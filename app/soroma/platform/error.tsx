"use client"

import { SoromaErrorState } from "@/components/soroma/error-state"

export default function SoromaPlatformError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <SoromaErrorState
      title="Platform module unavailable"
      description="This platform page failed to load. Retry to continue."
      detail={error.message}
      onRetry={reset}
      fallbackHref="/soroma/platform/overview"
      fallbackLabel="Open overview"
    />
  )
}
