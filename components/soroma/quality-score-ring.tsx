"use client"

import { cn } from "@/lib/utils"

function parseScore(value: unknown): number | null {
  if (value == null || value === "—") return null
  const n = parseInt(String(value).replace(/[^\d]/g, ""), 10)
  return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : null
}

export function SoromaQualityScoreRing({
  value,
  size = 36,
  className,
}: {
  value: unknown
  size?: number
  className?: string
}) {
  const score = parseScore(value)
  const stroke = 3
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = score != null ? circumference - (score / 100) * circumference : circumference

  const color =
    score == null
      ? "var(--sf-text-muted)"
      : score >= 85
        ? "var(--sf-green-600)"
        : score >= 70
          ? "var(--sf-amber-500)"
          : "var(--sf-red-600)"

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--sf-border)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="text-xs font-semibold tabular-nums text-[var(--sf-text-primary)]">
        {score != null ? `${score}%` : "—"}
      </span>
    </div>
  )
}

export function SoromaSupplierAvatar({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")

  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
        style={{ background: "var(--sf-green-700)" }}
        aria-hidden
      >
        {initials || "?"}
      </div>
      <span className="truncate font-medium text-[var(--sf-text-primary)]">{name}</span>
    </div>
  )
}
