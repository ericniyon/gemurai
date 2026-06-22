import { SoromaTenantLayout } from "@/components/layouts/soroma-tenant-layout"

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ tenantId: string }>
}) {
  const { tenantId } = await params
  return <SoromaTenantLayout tenantId={tenantId}>{children}</SoromaTenantLayout>
}
