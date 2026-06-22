"use client"

import { SoromaModuleDashboard } from "../module-dashboard"
import { SoromaModuleExtraGrid } from "../module-extra-grid"
import { SoromaIntegrationSyncCenter } from "../integration-sync-center"
import { useSoromaModuleAction } from "../use-module-action"
import { SOROMA_PERMISSIONS as P } from "@/lib/soroma/permissions"
import { SOROMA_CONNECTORS } from "@/lib/soroma/constants"

type Data = Awaited<
  ReturnType<typeof import("@/lib/soroma/dashboard-data").getIntegrationsDashboard>
> & {
  connections: Array<{
    id: string
    connector: { name: string; code: string }
    status: string
    lastSyncAt: Date | null
  }>
  syncJobs: Array<{
    id: string
    status: string
    jobType: string
    createdAt: Date
    connection: { connector: { name: string } }
  }>
}

export function IntegrationsModuleClient({
  tenantId,
  tenantName,
  data,
}: {
  tenantId: string
  tenantName?: string
  data: Data
}) {
  const { openAction, modal } = useSoromaModuleAction(tenantId)

  return (
    <div className="space-y-6">
      {modal}
      <SoromaModuleDashboard
        title="Integrations Dashboard"
        moduleTag="T-09 · Integrations"
        description="Connector cards, sync matrix, channel performance, webhooks, and retry jobs."
        tenantName={tenantName}
        showScopeBanner={false}
        kpis={data.kpis}
        tableTitle="Connector Status"
        columns={[
          { key: "channel", header: "Channel" },
          { key: "status", header: "Status", status: true },
          { key: "lastSync", header: "Last Sync" },
          { key: "successRate", header: "Success Rate" },
        ]}
        rows={data.rows}
        quickActions={[
          {
            label: "Connect Channel",
            variant: "default",
            permission: P.INTEGRATIONS_MANAGE,
            onClick: () =>
              openAction({
                key: "connect",
                title: "Connect Integration",
                endpoint: "/integrations/connections",
                fields: [
                  {
                    name: "connectorCode",
                    label: "Connector",
                    type: "select",
                    required: true,
                    options: SOROMA_CONNECTORS.map((c) => ({ label: c.name, value: c.code })),
                  },
                  { name: "externalAccountId", label: "External Account ID" },
                  { name: "apiKey", label: "API Key" },
                ],
              }),
          },
          {
            label: "Map Products",
            description: "Configure in sync center",
            permission: P.INTEGRATIONS_MANAGE,
          },
          {
            label: "View Sync Logs",
            description: "See sync center below",
            permission: P.INTEGRATIONS_VIEW,
          },
        ]}
      />

      <SoromaModuleExtraGrid
        charts={[
          {
            title: "Channel Performance",
            type: "bar",
            data: data.rows.map((r) => ({
              name: String(r.channel),
              value: parseInt(String(r.successRate).replace("%", "")) || 0,
            })),
            span: 12,
          },
        ]}
        tables={[
          {
            title: "Sync Matrix",
            columns: [
              { key: "channel", header: "Channel" },
              { key: "status", header: "Status", status: true },
              { key: "lastSync", header: "Last Sync" },
            ],
            rows: data.rows,
            span: 12,
          },
        ]}
      />

      <SoromaIntegrationSyncCenter
        mode="tenant"
        tenantId={tenantId}
        connections={data.connections.map((c) => ({
          id: c.id,
          connectorName: c.connector.name,
          status: c.status,
          lastSyncAt: c.lastSyncAt?.toISOString() ?? null,
        }))}
        jobs={data.syncJobs.map((j) => ({
          id: j.id,
          status: j.status,
          jobType: j.jobType,
          connectorName: j.connection.connector.name,
          createdAt: j.createdAt.toISOString(),
        }))}
      />
    </div>
  )
}
