import { cn } from "@/lib/utils"

export function SoromaPageHeader({
  title,
  description,
  moduleTag,
  tenantName,
  actions,
  className,
}: {
  title: string
  description?: string
  moduleTag?: string
  tenantName?: string
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
    >
      <div className="min-w-0">
        {moduleTag && (
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--sf-green-700)]">
            {moduleTag}
          </p>
        )}
        <div className="flex flex-wrap items-baseline gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--sf-text-primary)] sm:text-[1.65rem]">
            {title}
          </h1>
          {tenantName && (
            <span className="text-sm font-semibold text-[var(--sf-green-700)]">
              · {tenantName}
            </span>
          )}
        </div>
        {description && (
          <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-[var(--sf-text-muted)]">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  )
}
