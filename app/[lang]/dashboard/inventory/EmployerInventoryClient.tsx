"use client"
import dynamic from "next/dynamic"

const InventoryPage = dynamic(() => import("@/app/superadmin/inventory/page"), { ssr: false })

export default function EmployerInventoryClient() {
  return <InventoryPage />
} 