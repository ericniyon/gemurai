import { SoromaModuleDashboard } from "@/components/soroma/module-dashboard"
import { SoromaModuleExtraGrid } from "@/components/soroma/module-extra-grid"
import { getPlatformComplianceDashboardFull } from "@/lib/soroma/module-dashboards"

export default async function PlatformCompliancePage() {
  const data = await getPlatformComplianceDashboardFull()
  return (
    <div className="space-y-6">
      <SoromaModuleDashboard
        title="Compliance Oversight"
        moduleTag="P-07 · Compliance Oversight"
        description="Cross-tenant compliance scores, certifications, CAPAs, and scheduled audits."
        showScopeBanner={false}
        kpis={data.kpis}
        tableTitle="Compliance by Tenant"
        columns={[
          { key: "name", header: "Tenant" },
          { key: "score", header: "Score" },
          { key: "certs", header: "Certs" },
          { key: "capas", header: "CAPAs" },
          { key: "status", header: "Status", status: true },
          { key: "district", header: "District" },
        ]}
        rows={data.rows}
      />
      <SoromaModuleExtraGrid
        tables={[
          {
            title: "Tenant Compliance Heatmap",
            description: "Compliance score distribution across network",
            columns: [
              { key: "name", header: "Tenant" },
              { key: "score", header: "Score" },
              { key: "district", header: "Region" },
            ],
            rows: data.rows.filter((r) => r.score !== "—"),
            span: 12,
          },
        ]}
      />
    </div>
  )
}
