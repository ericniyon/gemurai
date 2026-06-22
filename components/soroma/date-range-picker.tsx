"use client"

import { Calendar } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type DateRangeKey = "7d" | "30d" | "90d" | "ytd" | "custom"

const LABELS: Record<DateRangeKey, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  ytd: "Year to date",
  custom: "Custom range",
}

export function SoromaDateRangePicker({
  value = "30d",
  onChange,
}: {
  value?: DateRangeKey
  onChange?: (range: DateRangeKey) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <Calendar
        className="h-4 w-4 shrink-0"
        style={{ color: "var(--sf-text-muted)" }}
        aria-hidden
      />
      <Select
        value={value}
        onValueChange={(v) => onChange?.(v as DateRangeKey)}
      >
        <SelectTrigger
          className="h-9 w-[160px] border-[var(--sf-border)] bg-[var(--sf-surface)] text-sm"
          aria-label="Date range"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(LABELS) as DateRangeKey[]).map((key) => (
            <SelectItem key={key} value={key}>
              {LABELS[key]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
