"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PermissionGuard } from "./permission-guard"

export function ExportButton({
  onClick,
  label = "Export",
  permission,
  disabled,
}: {
  onClick: () => void
  label?: string
  permission?: string
  disabled?: boolean
}) {
  const button = (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className="h-8 text-xs border-[var(--sf-border)] bg-[var(--sf-surface)]"
    >
      <Download className="mr-2 h-4 w-4 text-[var(--sf-green-600)]" />
      {label}
    </Button>
  )

  if (permission) {
    return <PermissionGuard permission={permission}>{button}</PermissionGuard>
  }
  return button
}
