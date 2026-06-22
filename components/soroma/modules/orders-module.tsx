"use client"

import { SoromaModuleDashboard } from "../module-dashboard"
import { SoromaModuleExtraGrid } from "../module-extra-grid"
import { SoromaOperationalModule } from "../operational-module"
import { ExportButton } from "../export-button"
import { useSoromaModuleAction } from "../use-module-action"
import { SOROMA_PERMISSIONS as P } from "@/lib/soroma/permissions"
import type { WorkflowBoardItem } from "../workflow-board"
import type { WorkflowTimelineEvent } from "../workflow-timeline"

type Data = Awaited<
  ReturnType<typeof import("@/lib/soroma/module-dashboards").getOrdersDashboardFull>
>

export function OrdersModuleClient({
  tenantId,
  tenantName,
  data,
  workflowItems,
  recentEvents,
}: {
  tenantId: string
  tenantName?: string
  data: Data
  workflowItems: WorkflowBoardItem[]
  recentEvents: WorkflowTimelineEvent[]
}) {
  const { openAction, modal, exportCsv } = useSoromaModuleAction(tenantId)

  const dashboard = (
    <>
      {modal}
      <SoromaModuleDashboard
        title="Buyers & Orders Dashboard"
        moduleTag="T-05 · Orders"
        description="Buyer directory, order pipeline, revenue tracking, quotes, contracts, and fulfillment."
        tenantName={tenantName}
        showScopeBanner={false}
        kpis={data.kpis}
        charts={[
          { title: "Order Pipeline", type: "bar", data: data.pipelineChart },
          { title: "Revenue by Order", type: "bar", data: data.revenueChart },
          { title: "Top SKUs", type: "donut", data: data.topSkus },
        ]}
        tableTitle="Recent Orders"
        columns={[
          { key: "orderNumber", header: "Order" },
          { key: "buyer", header: "Buyer" },
          { key: "amount", header: "Amount" },
          { key: "status", header: "Status", status: true },
          { key: "fulfillment", header: "Fulfillment" },
        ]}
        rows={data.rows}
        headerActions={
          <ExportButton permission={P.ORDERS_MANAGE} onClick={() => exportCsv(data.rows, "orders.csv")} />
        }
        quickActions={[
          {
            label: "Create Quote",
            variant: "default",
            permission: P.ORDERS_MANAGE,
            onClick: () =>
              openAction({
                key: "quote",
                title: "Create Quote / Order",
                endpoint: "/orders",
                fields: [
                  {
                    name: "buyerId",
                    label: "Buyer",
                    type: "select",
                    required: true,
                    options: data.buyerOptions.map((b) => ({ label: b.name, value: b.id })),
                  },
                  { name: "amount", label: "Amount", type: "number" },
                  { name: "skuCode", label: "SKU Code" },
                  { name: "skuName", label: "SKU Name" },
                  { name: "quantity", label: "Quantity", type: "number" },
                ],
                initialValues: { status: "DRAFT", currency: data.currency },
              }),
          },
          { label: "Confirm Order", description: "Use workflow board", permission: P.ORDERS_MANAGE },
          {
            label: "Generate Invoice",
            description: "Use workflow: Generate Invoice action",
            permission: P.ORDERS_MANAGE,
          },
        ]}
      />
      <SoromaModuleExtraGrid
        tables={[
          {
            title: "Buyer Directory",
            columns: [
              { key: "name", header: "Buyer" },
              { key: "type", header: "Segment" },
              { key: "district", header: "District" },
              { key: "contract", header: "Contract" },
            ],
            rows: data.buyerDirectory,
            span: 6,
          },
          {
            title: "Customer Issues",
            columns: [
              { key: "buyer", header: "Buyer" },
              { key: "title", header: "Issue" },
              { key: "severity", header: "Severity", status: true },
            ],
            rows: data.customerIssues,
            span: 6,
          },
        ]}
      />
    </>
  )

  return (
    <SoromaOperationalModule
      tenantId={tenantId}
      dashboard={dashboard}
      workflowTitle="Order Pipeline"
      workflowItems={workflowItems}
      recentEvents={recentEvents}
    />
  )
}
