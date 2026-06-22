"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search } from "lucide-react"

type SoromaFilterOption = { label: string; value: string }

export function SoromaFilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  children,
}: {
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  children?: React.ReactNode
}) {
  return (
    <div className="sf-card sf-card-elevated flex flex-wrap items-end gap-3.5 p-4 border border-[var(--sf-border)] bg-[var(--sf-surface)]">
      {onSearchChange ? (
        <div className="min-w-[200px] flex-1">
          <Label htmlFor="soroma-search" className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[var(--sf-text-muted)]">
            Search Records
          </Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--sf-text-muted)]" />
            <Input
              id="soroma-search"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-9 pl-9 text-xs border-[var(--sf-border)] bg-[var(--sf-surface)] focus:ring-[var(--sf-green-600)]/20"
            />
          </div>
        </div>
      ) : null}
      <div className="flex flex-wrap items-end gap-3 w-full sm:w-auto">
        {children}
      </div>
    </div>
  )
}

export function SoromaSelectFilter({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string
  label: string
  value: string
  options: SoromaFilterOption[]
  onChange: (value: string) => void
}) {
  return (
    <div className="min-w-[150px] flex-1 sm:flex-initial">
      <Label htmlFor={id} className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[var(--sf-text-muted)]">
        {label}
      </Label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full rounded-md border border-[var(--sf-border)] bg-[var(--sf-surface)] px-2.5 text-xs text-[var(--sf-text-primary)] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--sf-green-600)]/20 focus:border-[var(--sf-green-600)] transition-all cursor-pointer"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
