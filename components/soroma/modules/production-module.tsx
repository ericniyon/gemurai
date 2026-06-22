"use client"

import { SoromaModuleDashboard } from "../module-dashboard"
import { SoromaModuleExtraGrid } from "../module-extra-grid"
import { SoromaOperationalModule } from "../operational-module"
import { useSoromaModuleAction } from "../use-module-action"
import { SOROMA_PERMISSIONS as P } from "@/lib/soroma/permissions"
import type { WorkflowBoardItem } from "../workflow-board"
import type { WorkflowTimelineEvent } from "../workflow-timeline"

type Data = Awaited<
  ReturnType<typeof import("@/lib/soroma/module-dashboards").getProductionDashboardFull>
>

export function ProductionModuleClient({
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
        title="Production Dashboard"
        moduleTag="T-03 · Production"
        description="Line status, batch management, yield tracking, downtime, and quality exceptions."
        tenantName={tenantName}
        showScopeBanner={false}
        kpis={data.kpis}
        charts={[
          { title: "Output by Batch", type: "bar", data: data.outputChart },
          { title: "Yield Trend", type: "bar", data: data.yieldTrend },
        ]}
        tableTitle="Batch Management"
        columns={[
          { key: "batchNumber", header: "Batch" },
          { key: "product", header: "Product" },
          { key: "line", header: "Line" },
          { key: "status", header: "Status", status: true },
          { key: "yield", header: "Yield" },
          { key: "output", header: "Output" },
        ]}
        rows={data.rows}
        quickActions={[
          {
            label: "Start New Batch",
            variant: "default",
            permission: P.PRODUCTION_MANAGE,
            onClick: () =>
              openAction({
                key: "batch",
                title: "Start New Batch",
                endpoint: "/batches",
                fields: [
                  { name: "productName", label: "Product Name", required: true },
                  {
                    name: "lineId",
                    label: "Production Line",
                    type: "select",
                    options: data.lineOptions.map((l) => ({ label: l.name, value: l.id })),
                  },
                  { name: "expectedQty", label: "Expected Output", type: "number" },
                ],
              }),
          },
          {
            label: "Record Downtime",
            permission: P.PRODUCTION_MANAGE,
            onClick: () =>
              openAction({
                key: "downtime",
                title: "Record Downtime",
                endpoint: "/batches/events?action=downtime",
                fields: [
                  {
                    name: "batchId",
                    label: "Batch",
                    type: "select",
                    required: true,
                    options: data.batchOptions.map((b) => ({ label: b.batchNumber, value: b.id })),
                  },
                  { name: "reason", label: "Reason", required: true },
                  { name: "durationMinutes", label: "Duration (min)", type: "number", required: true },
                ],
              }),
          },
          {
            label: "Run Quality Check",
            permission: P.PRODUCTION_MANAGE,
            onClick: () =>
              openAction({
                key: "qc",
                title: "Quality Exception",
                endpoint: "/batches/events?action=qc",
                fields: [
                  {
                    name: "batchId",
                    label: "Batch",
                    type: "select",
                    required: true,
                    options: data.batchOptions.map((b) => ({ label: b.batchNumber, value: b.id })),
                  },
                  { name: "exceptionType", label: "Test Type", required: true },
                  {
                    name: "severity",
                    label: "Severity",
                    type: "select",
                    options: [
                      { label: "Low", value: "LOW" },
                      { label: "Medium", value: "MEDIUM" },
                      { label: "High", value: "HIGH" },
                      { label: "Critical", value: "CRITICAL" },
                    ],
                  },
                ],
              }),
          },
          { label: "Shift Handover", description: "Document in batch notes", permission: P.PRODUCTION_MANAGE },
        ]}
      />
      <SoromaModuleExtraGrid
        tables={[
          {
            title: "Line Status",
            columns: [
              { key: "name", header: "Line" },
              { key: "status", header: "Status", status: true },
              { key: "batches", header: "Active Batches" },
            ],
            rows: data.lineStatus,
            span: 4,
          },
          {
            title: "Downtime Events",
            columns: [
              { key: "batch", header: "Batch" },
              { key: "reason", header: "Reason" },
              { key: "minutes", header: "Minutes" },
            ],
            rows: data.downtime,
            span: 4,
          },
          {
            title: "Quality Exceptions",
            columns: [
              { key: "batch", header: "Batch" },
              { key: "type", header: "Type" },
              { key: "severity", header: "Severity", status: true },
            ],
            rows: data.qcExceptions,
            span: 4,
          },
        ]}
      />
    </>
  )

  return (
    <SoromaOperationalModule
      tenantId={tenantId}
      dashboard={dashboard}
      workflowTitle="Production Workflow"
      workflowItems={workflowItems}
      recentEvents={recentEvents}
    />
  )
}
