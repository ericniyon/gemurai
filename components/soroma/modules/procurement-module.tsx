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
  ReturnType<typeof import("@/lib/soroma/module-dashboards").getProcurementDashboardFull>
>

export function ProcurementModuleClient({
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
        title="Procurement Dashboard"
        moduleTag="T-02 · Procurement"
        description="Purchase orders, RFQs, delivery scheduling, raw material inflow, and price variance."
        tenantName={tenantName}
        showScopeBanner={false}
        kpiColumns={2}
        kpis={data.kpis}
        charts={[
          { title: "Purchase Pipeline", type: "bar", data: data.pipelineChart },
          { title: "Commodity Sourcing", type: "donut", data: data.commodityChart },
        ]}
        alerts={data.alerts}
        tableTitle="Recent Purchase Orders"
        columns={[
          { key: "poNumber", header: "PO #" },
          { key: "supplier", header: "Supplier" },
          { key: "commodity", header: "Commodity" },
          { key: "amount", header: "Amount" },
          { key: "status", header: "Status", status: true },
          { key: "deliveryDate", header: "Delivery" },
        ]}
        rows={data.rows}
        headerActions={
          <ExportButton permission={P.PROCUREMENT_MANAGE} onClick={() => exportCsv(data.rows, "purchase-orders.csv")} />
        }
        quickActions={[
          {
            label: "Create PO",
            variant: "default",
            permission: P.PROCUREMENT_MANAGE,
            onClick: () =>
              openAction({
                key: "po",
                title: "Create Purchase Order",
                endpoint: "/purchase-orders",
                fields: [
                  {
                    name: "supplierId",
                    label: "Supplier",
                    type: "select",
                    required: true,
                    options: data.supplierOptions.map((s) => ({ label: s.name, value: s.id })),
                  },
                  { name: "commodity", label: "Commodity" },
                  { name: "amount", label: "Amount", type: "number" },
                  { name: "deliveryDate", label: "Delivery Date", type: "date" },
                ],
              }),
          },
          {
            label: "Request Quotes",
            permission: P.PROCUREMENT_MANAGE,
            onClick: () =>
              openAction({
                key: "rfq",
                title: "Request Quotes",
                endpoint: "/purchase-orders",
                fields: [
                  { name: "supplierId", label: "Supplier", type: "select", required: true,
                    options: data.supplierOptions.map((s) => ({ label: s.name, value: s.id })) },
                  { name: "commodity", label: "Commodity", required: true },
                ],
                initialValues: { status: "REQUESTED" },
              }),
          },
          { label: "Approve POs", description: "Use workflow board", permission: P.PO_APPROVE },
        ]}
      />
      <SoromaModuleExtraGrid
        tables={[
          {
            title: "Delivery Schedule",
            columns: [
              { key: "poNumber", header: "PO" },
              { key: "supplier", header: "Supplier" },
              { key: "deliveryDate", header: "Date" },
              { key: "status", header: "Status", status: true },
            ],
            rows: data.deliverySchedule,
            span: 6,
          },
          {
            title: "Low Stock Materials",
            columns: [
              { key: "sku", header: "SKU" },
              { key: "name", header: "Material" },
              { key: "available", header: "Available" },
            ],
            rows: data.lowStock,
            span: 6,
          },
          {
            title: "Top Suppliers",
            columns: [
              { key: "name", header: "Supplier" },
              { key: "orders", header: "POs" },
              { key: "quality", header: "Quality" },
            ],
            rows: data.topSuppliers,
            span: 12,
          },
        ]}
      />
    </>
  )

  return (
    <SoromaOperationalModule
      tenantId={tenantId}
      dashboard={dashboard}
      workflowTitle="Procurement Workflow"
      workflowItems={workflowItems}
      recentEvents={recentEvents}
    />
  )
}
