import { SoromaModuleDashboard } from "@/components/soroma/module-dashboard"
import { prisma } from "@/lib/database"

export default async function PlatformAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; action?: string }>
}) {
  const { search = "", action = "" } = await searchParams
  const logs = await prisma.soromaAuditLog.findMany({
    where: {
      ...(action ? { action } : {}),
      ...(search
        ? {
            OR: [
              { action: { contains: search, mode: "insensitive" } },
              { entityType: { contains: search, mode: "insensitive" } },
              { entityId: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 250,
  })

  return (
    <SoromaModuleDashboard
      title="Audit Logs"
      moduleTag="P-09 · Audit Governance"
      description="Searchable platform audit trails with entity history and before/after states."
      showScopeBanner={false}
      kpis={[
        { title: "Total Logs", value: String(logs.length), severity: "info" },
        {
          title: "Approval Events",
          value: String(logs.filter((log) => log.action.includes("APPROV")).length),
          severity: "success",
        },
        {
          title: "Export Events",
          value: String(logs.filter((log) => log.action.includes("EXPORT")).length),
          severity: "warning",
        },
        {
          title: "Role Change Events",
          value: String(logs.filter((log) => log.action.includes("ROLE")).length),
          severity: "critical",
        },
      ]}
      tableTitle="Audit Timeline"
      columns={[
        { key: "createdAt", header: "Timestamp" },
        { key: "action", header: "Action" },
        { key: "entityType", header: "Entity Type" },
        { key: "entityId", header: "Entity ID" },
        { key: "workspaceType", header: "Workspace" },
        { key: "tenantId", header: "Tenant" },
      ]}
      rows={logs.map((log) => ({
        id: log.id,
        createdAt: log.createdAt.toISOString().slice(0, 19).replace("T", " "),
        action: log.action,
        entityType: log.entityType ?? "—",
        entityId: log.entityId ?? "—",
        workspaceType: log.workspaceType ?? "—",
        tenantId: log.tenantId ?? "—",
      }))}
      quickActions={[
        { label: "Search Exports", href: "?search=EXPORT", variant: "default" },
        { label: "Search Approvals", href: "?search=APPROV" },
        { label: "API Logs Endpoint", href: "/api/v1/soroma/platform/audit/logs" },
      ]}
      emptyMessage="No audit events recorded."
    />
  )
}
