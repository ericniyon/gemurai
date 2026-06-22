"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  filterNavByPermissions,
  getPlatformNavItems,
  getTenantNavItems,
  type SoromaNavItem,
} from "@/config/navigation/soroma"
import { SOROMA_ROUTES } from "@/lib/soroma/constants"
import { SoromaDateRangePicker, type DateRangeKey } from "./date-range-picker"
import {
  Bell,
  ChevronDown,
  HelpCircle,
  Leaf,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  Zap,
  Plus,
  QrCode,
  Truck,
  ShieldCheck,
} from "lucide-react"
import * as LucideIcons from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function NavIcon({ name }: { name: string }) {
  const icons = LucideIcons as unknown as Record<
    string,
    React.ComponentType<{ className?: string }>
  >
  const Icon = icons[name]
  if (!Icon) return <Leaf className="h-4 w-4" />
  return <Icon className="h-4 w-4" />
}

function formatRole(role: string): string {
  return role
    .replace(/^PLATFORM_/, "")
    .replace(/^TENANT_/, "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export type SoromaShellProps = {
  workspaceType: "platform" | "tenant"
  tenantId?: string
  tenantName?: string
  userName: string
  userRole: string
  permissions: string[]
  tenants?: { id: string; name: string }[]
  alertsCount?: number
  canSwitchWorkspace?: boolean
  isImpersonating?: boolean
  children: React.ReactNode
}

async function switchWorkspace(body: {
  workspace: "platform" | "tenant"
  tenantId?: string
}) {
  const res = await fetch("/api/v1/soroma/workspace/switch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok || !data.success) {
    throw new Error(data.error ?? "Workspace switch failed")
  }
  return data.data.redirectUrl as string
}

export function SoromaShell({
  workspaceType,
  tenantId,
  tenantName,
  userName,
  userRole,
  permissions,
  tenants = [],
  alertsCount = 0,
  canSwitchWorkspace = false,
  isImpersonating = false,
  children,
}: SoromaShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const dateRange = (searchParams.get("scope") as DateRangeKey) || "30d"
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function setDateRange(range: DateRangeKey) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("scope", range)
    document.cookie = `soroma_date_range=${range}; path=/; max-age=${86400 * 30}; SameSite=Lax`
    router.push(`${pathname}?${params.toString()}`)
  }
  const [isCompact, setIsCompact] = useState(false)
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({})

  // Read sidebar compact state from localStorage on load
  useEffect(() => {
    const val = localStorage.getItem("sf_sidebar_compact") === "true"
    setIsCompact(val)
  }, [])

  const toggleCompact = () => {
    const val = !isCompact
    setIsCompact(val)
    localStorage.setItem("sf_sidebar_compact", String(val))
  }

  const toggleGroup = (title: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [title]: !prev[title],
    }))
  }

  const navItems: SoromaNavItem[] =
    workspaceType === "platform"
      ? filterNavByPermissions(getPlatformNavItems(), permissions)
      : tenantId
        ? filterNavByPermissions(getTenantNavItems(tenantId), permissions)
        : []

  const workspaceLabel =
    workspaceType === "platform" ? "Platform Admin" : "Tenant Workspace"

  const alertsHref =
    workspaceType === "platform"
      ? SOROMA_ROUTES.platform.alerts
      : tenantId
        ? SOROMA_ROUTES.tenant(tenantId).alerts
        : "#"

  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const tenantMobileLinks = useMemo(() => {
    if (!tenantId || workspaceType !== "tenant") return []
    const routes = SOROMA_ROUTES.tenant(tenantId)
    return [
      { label: "Warehouse", href: routes.inventory },
      { label: "Logistics", href: routes.logistics },
      { label: "QA", href: routes.compliance },
      { label: "Scan", href: routes.traceability },
    ]
  }, [tenantId, workspaceType])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSidebarOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  // Group nav items
  const groupedNavItems = useMemo(() => {
    const groups: { title: string; items: SoromaNavItem[] }[] = [
      { title: "Main Navigation", items: [] },
      { title: "Operational Modules", items: [] },
      { title: "Analytics & Reports", items: [] },
      { title: "Administration", items: [] },
    ]

    const mainLabels = ["Overview"]
    const analyticsLabels = ["Reports", "M&E Dashboard", "Ecosystem Analytics"]
    const adminLabels = ["Settings", "Audit Logs", "Users & Roles", "Billing"]

    navItems.forEach((item) => {
      if (mainLabels.includes(item.label)) {
        groups[0].items.push(item)
      } else if (analyticsLabels.includes(item.label)) {
        groups[2].items.push(item)
      } else if (adminLabels.includes(item.label)) {
        groups[3].items.push(item)
      } else {
        groups[1].items.push(item)
      }
    })

    return groups.filter((g) => g.items.length > 0)
  }, [navItems])

  return (
    <div className="soroma-app flex min-h-screen flex-col">
      <a
        href="#soroma-main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[100] focus:rounded focus:bg-[var(--sf-surface)] focus:px-3 focus:py-2 focus:text-sm focus:text-[var(--sf-text-primary)]"
      >
        Skip to main content
      </a>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <div className="flex flex-1">
        {/* SIDEBAR NAVIGATION */}
        <aside
          id="soroma-sidebar"
          className={cn(
            "soroma-sidebar fixed inset-y-0 left-0 z-50 flex flex-col text-white transition-all duration-200 lg:static lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
            isCompact ? "compact w-[68px]" : "w-[260px]"
          )}
        >
          {/* logo section */}
          <div className="sidebar-logo-section flex items-center gap-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-md"
              style={{ background: "var(--sf-green-600)" }}
            >
              <Leaf className="h-4.5 w-4.5 text-white" aria-hidden />
            </div>
            {!isCompact && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold leading-tight tracking-tight text-white">
                  SOROMA FOODS
                </p>
                <p className="text-[9px] font-semibold uppercase tracking-widest text-[var(--sf-green-500)]">
                  Agroprocessor OS
                </p>
              </div>
            )}
            <button
              type="button"
              className="rounded-lg p-1 hover:bg-white/10 lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Workspace Switcher in sidebar */}
          {canSwitchWorkspace && tenants.length > 0 && !isCompact && (
            <div className="px-3 py-2 border-b border-white/5 bg-white/5">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex w-full items-center justify-between gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-left text-xs text-white hover:bg-white/10 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{tenantName ?? "Platform Admin"}</p>
                      <p className="text-[9px] text-white/50">{workspaceLabel}</p>
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-52">
                  <div className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase">
                    Select Workspace
                  </div>
                  <DropdownMenuItem
                    onClick={async () => {
                      const url = await switchWorkspace({ workspace: "platform" })
                      router.push(url)
                    }}
                  >
                    Platform Admin Portal
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {tenants.map((t) => (
                    <DropdownMenuItem
                      key={t.id}
                      onClick={async () => {
                        const url = await switchWorkspace({
                          workspace: "tenant",
                          tenantId: t.id,
                        })
                        router.push(url)
                      }}
                    >
                      {t.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Navigation Items */}
          <nav className="flex-1 space-y-4 overflow-y-auto px-2 py-3" aria-label="Main">
            {groupedNavItems.map((group) => {
              const isCollapsed = collapsedGroups[group.title] ?? false
              return (
                <div key={group.title} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.title)}
                    className="w-full flex items-center justify-between nav-group-title hover:text-white transition-colors"
                  >
                    <span>{group.title}</span>
                    {!isCompact && (
                      <ChevronDown
                        className={cn(
                          "h-3 w-3 transition-transform duration-200",
                          isCollapsed && "-rotate-90"
                        )}
                      />
                    )}
                  </button>
                  {(!isCollapsed || isCompact) && (
                    <div className="space-y-0.5">
                      {group.items.map((item) => {
                        const active =
                          pathname === item.href ||
                          (pathname?.startsWith(item.href + "/") ?? false)
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                              "nav-item flex items-center gap-3 rounded-lg px-3 py-2 text-xs transition-colors",
                              active && "nav-active font-medium",
                              isCompact && "justify-center px-0"
                            )}
                            onClick={() => setSidebarOpen(false)}
                            title={isCompact ? item.label : undefined}
                          >
                            <NavIcon name={item.icon} />
                            {!isCompact && <span className="truncate">{item.label}</span>}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          {/* Collapse sidebar button */}
          <button
            onClick={toggleCompact}
            className="mx-3 my-2 hidden lg:flex items-center justify-center gap-2 rounded-lg py-2 text-xs text-white/50 hover:bg-white/5 hover:text-white transition-colors border-t border-white/5 pt-3"
          >
            {isCompact ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>Collapse Sidebar</span>
              </>
            )}
          </button>

          {/* Privacy notice — handoff §5 sidebar sample */}
          {workspaceType === "tenant" && tenantName && !isCompact && (
            <div className="sf-sidebar-privacy mx-2 mb-2">
              <strong>Your data is private and isolated.</strong> This workspace only shows{" "}
              {tenantName} data within SOROMA FOODS OS.
            </div>
          )}

          {/* User Section at bottom of sidebar */}
          <div className="sidebar-footer-profile flex items-center gap-2">
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow"
              style={{ background: "var(--sf-green-600)" }}
              aria-hidden
            >
              {userInitials}
            </span>
            {!isCompact && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold leading-none text-white">
                  {userName}
                </p>
                <p className="mt-0.5 truncate text-[10px] text-white/50">
                  {formatRole(userRole)}
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* MAIN WORKSPACE SHELL */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* COMPACT CONTEXT HEADER */}
          <header className="sf-header-bar flex items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-3 flex-1">
              <button
                type="button"
                className="sf-icon-button-soft rounded-lg p-2 lg:hidden border"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
                aria-expanded={sidebarOpen}
                aria-controls="soroma-sidebar"
              >
                <Menu className="h-4 w-4" style={{ color: "var(--sf-text-primary)" }} />
              </button>

              {/* Workspace details badge */}
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase",
                    workspaceType === "platform"
                      ? "sf-workspace-badge--platform"
                      : "sf-workspace-badge--tenant"
                  )}
                >
                  {workspaceLabel}
                </span>

                {tenantName && (
                  <span className="hidden text-xs font-semibold text-[var(--sf-text-secondary)] sm:inline">
                    · {tenantName}
                  </span>
                )}
              </div>

              {/* Global search input */}
              <div className="relative max-w-xs flex-1 hidden md:block ml-2">
                <Search
                  className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
                  style={{ color: "var(--sf-text-muted)" }}
                  aria-hidden
                />
                <input
                  type="text"
                  placeholder="Search batch, PO, or SKU... (⌘K)"
                  className="h-8 w-full rounded-md border border-[var(--sf-border)] bg-[var(--sf-page-bg)] pl-8 pr-3 text-xs text-[var(--sf-text-primary)] placeholder-[var(--sf-text-muted)] focus:border-[var(--sf-green-600)] focus:bg-[var(--sf-surface)] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Right hand controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Quick Actions Dropdown */}
              {workspaceType === "tenant" && tenantId && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1 border border-[var(--sf-border)] bg-[var(--sf-surface)] hover:bg-[var(--sf-surface-soft)] text-xs text-[var(--sf-text-secondary)] font-semibold"
                    >
                      <Zap className="h-3.5 w-3.5 text-[var(--sf-amber-500)] fill-[var(--sf-amber-500)] animate-pulse" />
                      <span className="hidden sm:inline">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <div className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase">
                      Operational Tasks
                    </div>
                    <DropdownMenuItem onClick={() => router.push(SOROMA_ROUTES.tenant(tenantId).traceability)}>
                      <QrCode className="mr-2 h-4 w-4 text-[var(--sf-green-600)]" />
                      Scan QR Passport
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(SOROMA_ROUTES.tenant(tenantId).procurement)}>
                      <Plus className="mr-2 h-4 w-4 text-[var(--sf-green-600)]" />
                      Create PO Order
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(SOROMA_ROUTES.tenant(tenantId).compliance)}>
                      <ShieldCheck className="mr-2 h-4 w-4 text-[var(--sf-green-600)]" />
                      Schedule QC Audit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(SOROMA_ROUTES.tenant(tenantId).logistics)}>
                      <Truck className="mr-2 h-4 w-4 text-[var(--sf-green-600)]" />
                      Dispatch Shipment
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Date Range Picker */}
              <div className="hidden sm:block">
                <SoromaDateRangePicker value={dateRange} onChange={setDateRange} />
              </div>

              {/* Alerts bell */}
              <Link
                href={alertsHref}
                className="sf-icon-button-soft relative rounded-lg p-2 border transition-colors hover:bg-[var(--sf-green-50)]"
                aria-label={`Alerts${alertsCount > 0 ? `, ${alertsCount} open` : ""}`}
              >
                <Bell className="h-4 w-4" style={{ color: "var(--sf-text-muted)" }} />
                {alertsCount > 0 && (
                  <span
                    className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold text-white"
                    style={{ background: "var(--sf-red-600)" }}
                  >
                    {alertsCount > 9 ? "9+" : alertsCount}
                  </span>
                )}
              </Link>

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-1.5 border">
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm"
                      style={{ background: "var(--sf-green-700)" }}
                      aria-hidden
                    >
                      {userInitials}
                    </span>
                    <span className="hidden max-w-[100px] truncate text-xs font-semibold sm:inline text-[var(--sf-text-secondary)]">
                      {userName}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <div className="px-2 py-1.5">
                    <p className="text-xs font-semibold">{userName}</p>
                    <p className="text-[10px] text-muted-foreground">{formatRole(userRole)}</p>
                  </div>
                  <DropdownMenuSeparator />
                  {canSwitchWorkspace && workspaceType === "tenant" && (
                    <DropdownMenuItem
                      onClick={async () => {
                        const url = await switchWorkspace({ workspace: "platform" })
                        router.push(url)
                      }}
                    >
                      Switch to Platform
                    </DropdownMenuItem>
                  )}
                  {canSwitchWorkspace &&
                    workspaceType === "platform" &&
                    tenants.length > 0 && (
                      <DropdownMenuItem
                        onClick={async () => {
                          const url = await switchWorkspace({
                            workspace: "tenant",
                            tenantId: tenants[0].id,
                          })
                          router.push(url)
                        }}
                      >
                        Open Tenant Workspace
                      </DropdownMenuItem>
                    )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      document.cookie = "Gemurai_token=; path=/; max-age=0"
                      router.push(SOROMA_ROUTES.login)
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {isImpersonating && (
            <div
              className="border-b px-4 py-1.5 text-center text-[10px] font-bold tracking-wide uppercase"
              style={{
                background: "var(--sf-green-100)",
                color: "var(--sf-green-900)",
                borderColor: "var(--sf-border)",
              }}
            >
              Platform operator view — tenant data is audited
            </div>
          )}

          {/* MAIN Operational CONTENT */}
          <main id="soroma-main-content" className="flex-1 p-4 pb-24 lg:p-6 lg:pb-6">
            {children}
          </main>

          {/* Context Footer / Status Bar */}
          <footer className="sf-status-bar">
            <span>
              All amounts in RWF
              {tenantName ? ` · ${tenantName}` : " · Platform scope"}
              {" · Data as of "}
              {new Date().toLocaleString("en-RW", {
                dateStyle: "medium",
                timeStyle: "short",
                timeZone: "Africa/Kigali",
              })}
            </span>
            <span className="hidden sm:inline">
              SOROMA FOODS OS · Role: {formatRole(userRole)}
            </span>
          </footer>

          {tenantMobileLinks.length > 0 && (
            <nav
              className="fixed bottom-0 left-0 right-0 z-20 grid grid-cols-4 border-t bg-[var(--sf-surface)]/95 p-2 backdrop-blur sm:hidden"
              style={{ borderColor: "var(--sf-border)" }}
              aria-label="Tenant mobile shortcuts"
            >
              {tenantMobileLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-md px-2 py-2 text-center text-xs font-medium",
                    pathname === item.href
                      ? "bg-[var(--sf-green-100)] text-[var(--sf-green-900)]"
                      : "text-[var(--sf-text-muted)]"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>
    </div>
  )
}
