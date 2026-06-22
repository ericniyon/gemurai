"use client"

import { useMemo, useState } from "react"
import { SoromaModuleDashboard } from "../module-dashboard"
import { SoromaModuleExtraGrid } from "../module-extra-grid"
import { SoromaFilterBar, SoromaSelectFilter } from "../filter-bar"
import { ExportButton } from "../export-button"
import { useSoromaModuleAction } from "../use-module-action"
import { SOROMA_PERMISSIONS as P } from "@/lib/soroma/permissions"
import type { SoromaColumn } from "../data-table"
import { SoromaQualityScoreRing, SoromaSupplierAvatar } from "../quality-score-ring"

type SuppliersData = Awaited<
  ReturnType<typeof import("@/lib/soroma/module-dashboards").getSuppliersDashboardFull>
>

export function SuppliersModuleClient({
  tenantId,
  tenantName,
  data,
}: {
  tenantId: string
  tenantName?: string
  data: SuppliersData
}) {
  const { openAction, modal, refresh, exportCsv } = useSoromaModuleAction(tenantId)
  const [commodity, setCommodity] = useState("")
  const [district, setDistrict] = useState("")

  const filteredRows = useMemo(() => {
    return data.rows.filter((row) => {
      if (commodity && row.commodity !== commodity) return false
      if (district && row.district !== district) return false
      return true
    })
  }, [data.rows, commodity, district])

  const columns: SoromaColumn<Record<string, unknown>>[] = [
    {
      key: "name",
      header: "Supplier",
      render: (row) => <SoromaSupplierAvatar name={String(row.name ?? "")} />,
    },
    { key: "type", header: "Type" },
    { key: "commodity", header: "Commodity" },
    { key: "district", header: "District" },
    {
      key: "qualityScore",
      header: "Quality",
      render: (row) => <SoromaQualityScoreRing value={row.qualityScore} />,
    },
    { key: "status", header: "Status", status: true },
  ]

  return (
    <div className="space-y-6">
      {modal}
      <SoromaModuleDashboard
        title="Suppliers Dashboard"
        moduleTag="T-01 · Supplier Network"
        description="Manage and monitor your supplier network, reliability scorecards, cooperative links, pending approvals, delivery completion, and supplier issues."
        tenantName={tenantName}
        showScopeBanner={false}
        kpiColumns={2}
        kpis={data.kpis}
        tableTitle="Supplier Directory"
        tableDescription="Search, filter, and export your supplier network"
        columns={columns}
        rows={filteredRows}
        headerActions={
          <ExportButton
            permission={P.SUPPLIERS_MANAGE}
            onClick={() => exportCsv(filteredRows, `suppliers-${tenantId}.csv`)}
          />
        }
        quickActions={[
          {
            label: "Add Supplier",
            description: "Register cooperative or company",
            permission: P.SUPPLIERS_MANAGE,
            onClick: () =>
              openAction({
                key: "add",
                title: "Add Supplier",
                endpoint: "/suppliers",
                fields: [
                  { name: "name", label: "Name", required: true },
                  { name: "type", label: "Type", type: "select", options: [
                    { label: "Company", value: "COMPANY" },
                    { label: "Cooperative", value: "COOPERATIVE" },
                    { label: "Farmer Group", value: "SMALLHOLDER_GROUP" },
                  ]},
                  { name: "commodity", label: "Commodity" },
                  { name: "district", label: "District" },
                  { name: "contactEmail", label: "Email" },
                ],
              }),
          },
          {
            label: "Send RFQ",
            description: "Request quotes from network",
            permission: P.PROCUREMENT_MANAGE,
            onClick: () =>
              openAction({
                key: "rfq",
                title: "Send RFQ",
                endpoint: "/purchase-orders",
                fields: [
                  { name: "supplierId", label: "Supplier", type: "select", required: true,
                    options: data.rows.map((s) => ({ label: String(s.name), value: String(s.id) })) },
                  { name: "commodity", label: "Commodity" },
                  { name: "amount", label: "Estimated Amount", type: "number" },
                ],
                initialValues: { status: "REQUESTED" },
              }),
          },
          {
            label: "Approve Pending",
            description: "Review awaiting suppliers",
            permission: P.SUPPLIERS_MANAGE,
            onClick: async () => {
              const pending = data.rows.find((s) => s.status === "PENDING")
              if (!pending) return
              await fetch(`/api/v1/soroma/tenant/${tenantId}/suppliers/${pending.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "ACTIVE" }),
              }).catch(() => null)
              refresh()
            },
          },
          {
            label: "Export Directory",
            description: "CSV with audit scope banner",
            permission: P.SUPPLIERS_VIEW,
            onClick: () => exportCsv(filteredRows, `suppliers-${tenantId}.csv`),
          },
        ]}
        charts={[
          { title: "Supplier Segmentation", type: "donut", data: data.segmentation },
          { title: "Commodity Mix", type: "bar", data: data.commodityChart },
        ]}
      />

      <SoromaFilterBar searchPlaceholder="Filter directory...">
        <SoromaSelectFilter
          id="commodity-filter"
          label="Commodity"
          value={commodity}
          onChange={setCommodity}
          options={[{ label: "All", value: "" }, ...data.filterCommodities.map((c) => ({ label: c, value: c }))]}
        />
        <SoromaSelectFilter
          id="district-filter"
          label="District"
          value={district}
          onChange={setDistrict}
          options={[{ label: "All", value: "" }, ...data.filterDistricts.map((d) => ({ label: d, value: d }))]}
        />
      </SoromaFilterBar>

      <SoromaModuleExtraGrid
        tables={[
          {
            title: "Supplier Scorecards",
            description: "Top performers by quality score",
            columns: [
              { key: "name", header: "Supplier" },
              { key: "qualityScore", header: "Score" },
              { key: "compliance", header: "Compliance" },
              { key: "status", header: "Status", status: true },
            ],
            rows: data.scorecards,
            span: 6,
          },
          {
            title: "Recent Issues",
            columns: [
              { key: "supplier", header: "Supplier" },
              { key: "title", header: "Issue" },
              { key: "severity", header: "Severity", status: true },
              { key: "status", header: "Status", status: true },
            ],
            rows: data.recentIssues,
            span: 6,
          },
          {
            title: "Upcoming Deliveries",
            columns: [
              { key: "poNumber", header: "PO #" },
              { key: "supplier", header: "Supplier" },
              { key: "deliveryDate", header: "Date" },
              { key: "status", header: "Status", status: true },
            ],
            rows: data.upcomingDeliveries,
            span: 12,
          },
        ]}
        maps={[
          {
            title: "Supplier Distribution by District",
            description: "Geo distribution by district concentration",
            points: data.mapPoints.length
              ? data.mapPoints.map((p) => ({ id: p.id, label: p.label, value: p.value }))
              : Object.entries(
                  data.rows.reduce<Record<string, number>>((acc, row) => {
                    const d = String(row.district ?? "Unknown")
                    acc[d] = (acc[d] ?? 0) + 1
                    return acc
                  }, {})
                ).map(([district, count]) => ({ id: district, label: district, value: count })),
            span: 12,
          },
        ]}
      />
    </div>
  )
}
