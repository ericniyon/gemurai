import { SoromaStatusBadge } from "./status-badge"

export type WorkflowTimelineEvent = {
  id: string
  action: string
  fromStatus: string | null
  toStatus: string
  comment: string | null
  createdAt: Date
}

export function SoromaWorkflowTimeline({
  events,
  title = "Recent activity",
}: {
  events: WorkflowTimelineEvent[]
  title?: string
}) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-[var(--sf-text-muted)]">
        No workflow transitions recorded yet.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-[var(--sf-text-primary)]">{title}</h4>
      <ul className="space-y-2">
        {events.map((e) => (
          <li
            key={e.id}
            className="sf-surface-soft flex flex-wrap items-center gap-2 rounded-lg border border-[var(--sf-border)] px-3 py-2 text-xs"
          >
            <span className="font-medium text-[var(--sf-text-primary)]">
              {e.action.replace(/_/g, " ")}
            </span>
            {e.fromStatus && (
              <>
                <SoromaStatusBadge status={e.fromStatus} />
                <span className="text-[var(--sf-text-muted)]">→</span>
              </>
            )}
            <SoromaStatusBadge status={e.toStatus} />
            <span className="ml-auto text-[var(--sf-text-muted)]">
              {new Date(e.createdAt).toLocaleString()}
            </span>
            {e.comment && (
              <p className="w-full text-[var(--sf-text-muted)]">{e.comment}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
