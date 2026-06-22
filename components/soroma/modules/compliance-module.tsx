"use client"

import { SoromaModuleDashboard } from "../module-dashboard"
import { SoromaModuleExtraGrid } from "../module-extra-grid"
import { SoromaOperationalModule } from "../operational-module"
import { useSoromaModuleAction } from "../use-module-action"
import { SOROMA_PERMISSIONS as P } from "@/lib/soroma/permissions"
import type { WorkflowBoardItem } from "../workflow-board"
import type { WorkflowTimelineEvent } from "../workflow-timeline"

type Data = Awaited<
  ReturnType<typeof import("@/lib/soroma/compliance").getComplianceOperationalData>
>

export function ComplianceModuleClient({
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
        title="Compliance Dashboard"
        moduleTag="T-08 · Compliance"
        description="Certificates, audit calendar, CAPA management, QC results, and supplier compliance ranking."
        tenantName={tenantName}
        showScopeBanner={false}
        kpis={data.kpis}
        tableTitle="Certifications"
        columns={[
          { key: "standard", header: "Standard" },
          { key: "certificateNo", header: "Certificate #" },
          { key: "status", header: "Status", status: true },
          { key: "expiry", header: "Expiry" },
        ]}
        rows={data.certificationRows}
        quickActions={[
          {
            label: "Schedule Audit",
            variant: "default",
            permission: P.COMPLIANCE_MANAGE,
            onClick: () =>
              openAction({
                key: "audit",
                title: "Schedule Audit",
                endpoint: "/compliance/audits",
                fields: [
                  { name: "auditType", label: "Audit Type", required: true },
                  { name: "scheduledAt", label: "Scheduled Date", type: "date", required: true },
                  { name: "notes", label: "Notes" },
                ],
              }),
          },
          {
            label: "Upload Certificate",
            permission: P.COMPLIANCE_MANAGE,
            onClick: () =>
              openAction({
                key: "cert",
                title: "Add Certificate",
                endpoint: "/compliance/certifications",
                fields: [
                  { name: "standard", label: "Standard", required: true },
                  { name: "certificateNo", label: "Certificate Number" },
                  { name: "expiryDate", label: "Expiry Date", type: "date" },
                  { name: "documentUrl", label: "Document URL" },
                ],
              }),
          },
          {
            label: "Manage CAPA",
            description: "Use CAPA workflow board",
            permission: P.COMPLIANCE_MANAGE,
            onClick: () =>
              openAction({
                key: "capa",
                title: "Create CAPA",
                endpoint: "/compliance/capas",
                fields: [
                  { name: "title", label: "Title", required: true },
                  { name: "dueDate", label: "Due Date", type: "date" },
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
        ]}
      />
      <SoromaModuleExtraGrid
        tables={[
          {
            title: "Audit Calendar",
            columns: [
              { key: "auditType", header: "Type" },
              { key: "scheduledAt", header: "Scheduled" },
              { key: "result", header: "Result" },
            ],
            rows: data.auditRows,
            span: 6,
          },
          {
            title: "QC Results",
            columns: [
              { key: "testType", header: "Test" },
              { key: "result", header: "Result" },
              { key: "passed", header: "Passed" },
            ],
            rows: data.qcRows,
            span: 6,
          },
          {
            title: "Supplier Compliance Ranking",
            columns: [
              { key: "supplier", header: "Supplier" },
              { key: "score", header: "Score" },
              { key: "status", header: "Status", status: true },
            ],
            rows: data.supplierRows.map((s) => ({
              supplier: s.supplier,
              score: s.qualityScore,
              status: s.compliance,
            })),
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
      workflowTitle="CAPA Workflow"
      workflowItems={workflowItems}
      recentEvents={recentEvents}
    />
  )
}
