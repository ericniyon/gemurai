"use client"

import { SoromaErrorState } from "@/components/soroma/error-state"

export default function SoromaError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="soroma-app flex min-h-[60vh] items-center justify-center p-6">
      <SoromaErrorState
        title="Workspace error"
        description="We could not render this SOROMA workspace section. Try again, or return to overview."
        detail={error.message}
        onRetry={reset}
        fallbackHref="/soroma"
        fallbackLabel="Go to workspace home"
      />
    </div>
  )
}
