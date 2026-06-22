import { Lock } from "lucide-react"

export function SoromaScopeBanner({ tenantName }: { tenantName?: string }) {
  return (
    <div
      className="sf-scope-banner flex items-center gap-3 rounded-[var(--sf-radius)] px-4 py-3 text-sm"
      role="status"
    >
      <Lock className="h-4 w-4 shrink-0" style={{ color: "var(--sf-green-700)" }} aria-hidden />
      <span>
        {tenantName ? (
          <>
            <strong>{tenantName}</strong>
            <span className="opacity-80">
              {" "}
              — Your data is private and isolated. All queries are scoped to this
              workspace.
            </span>
          </>
        ) : (
          <>Your data is private and isolated.</>
        )}
      </span>
    </div>
  )
}
