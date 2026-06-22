"use client"

import { useState } from "react"
import { SoromaModuleDashboard } from "../module-dashboard"
import { SoromaModuleExtraGrid } from "../module-extra-grid"
import { SoromaGenealogyExplorer } from "../genealogy-explorer"
import { SoromaDashboardCard } from "../dashboard-card"
import { SoromaWorkflowTimeline } from "../workflow-timeline"
import { ExportButton } from "../export-button"
import { useSoromaModuleAction } from "../use-module-action"
import { SOROMA_PERMISSIONS as P } from "@/lib/soroma/permissions"
import type { SoromaColumn } from "../data-table"

type Data = Awaited<
  ReturnType<typeof import("@/lib/soroma/module-dashboards").getTraceabilityDashboardFull>
>
type Genealogy = Awaited<
  ReturnType<typeof import("@/lib/soroma/traceability").getPassportGenealogy>
>

export function TraceabilityModuleClient({
  tenantId,
  tenantName,
  data,
  initialGenealogy,
}: {
  tenantId: string
  tenantName?: string
  data: Data
  initialGenealogy: Genealogy
}) {
  const { openAction, modal, request, refresh, exportCsv } = useSoromaModuleAction(tenantId)
  const [selectedPassportId, setSelectedPassportId] = useState(data.passportIds[0] ?? "")
  const [genealogy, setGenealogy] = useState(initialGenealogy)

  async function selectPassport(passportId: string) {
    setSelectedPassportId(passportId)
    const result = await request<Genealogy>(`/traceability/passports/${passportId}/genealogy`)
    if (result.ok) setGenealogy(result.data)
  }

  const columns: SoromaColumn<Record<string, unknown>>[] = [
    { key: "passportNo", header: "Passport #" },
    { key: "status", header: "Status", status: true },
    { key: "version", header: "Version" },
    { key: "issued", header: "Issued" },
    { key: "qrUrl", header: "QR Verify URL" },
  ]

  return (
    <div className="space-y-6">
      {modal}
      <SoromaModuleDashboard
        title="Traceability Passport"
        moduleTag="T-07 · Traceability"
        description="Product passports, batch genealogy, QR verification, and recall-ready lots."
        tenantName={tenantName}
        showScopeBanner={false}
        kpis={data.kpis}
        tableTitle="Passport Registry"
        columns={columns}
        rows={data.rows.map((row) => ({
          ...row,
          onClick: () => selectPassport(String(row.id)),
        }))}
        headerActions={
          <ExportButton
            permission={P.TRACEABILITY_VIEW}
            onClick={() => exportCsv(data.rows, "passports.csv")}
          />
        }
        quickActions={[
          {
            label: "Generate Passport",
            variant: "default",
            permission: P.TRACEABILITY_MANAGE,
            onClick: () =>
              openAction({
                key: "passport",
                title: "Generate Passport",
                endpoint: "/passports",
                fields: [
                  {
                    name: "batchId",
                    label: "Production Batch",
                    type: "select",
                    required: true,
                    options: data.batchOptions.map((b) => ({
                      label: b.batchNumber,
                      value: b.id,
                    })),
                  },
                ],
              }),
          },
          {
            label: "Scan QR Code",
            permission: P.TRACEABILITY_MANAGE,
            onClick: () =>
              openAction({
                key: "scan",
                title: "Record QR Scan",
                endpoint: `/traceability/passports/${selectedPassportId}/verify`,
                fields: [{ name: "location", label: "Scan Location" }],
              }),
          },
          {
            label: "Export Report",
            permission: P.TRACEABILITY_VIEW,
            onClick: () => exportCsv(data.rows, "traceability-report.csv"),
          },
        ]}
      />

      <div className="flex flex-wrap gap-2">
        {data.passportIds.map((id) => {
          const row = data.rows.find((r) => r.id === id)
          return (
            <button
              key={id}
              type="button"
              onClick={() => selectPassport(id)}
              className={`rounded-md border px-3 py-1 text-xs font-medium transition-colors ${
                selectedPassportId === id
                  ? "border-[var(--sf-green-600)] bg-[var(--sf-green-50)] text-[var(--sf-green-700)]"
                  : "border-[var(--sf-border)] bg-[var(--sf-surface)] text-[var(--sf-text-secondary)]"
              }`}
            >
              {row?.passportNo ?? id.slice(-6)}
            </button>
          )
        })}
      </div>

      <div className="sf-dashboard-grid">
        <div className="sf-col-8">
          <SoromaGenealogyExplorer data={genealogy} />
        </div>
        <div className="sf-col-4">
          <SoromaDashboardCard title="Verification Timeline" description="Recent passport events">
            <SoromaWorkflowTimeline
              events={(genealogy?.events ?? []).map((event) => ({
                id: event.id,
                action: event.eventType,
                fromStatus: null,
                toStatus: event.entityType,
                comment: event.payload ? JSON.stringify(event.payload) : null,
                createdAt: event.createdAt,
              }))}
            />
          </SoromaDashboardCard>
        </div>
      </div>

      <SoromaModuleExtraGrid
        tables={[
          {
            title: "Recent Scans",
            columns: [
              { key: "passport", header: "Passport" },
              { key: "scannedAt", header: "Scanned At" },
              { key: "location", header: "Location" },
            ],
            rows: data.recentScans,
            span: 6,
          },
          {
            title: "Recall Lots",
            columns: [
              { key: "sku", header: "SKU" },
              { key: "lot", header: "Lot" },
              { key: "quantity", header: "Qty" },
            ],
            rows: data.recallLots,
            span: 6,
          },
        ]}
      />
    </div>
  )
}
