"use client"

import { SoromaModuleDashboard } from "../module-dashboard"
import { SoromaModuleExtraGrid } from "../module-extra-grid"
import { SoromaOperationalModule } from "../operational-module"
import { useSoromaModuleAction } from "../use-module-action"
import { SOROMA_PERMISSIONS as P } from "@/lib/soroma/permissions"
import type { WorkflowBoardItem } from "../workflow-board"
import type { WorkflowTimelineEvent } from "../workflow-timeline"

type Data = Awaited<
  ReturnType<typeof import("@/lib/soroma/module-dashboards").getLogisticsDashboardFull>
>

export function LogisticsModuleClient({
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
  const { openAction, modal } = useSoromaModuleAction(tenantId)

  const dashboard = (
    <>
      {modal}
      <SoromaModuleDashboard
        title="Logistics Dashboard"
        moduleTag="T-06 · Logistics"
        description="Dispatch planner, shipment tracking, route efficiency, POD tracker, and cold chain monitoring."
        tenantName={tenantName}
        showScopeBanner={false}
        kpis={data.kpis}
        charts={[
          { title: "Shipment Status", type: "donut", data: data.statusChart },
          { title: "Route Efficiency (Stops)", type: "bar", data: data.routeEfficiency },
        ]}
        tableTitle="Shipment Status"
        columns={[
          { key: "shipmentNumber", header: "Shipment" },
          { key: "route", header: "Route" },
          { key: "status", header: "Status", status: true },
          { key: "pod", header: "POD" },
          { key: "dispatch", header: "Dispatch" },
        ]}
        rows={data.rows}
        quickActions={[
          {
            label: "New Dispatch",
            variant: "default",
            permission: P.LOGISTICS_MANAGE,
            onClick: () =>
              openAction({
                key: "dispatch",
                title: "New Dispatch",
                endpoint: "/shipments",
                fields: [
                  {
                    name: "orderId",
                    label: "Order",
                    type: "select",
                    options: data.orderOptions.map((o) => ({
                      label: o.orderNumber,
                      value: o.id,
                    })),
                  },
                  { name: "routeName", label: "Route Name" },
                  { name: "vehicleId", label: "Vehicle ID" },
                  { name: "driverName", label: "Driver Name" },
                  { name: "costAmount", label: "Cost", type: "number" },
                ],
              }),
          },
          { label: "Assign Vehicle", description: "Use workflow board", permission: P.LOGISTICS_MANAGE },
          { label: "Confirm POD", description: "Use workflow: POD Received", permission: P.LOGISTICS_MANAGE },
        ]}
      />
      <SoromaModuleExtraGrid
        tables={[
          {
            title: "POD Tracker",
            columns: [
              { key: "shipment", header: "Shipment" },
              { key: "pod", header: "POD Status" },
              { key: "delivered", header: "Delivered" },
            ],
            rows: data.podTracker,
            span: 4,
          },
          {
            title: "Vehicle Status",
            columns: [
              { key: "vehicle", header: "Vehicle" },
              { key: "driver", header: "Driver" },
              { key: "status", header: "Status", status: true },
            ],
            rows: data.vehicleStatus,
            span: 4,
          },
          {
            title: "Delivery Exceptions",
            columns: [
              { key: "shipment", header: "Shipment" },
              { key: "type", header: "Type" },
              { key: "notes", header: "Notes" },
            ],
            rows: data.deliveryExceptions,
            span: 4,
          },
        ]}
      />
      <div className="sf-card sf-card-elevated p-4 text-sm">
        <span className="font-semibold text-[var(--sf-text-primary)]">Cost Summary: </span>
        <span className="text-[var(--sf-green-600)]">{data.costSummary}</span>
      </div>
    </>
  )

  return (
    <SoromaOperationalModule
      tenantId={tenantId}
      dashboard={dashboard}
      workflowTitle="Logistics Workflow"
      workflowItems={workflowItems}
      recentEvents={recentEvents}
    />
  )
}
