import { SoromaModuleDashboard } from "@/components/soroma/module-dashboard"
import { prisma } from "@/lib/database"

export default async function TenantAuditPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenantId: string }>
  searchParams: Promise<{ search?: string; action?: string }>
}) {
  const { tenantId } = await params
  const { search = "", action = "" } = await searchParams
  const [tenant, logs] = await Promise.all([
    prisma.soromaTenant.findUnique({ where: { id: tenantId }, select: { name: true } }),
    prisma.soromaAuditLog.findMany({
      where: {
        tenantId,
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
    }),
  ])

  return (
    <SoromaModuleDashboard
      title="Tenant Audit Logs"
      moduleTag="T-09 · Audit Governance"
      description="Search and inspect approvals, edits, exports, integrations, and workspace actions."
      tenantName={tenant?.name}
      kpis={[
        { title: "Total Logs", value: String(logs.length), severity: "info" },
        {
          title: "Edit Events",
          value: String(logs.filter((log) => log.action.includes("UPDATE")).length),
          severity: "warning",
        },
        {
          title: "Export Events",
          value: String(logs.filter((log) => log.action.includes("EXPORT")).length),
          severity: "success",
        },
        {
          title: "Delete Events",
          value: String(logs.filter((log) => log.action.includes("DELETE")).length),
          severity: "critical",
        },
      ]}
      tableTitle="Tenant Audit Timeline"
      columns={[
        { key: "createdAt", header: "Timestamp" },
        { key: "action", header: "Action" },
        { key: "entityType", header: "Entity Type" },
        { key: "entityId", header: "Entity ID" },
        { key: "userId", header: "User" },
      ]}
      rows={logs.map((log) => ({
        id: log.id,
        createdAt: log.createdAt.toISOString().slice(0, 19).replace("T", " "),
        action: log.action,
        entityType: log.entityType ?? "—",
        entityId: log.entityId ?? "—",
        userId: log.userId ?? "—",
      }))}
      quickActions={[
        { label: "Search Exports", href: "?search=EXPORT", variant: "default" },
        { label: "Search Role Changes", href: "?search=ROLE" },
        { label: "Audit API", href: `/api/v1/soroma/tenant/${tenantId}/audit/logs` },
      ]}
      emptyMessage="No tenant audit logs recorded."
    />
  )
}
