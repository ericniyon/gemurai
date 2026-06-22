import Link from "next/link"
import { AlertTriangle, ChevronRight } from "lucide-react"
import { SoromaStatusBadge } from "./status-badge"

export type AlertStripItem = {
  id: string
  title: string
  severity: string
  status: string
  href?: string
}

export function SoromaAlertStrip({
  title = "Recent alerts",
  alerts,
  viewAllHref,
}: {
  title?: string
  alerts: AlertStripItem[]
  viewAllHref?: string
}) {
  if (alerts.length === 0) return null

  return (
    <div className="sf-card sf-card-elevated overflow-hidden">
      <div
        className="flex items-center justify-between border-b px-5 py-3.5"
        style={{ borderColor: "var(--sf-border)" }}
      >
        <div className="flex items-center gap-2">
          <AlertTriangle
            className="h-4 w-4"
            style={{ color: "var(--sf-orange-600)" }}
            aria-hidden
          />
          <h3 className="text-sm font-semibold" style={{ color: "var(--sf-text-primary)" }}>
            {title}
          </h3>
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="flex items-center gap-0.5 text-xs font-medium hover:underline"
            style={{ color: "var(--sf-green-700)" }}
          >
            View all
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
      <ul className="divide-y" style={{ borderColor: "var(--sf-border)" }}>
        {alerts.slice(0, 5).map((alert) => (
          <li key={alert.id}>
            {alert.href ? (
              <Link
                href={alert.href}
                className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-[var(--sf-green-100)]/40"
              >
                <AlertRow alert={alert} />
              </Link>
            ) : (
              <div className="flex items-center justify-between gap-3 px-5 py-3">
                <AlertRow alert={alert} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

function AlertRow({ alert }: { alert: AlertStripItem }) {
  return (
    <>
      <span className="min-w-0 flex-1 truncate text-sm font-medium">
        {alert.title}
      </span>
      <div className="flex shrink-0 items-center gap-2">
        <SoromaStatusBadge status={alert.severity} label={alert.severity} />
        <SoromaStatusBadge status={alert.status} />
      </div>
    </>
  )
}
