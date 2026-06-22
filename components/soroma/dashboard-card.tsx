import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

export function SoromaDashboardCard({
  title,
  description,
  actions,
  children,
  loading,
  emptyState,
  className,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
  children?: React.ReactNode
  loading?: boolean
  emptyState?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("sf-card sf-card-elevated h-full overflow-hidden", className)}>
      <div
        className="flex items-center justify-between gap-3 border-b px-5 py-4"
        style={{ borderColor: "var(--sf-border)" }}
      >
        <div className="min-w-0">
          <h3
            className="font-semibold leading-tight"
            style={{ color: "var(--sf-text-primary)" }}
          >
            {title}
          </h3>
          {description && (
            <p className="mt-0.5 text-sm" style={{ color: "var(--sf-text-muted)" }}>
              {description}
            </p>
          )}
        </div>
        {actions}
      </div>
      <div className="p-5">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : emptyState ? (
          emptyState
        ) : (
          children
        )}
      </div>
    </div>
  )
}
