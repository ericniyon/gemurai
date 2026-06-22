import { SoromaModuleDashboard } from "@/components/soroma/module-dashboard"
import { formatSoromaCurrency } from "@/lib/soroma/formatters"
import { safeSoromaExportJobCount } from "@/lib/soroma/reporting"
import { prisma } from "@/lib/database"

export default async function PlatformBillingPage() {
  const [tenants, invoices, revenueAgg, receivableAgg, exports] = await Promise.all([
    prisma.soromaTenant.findMany({
      select: { id: true, name: true, status: true, currency: true },
      orderBy: { name: "asc" },
      take: 200,
    }),
    prisma.soromaInvoice.findMany({
      orderBy: { createdAt: "desc" },
      take: 300,
      select: { id: true, tenantId: true, amount: true, currency: true, status: true, dueDate: true },
    }),
    prisma.soromaFinanceRecord.aggregate({
      where: { recordType: "REVENUE" },
      _sum: { amount: true },
    }),
    prisma.soromaFinanceRecord.aggregate({
      where: { recordType: "RECEIVABLE", paidAt: null },
      _sum: { amount: true },
    }),
    safeSoromaExportJobCount(),
  ])

  const totalRevenue = Number(revenueAgg._sum.amount ?? 0)
  const totalReceivables = Number(receivableAgg._sum.amount ?? 0)
  const overdueCount = invoices.filter(
    (invoice) => invoice.status !== "PAID" && invoice.dueDate && invoice.dueDate < new Date()
  ).length

  return (
    <SoromaModuleDashboard
      title="Billing & Subscriptions"
      moduleTag="P-12 · Commercial Operations"
      description="Track ecosystem billing health, receivables, invoicing, and reporting export volume."
      showScopeBanner={false}
      kpis={[
        { title: "Tracked Tenants", value: String(tenants.length), severity: "info" },
        {
          title: "Revenue (Global)",
          value: formatSoromaCurrency(totalRevenue, "RWF"),
          severity: "success",
        },
        {
          title: "Receivables Due",
          value: formatSoromaCurrency(totalReceivables, "RWF"),
          severity: totalReceivables > 0 ? "warning" : "success",
        },
        {
          title: "Overdue Invoices",
          value: String(overdueCount),
          severity: overdueCount > 0 ? "critical" : "success",
        },
        { title: "Report Exports", value: String(exports), severity: "info" },
      ]}
      tableTitle="Tenant Billing Snapshot"
      columns={[
        { key: "name", header: "Tenant" },
        { key: "status", header: "Tenant Status", status: true },
        { key: "currency", header: "Currency" },
        { key: "invoiceCount", header: "Invoices" },
        { key: "openInvoices", header: "Open" },
      ]}
      rows={tenants.map((tenant) => {
        const tenantInvoices = invoices.filter((invoice) => invoice.tenantId === tenant.id)
        return {
          id: tenant.id,
          name: tenant.name,
          status: tenant.status,
          currency: tenant.currency,
          invoiceCount: String(tenantInvoices.length),
          openInvoices: String(tenantInvoices.filter((invoice) => invoice.status !== "PAID").length),
        }
      })}
      quickActions={[
        { label: "Reports", href: "/soroma/platform/reports", variant: "tile" },
        { label: "Audit", href: "/soroma/platform/audit", variant: "tile" },
      ]}
      emptyMessage="No billing records found."
    />
  )
}
