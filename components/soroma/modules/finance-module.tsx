"use client"

import { SoromaModuleDashboard } from "../module-dashboard"
import { SoromaModuleExtraGrid } from "../module-extra-grid"
import { ExportButton } from "../export-button"
import { useSoromaModuleAction } from "../use-module-action"
import { SOROMA_PERMISSIONS as P } from "@/lib/soroma/permissions"

type Data = Awaited<
  ReturnType<typeof import("@/lib/soroma/module-dashboards").getFinanceDashboardFull>
>

export function FinanceModuleClient({
  tenantId,
  tenantName,
  data,
}: {
  tenantId: string
  tenantName?: string
  data: Data
}) {
  const { openAction, modal, request, refresh, exportCsv } = useSoromaModuleAction(tenantId)

  async function exportPl() {
    const result = await request<{ jobId?: string }>("/reports/exports", {
      method: "POST",
      body: JSON.stringify({ dataset: "finance", format: "CSV" }),
    })
    if (result.ok) {
      exportCsv(data.rows, `finance-pl-${tenantId}.csv`)
    }
  }

  return (
    <div className="space-y-6">
      {modal}
      <SoromaModuleDashboard
        title="Finance Dashboard"
        moduleTag="T-10 · Finance"
        description="Revenue, COGS, gross margin, receivables, P&L, cash flow, and batch profitability."
        tenantName={tenantName}
        showScopeBanner={false}
        kpis={data.kpis}
        charts={[
          { title: "P&L Breakdown", type: "bar", data: data.plChart },
          { title: "Cash Flow", type: "bar", data: data.cashFlow },
          { title: "Cost Drivers", type: "donut", data: data.costDrivers },
        ]}
        tableTitle="Finance Records"
        columns={[
          { key: "type", header: "Type" },
          { key: "amount", header: "Amount" },
          { key: "reference", header: "Reference" },
          { key: "due", header: "Due Date" },
        ]}
        rows={data.rows}
        exportPermission={P.FINANCE_EXPORT}
        onExport={exportPl}
        headerActions={
          <ExportButton permission={P.FINANCE_EXPORT} onClick={exportPl} label="Export P&L" />
        }
        quickActions={[
          {
            label: "Export P&L",
            permission: P.FINANCE_EXPORT,
            onClick: exportPl,
          },
          {
            label: "Review Receivables",
            permission: P.FINANCE_VIEW,
            onClick: () =>
              openAction({
                key: "receivable",
                title: "Add Receivable",
                endpoint: "/finance",
                fields: [
                  { name: "amount", label: "Amount", type: "number", required: true },
                  { name: "reference", label: "Reference" },
                  { name: "dueDate", label: "Due Date", type: "date" },
                ],
                initialValues: { recordType: "RECEIVABLE", currency: data.currency },
              }),
          },
          {
            label: "Approve Payment",
            permission: P.FINANCE_MANAGE,
            onClick: () =>
              openAction({
                key: "payment",
                title: "Record Payment",
                endpoint: "/finance",
                fields: [
                  { name: "amount", label: "Amount", type: "number", required: true },
                  { name: "reference", label: "Reference" },
                ],
                initialValues: { recordType: "PAYMENT", currency: data.currency },
              }),
          },
        ]}
      />
      <SoromaModuleExtraGrid
        charts={[
          { title: "Receivables Aging", type: "donut", data: data.receivablesAging, span: 6 },
        ]}
        tables={[
          {
            title: "Batch Profitability",
            columns: [
              { key: "batch", header: "Batch" },
              { key: "profit", header: "Profit" },
            ],
            rows: data.batchProfitability,
            span: 6,
          },
        ]}
      />
    </div>
  )
}
