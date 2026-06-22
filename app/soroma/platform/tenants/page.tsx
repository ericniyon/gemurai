import { SoromaModuleDashboard } from "@/components/soroma/module-dashboard"
import { getPlatformTenantsDashboard } from "@/lib/soroma/dashboard-data"
import { SOROMA_ROUTES } from "@/lib/soroma/constants"

export default async function PlatformTenantsPage() {
  const data = await getPlatformTenantsDashboard()
  return (
    <SoromaModuleDashboard
      title="Tenants / Agroprocessors"
      moduleTag="P-02 · Tenant Management"
      description="Manage all agroprocessor tenants, status, onboarding progress, and ecosystem impact."
      showScopeBanner={false}
      kpis={data.kpis}
      tableTitle="Tenant Directory"
      columns={[
        { key: "name", header: "Name" },
        { key: "status", header: "Status", status: true },
        { key: "valueChain", header: "Value Chain" },
        { key: "district", header: "District" },
        { key: "compliance", header: "Compliance" },
      ]}
      rows={data.rows}
      quickActions={[
        { label: "Add Tenant", variant: "default" },
        { label: "Export", href: "#" },
      ]}
    />
  )
}
