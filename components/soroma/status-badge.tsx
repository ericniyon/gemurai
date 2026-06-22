import { cn } from "@/lib/utils"
import { getStatusSeverity, STATUS_BADGE_CLASSES } from "@/lib/soroma/status"

export function SoromaStatusBadge({
  status,
  label,
  className,
}: {
  status: string
  label?: string
  className?: string
}) {
  const severity = getStatusSeverity(status)
  const display = label ?? status.replace(/_/g, " ")
  return (
    <span
      className={cn(
        "sf-badge",
        STATUS_BADGE_CLASSES[severity],
        className
      )}
    >
      <span
        className={cn(
          "mr-1.5 h-1.5 w-1.5 rounded-full shrink-0",
          severity === "success" && "bg-[var(--sf-green-600)]",
          severity === "warning" && "bg-[var(--sf-amber-500)]",
          severity === "critical" && "bg-[var(--sf-red-600)]",
          severity === "info" && "bg-[var(--sf-blue-600)]",
          severity === "neutral" && "bg-[var(--sf-text-muted)]"
        )}
      />
      {display}
    </span>
  )
}
