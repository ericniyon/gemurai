import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  KPI_SEVERITY_ICON_CLASSES,
  type StatusSeverity,
} from "@/lib/soroma/status"
import { formatSoromaDelta } from "@/lib/soroma/formatters"
import { TrendingDown, TrendingUp, Minus } from "lucide-react"

// Generate a deterministic sparkline path based on the title and trend direction
function getSparklinePath(title: string, direction: "up" | "down" | "flat"): string {
  const seed = title.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const points: string[] = []
  const count = 7
  for (let i = 0; i < count; i++) {
    const x = (i / (count - 1)) * 70
    // Generate deterministic wave
    let y = 15 + Math.sin(seed + i) * 6
    // Add trend direction slope
    if (direction === "up") {
      y -= (i - count / 2) * 2
    } else if (direction === "down") {
      y += (i - count / 2) * 2
    }
    // Clamp between margins
    y = Math.max(4, Math.min(26, y))
    points.push(`${x},${y}`)
  }
  return `M ${points.join(" L ")}`
}

export function SoromaKpiCard({
  title,
  value,
  subtitle,
  delta,
  severity = "success",
  icon: Icon,
  drilldownUrl,
  loading,
  className,
}: {
  title: string
  value: string
  subtitle?: string
  delta?: number
  severity?: StatusSeverity
  icon?: React.ComponentType<{ className?: string }>
  drilldownUrl?: string
  loading?: boolean
  className?: string
}) {
  const deltaInfo = delta !== undefined ? formatSoromaDelta(delta) : null
  const trendDir = deltaInfo ? deltaInfo.direction : "flat"
  const sparkPath = getSparklinePath(title, trendDir)

  const content = (
    <div
      className={cn(
        "sf-card sf-card-elevated h-full p-4 flex flex-col justify-between transition-all hover:-translate-y-0.5",
        className
      )}
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <p
            className="text-[11px] font-bold uppercase tracking-wider text-[var(--sf-text-muted)]"
          >
            {title}
          </p>
          {Icon && (
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-sm",
                KPI_SEVERITY_ICON_CLASSES[severity]
              )}
              aria-hidden
            >
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>

        {loading ? (
          <div
            className="mt-2 h-7 w-24 animate-pulse rounded"
            style={{ background: "var(--sf-border)" }}
          />
        ) : (
          <p
            className="mt-1 text-2xl font-bold tracking-tight text-[var(--sf-text-primary)] kpi-card-metric"
          >
            {value}
          </p>
        )}

        {subtitle && (
          <p className="mt-0.5 text-xs text-[var(--sf-text-muted)]">
            {subtitle}
          </p>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-[var(--sf-border)] pt-2.5">
        {deltaInfo ? (
          <div
            className={cn(
              "flex items-center gap-1 text-[11px] font-semibold",
              trendDir === "up" && "text-[var(--sf-green-700)]",
              trendDir === "down" && "text-[var(--sf-red-600)]",
              trendDir === "flat" && "text-[var(--sf-text-muted)]"
            )}
          >
            {trendDir === "up" && <TrendingUp className="h-3 w-3 shrink-0" />}
            {trendDir === "down" && <TrendingDown className="h-3 w-3 shrink-0" />}
            {trendDir === "flat" && <Minus className="h-3 w-3 shrink-0" />}
            <span>{deltaInfo.label}</span>
          </div>
        ) : (
          <span className="text-[10px] font-medium text-[var(--sf-text-muted)]">Stable operational status</span>
        )}

        {/* Micro Sparkline Chart */}
        <svg
          className={cn(
            "h-5 w-16 shrink-0 opacity-80",
            trendDir === "up" && "text-[var(--sf-green-600)]",
            trendDir === "down" && "text-[var(--sf-red-600)]",
            trendDir === "flat" && "text-[var(--sf-text-muted)]"
          )}
          viewBox="0 0 70 30"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d={sparkPath} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  )

  if (drilldownUrl) {
    return (
      <Link href={drilldownUrl} className="block h-full">
        {content}
      </Link>
    )
  }
  return content
}
