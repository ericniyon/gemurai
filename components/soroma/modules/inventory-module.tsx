"use client"

import { SoromaModuleDashboard } from "../module-dashboard"
import { SoromaModuleExtraGrid } from "../module-extra-grid"
import { ExportButton } from "../export-button"
import { useSoromaModuleAction } from "../use-module-action"
import { SOROMA_PERMISSIONS as P } from "@/lib/soroma/permissions"

type Data = Awaited<
  ReturnType<typeof import("@/lib/soroma/module-dashboards").getInventoryDashboardFull>
>

export function InventoryModuleClient({
  tenantId,
  tenantName,
  data,
}: {
  tenantId: string
  tenantName?: string
  data: Data
}) {
  const { openAction, modal, exportCsv } = useSoromaModuleAction(tenantId)

  return (
    <div className="space-y-6">
      {modal}
      <SoromaModuleDashboard
        title="Inventory Dashboard"
        moduleTag="T-04 · Inventory"
        description="Inventory ledger, warehouse utilization, movement trends, expiry tracking, and cycle counts."
        tenantName={tenantName}
        showScopeBanner={false}
        kpis={data.kpis}
        charts={[
          { title: "Movement Trends", type: "bar", data: data.movementTrend },
          { title: "Location Heatmap", type: "bar", data: data.warehouseHeatmap },
        ]}
        tableTitle="Inventory Ledger"
        columns={[
          { key: "sku", header: "SKU" },
          { key: "name", header: "Product" },
          { key: "category", header: "Category" },
          { key: "warehouse", header: "Warehouse" },
          { key: "available", header: "Available" },
          { key: "committed", header: "Committed" },
          { key: "status", header: "Status", status: true },
        ]}
        rows={data.rows}
        headerActions={
          <ExportButton permission={P.INVENTORY_MANAGE} onClick={() => exportCsv(data.rows, "inventory.csv")} />
        }
        quickActions={[
          {
            label: "Stock In",
            variant: "default",
            permission: P.INVENTORY_MANAGE,
            onClick: () =>
              openAction({
                key: "in",
                title: "Stock In",
                endpoint: "/inventory",
                fields: [
                  { name: "skuCode", label: "SKU Code", required: true },
                  { name: "skuName", label: "Product Name", required: true },
                  { name: "quantity", label: "Quantity", type: "number", required: true },
                  {
                    name: "warehouseId",
                    label: "Warehouse",
                    type: "select",
                    options: data.warehouseOptions.map((w) => ({ label: w.name, value: w.id })),
                  },
                  { name: "expiryDate", label: "Expiry Date", type: "date" },
                ],
              }),
          },
          {
            label: "Stock Out",
            permission: P.INVENTORY_MANAGE,
            onClick: () =>
              openAction({
                key: "out",
                title: "Stock Out",
                endpoint: "/inventory/movements",
                fields: [
                  {
                    name: "stockLotId",
                    label: "Lot",
                    type: "select",
                    required: true,
                    options: data.lotOptions.map((l) => ({ label: l.label, value: l.id })),
                  },
                  { name: "quantity", label: "Quantity", type: "number", required: true },
                  { name: "reference", label: "Reference" },
                ],
                initialValues: { movementType: "STOCK_OUT" },
              }),
          },
          {
            label: "Cycle Count",
            permission: P.INVENTORY_MANAGE,
            onClick: () =>
              openAction({
                key: "count",
                title: "Cycle Count",
                endpoint: "/inventory/movements",
                fields: [
                  {
                    name: "stockLotId",
                    label: "Lot",
                    type: "select",
                    required: true,
                    options: data.lotOptions.map((l) => ({ label: l.label, value: l.id })),
                  },
                  { name: "quantity", label: "Counted Qty", type: "number", required: true },
                ],
                initialValues: { movementType: "CYCLE_COUNT" },
              }),
          },
          {
            label: "Transfer Stock",
            permission: P.INVENTORY_MANAGE,
            onClick: () =>
              openAction({
                key: "transfer",
                title: "Transfer Stock",
                endpoint: "/inventory/movements",
                fields: [
                  {
                    name: "stockLotId",
                    label: "Lot",
                    type: "select",
                    required: true,
                    options: data.lotOptions.map((l) => ({ label: l.label, value: l.id })),
                  },
                  { name: "quantity", label: "Quantity", type: "number", required: true },
                  {
                    name: "targetWarehouseId",
                    label: "Target Warehouse",
                    type: "select",
                    options: data.warehouseOptions.map((w) => ({ label: w.name, value: w.id })),
                  },
                ],
                initialValues: { movementType: "TRANSFER" },
              }),
          },
        ]}
      />
      <SoromaModuleExtraGrid
        tables={[
          {
            title: "Expiry Tracking",
            columns: [
              { key: "sku", header: "SKU" },
              { key: "name", header: "Product" },
              { key: "expiry", header: "Expiry" },
              { key: "available", header: "Qty" },
            ],
            rows: data.expiryTracking,
            span: 4,
          },
          {
            title: "Low Stock",
            columns: [
              { key: "sku", header: "SKU" },
              { key: "name", header: "Product" },
              { key: "available", header: "Available" },
            ],
            rows: data.lowStock,
            span: 4,
          },
          {
            title: "Dispatch Readiness",
            columns: [
              { key: "sku", header: "SKU" },
              { key: "available", header: "Available" },
              { key: "warehouse", header: "Warehouse" },
            ],
            rows: data.dispatchReady,
            span: 4,
          },
        ]}
      />
    </div>
  )
}
