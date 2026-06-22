"use client"

import { SoromaDashboardCard } from "./dashboard-card"

export type SoromaMapPoint = {
  id: string
  label: string
  value: number
  status?: string
  /** Optional normalized x/y (0–100) for dot placement on Rwanda map */
  x?: number
  y?: number
}

/** Approximate district positions on a simplified Rwanda silhouette (handoff map style) */
const DISTRICT_COORDS: Record<string, { x: number; y: number }> = {
  gakenke: { x: 42, y: 28 },
  rulindo: { x: 48, y: 32 },
  musanze: { x: 38, y: 22 },
  nyabihu: { x: 32, y: 30 },
  rubavu: { x: 22, y: 32 },
  nyamasheke: { x: 18, y: 48 },
  rusizi: { x: 22, y: 58 },
  nyamagabe: { x: 38, y: 52 },
  huye: { x: 48, y: 48 },
  nyaruguru: { x: 52, y: 58 },
  muhanga: { x: 52, y: 42 },
  kamonyi: { x: 58, y: 46 },
  nyamagabe2: { x: 44, y: 54 },
  kigali: { x: 62, y: 38 },
  gasabo: { x: 64, y: 36 },
  kicukiro: { x: 63, y: 40 },
  nyarugenge: { x: 61, y: 39 },
  rwamagana: { x: 72, y: 40 },
  kayonza: { x: 78, y: 36 },
  ngoma: { x: 82, y: 44 },
  kirehe: { x: 86, y: 48 },
  bugesera: { x: 68, y: 46 },
  gisagara: { x: 54, y: 54 },
  nyanza: { x: 50, y: 50 },
  ruhango: { x: 54, y: 46 },
  karongi: { x: 28, y: 42 },
  rutsiro: { x: 34, y: 38 },
  unknown: { x: 55, y: 45 },
}

function resolveCoords(label: string, index: number, total: number) {
  const key = label.toLowerCase().replace(/\s+/g, "")
  const match = Object.entries(DISTRICT_COORDS).find(([k]) => key.includes(k) || k.includes(key.slice(0, 4)))
  if (match) return match[1]
  const angle = (index / Math.max(total, 1)) * Math.PI * 2
  return { x: 50 + Math.cos(angle) * 18, y: 45 + Math.sin(angle) * 15 }
}

function RwandaSilhouette() {
  return (
    <path
      d="M 28 18 C 22 22, 18 32, 20 42 C 18 52, 22 62, 32 68 C 42 72, 52 70, 58 64 C 68 58, 78 52, 82 42 C 86 32, 82 22, 72 18 C 62 14, 48 14, 38 16 Z"
      fill="rgba(11, 122, 50, 0.08)"
      stroke="rgba(11, 122, 50, 0.25)"
      strokeWidth="1.5"
    />
  )
}

export function SoromaMapWidget({
  title,
  description,
  metricLabel = "suppliers",
  points,
}: {
  title: string
  description?: string
  metricLabel?: string
  points: SoromaMapPoint[]
}) {
  const max = Math.max(1, ...points.map((p) => p.value))

  if (points.length === 0) {
    return (
      <SoromaDashboardCard title={title} description={description}>
        <p className="py-8 text-center text-sm text-[var(--sf-text-muted)]">
          No geo-distribution data available for this scope.
        </p>
      </SoromaDashboardCard>
    )
  }

  return (
    <SoromaDashboardCard title={title} description={description}>
      <div className="sf-rwanda-map">
        <svg viewBox="0 0 100 80" preserveAspectRatio="xMidYMid meet" aria-label="District distribution map">
          <RwandaSilhouette />
          {points.slice(0, 16).map((point, i) => {
            const coords = point.x != null && point.y != null
              ? { x: point.x, y: point.y }
              : resolveCoords(point.label, i, points.length)
            const r = 2 + (point.value / max) * 5
            return (
              <g key={point.id}>
                <circle
                  className="sf-map-dot"
                  cx={coords.x}
                  cy={coords.y}
                  r={r}
                  aria-label={`${point.label}: ${point.value} ${metricLabel}`}
                />
                <title>{`${point.label}: ${point.value} ${metricLabel}`}</title>
              </g>
            )
          })}
        </svg>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {points.slice(0, 6).map((point) => (
          <div key={point.id} className="flex items-center justify-between text-xs">
            <span className="font-medium text-[var(--sf-text-primary)] truncate">{point.label}</span>
            <span className="text-[var(--sf-text-muted)] ml-2 shrink-0">{point.value}</span>
          </div>
        ))}
      </div>
    </SoromaDashboardCard>
  )
}
