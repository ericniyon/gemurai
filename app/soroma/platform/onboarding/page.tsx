import { SoromaModuleDashboard } from "@/components/soroma/module-dashboard"
import { getPlatformOnboardingDashboard } from "@/lib/soroma/dashboard-data"

export default async function PlatformOnboardingPage() {
  const data = await getPlatformOnboardingDashboard()
  return (
    <SoromaModuleDashboard
      title="Onboarding Pipeline"
      moduleTag="P-03 · Onboarding"
      description="Applications from received through review, assessment, setup, and completion."
      showScopeBanner={false}
      kpis={data.kpis}
      tableTitle="Recent Applicants"
      columns={[
        { key: "orgName", header: "Organization" },
        { key: "valueChain", header: "Value Chain" },
        { key: "district", header: "District" },
        { key: "stage", header: "Stage", status: true },
        { key: "contact", header: "Contact" },
      ]}
      rows={data.rows}
      quickActions={[
        { label: "Export Report", variant: "default" },
        { label: "View Delayed" },
      ]}
    />
  )
}
