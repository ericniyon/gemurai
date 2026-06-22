import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"
import { ChevronRight, Zap } from "lucide-react"
import { PermissionGuard } from "./permission-guard"

export type QuickAction = {
  label: string
  description?: string
  icon?: LucideIcon
  onClick?: () => void
  href?: string
  variant?: "default" | "outline" | "tile"
  requiresConfirm?: boolean
  /** Hide when user lacks permission (checked by parent PermissionGuard) */
  permission?: string
}

export function SoromaQuickActions({
  actions,
  title = "Quick Actions",
  layout = "tiles",
}: {
  actions: QuickAction[]
  title?: string
  layout?: "tiles" | "buttons"
}) {
  return (
    <div className="sf-card sf-card-elevated h-full p-4">
      <div className="mb-4 flex items-center gap-2">
        <Zap className="h-4 w-4 text-[var(--sf-orange-600)]" aria-hidden />
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--sf-text-muted)]">
          {title}
        </h3>
      </div>
      {layout === "buttons" ? (
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => (
            <GuardedAction key={action.label} permission={action.permission}>
              <ActionButton action={action} />
            </GuardedAction>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {actions.map((action) => (
            <GuardedAction key={action.label} permission={action.permission}>
              <ActionTile action={action} />
            </GuardedAction>
          ))}
        </div>
      )}
    </div>
  )
}

function GuardedAction({
  permission,
  children,
}: {
  permission?: string
  children: React.ReactNode
}) {
  if (!permission) return <>{children}</>
  return <PermissionGuard permission={permission}>{children}</PermissionGuard>
}

function ActionButton({ action }: { action: QuickAction }) {
  const isPrimary = action.variant === "default"
  const inner = (
    <>
      {action.icon && <action.icon className="mr-2 h-4 w-4" />}
      {action.label}
    </>
  )
  if (action.href) {
    return (
      <Button
        variant={isPrimary ? "default" : "outline"}
        size="sm"
        className={cn(isPrimary && "sf-btn-primary border-0")}
        asChild
      >
        <Link href={action.href}>{inner}</Link>
      </Button>
    )
  }
  return (
    <Button
      variant={isPrimary ? "default" : "outline"}
      size="sm"
      className={cn(isPrimary && "sf-btn-primary border-0")}
      onClick={action.onClick}
    >
      {inner}
    </Button>
  )
}

function ActionTile({ action }: { action: QuickAction }) {
  const content = (
    <>
      {action.icon && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--sf-green-100)] text-[var(--sf-green-700)]">
          <action.icon className="h-4 w-4" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-[var(--sf-text-primary)]">
          {action.label}
        </p>
        {action.description && (
          <p className="mt-0.5 text-[10px] text-[var(--sf-text-muted)] truncate">
            {action.description}
          </p>
        )}
      </div>
      <ChevronRight
        className="h-3.5 w-3.5 shrink-0 opacity-40 text-[var(--sf-green-700)]"
        aria-hidden
      />
    </>
  )

  if (action.href) {
    return (
      <Link
        href={action.href}
        className="sf-action-tile flex w-full items-center gap-3 px-3 py-2.5 text-left transition-all"
      >
        {content}
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={action.onClick}
      className="sf-action-tile flex w-full items-center gap-3 px-3 py-2.5 text-left transition-all"
    >
      {content}
    </button>
  )
}
