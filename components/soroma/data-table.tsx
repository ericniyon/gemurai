"use client"

import { useMemo, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import { SoromaStatusBadge } from "./status-badge"
import { SoromaLoadingSkeleton } from "./loading-skeleton"
import { SoromaEmptyState } from "./empty-state"

export type SoromaColumn<T> = {
  key: string
  header: string
  render?: (row: T) => React.ReactNode
  status?: boolean
}

export function SoromaDataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  searchPlaceholder = "Search records...",
  onSearch,
  onExport,
  page = 1,
  pageSize = 10,
  total,
  onPageChange,
  rowActions,
  emptyMessage = "No records found",
  loading,
}: {
  columns: SoromaColumn<T>[]
  rows: T[]
  searchPlaceholder?: string
  onSearch?: (q: string) => void
  onExport?: () => void
  page?: number
  pageSize?: number
  total?: number
  onPageChange?: (p: number) => void
  rowActions?: (row: T) => React.ReactNode
  emptyMessage?: string
  loading?: boolean
}) {
  const [localPage, setLocalPage] = useState(1)
  const [localPageSize, setLocalPageSize] = useState(pageSize)
  const [localQuery, setLocalQuery] = useState("")
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const effectivePage = onPageChange ? page : localPage
  const effectivePageSize = onPageChange ? pageSize : localPageSize
  const localFilteredRows = useMemo(() => {
    if (onSearch || !localQuery.trim()) return rows
    const q = localQuery.trim().toLowerCase()
    return rows.filter((row) =>
      Object.values(row).some((value) => String(value ?? "").toLowerCase().includes(q))
    )
  }, [rows, localQuery, onSearch])

  const sortedRows = useMemo(() => {
    if (!sortKey) return localFilteredRows
    return [...localFilteredRows].sort((a, b) => {
      const left = a[sortKey]
      const right = b[sortKey]
      const compare = String(left ?? "").localeCompare(String(right ?? ""), undefined, {
        numeric: true,
        sensitivity: "base",
      })
      return sortDirection === "asc" ? compare : -compare
    })
  }, [localFilteredRows, sortDirection, sortKey])

  const effectiveTotal = total ?? sortedRows.length
  const totalPages = Math.max(1, Math.ceil(effectiveTotal / effectivePageSize))
  const visibleRows = onPageChange
    ? rows
    : sortedRows.slice(
        (effectivePage - 1) * effectivePageSize,
        effectivePage * effectivePageSize
      )

  return (
    <div className="space-y-3">
      {/* Table Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--sf-border)] pb-3">
        <div className="flex flex-1 items-center gap-3 min-w-[240px] max-w-md">
          {(onSearch !== undefined || !loading) && (
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--sf-text-muted)]"
                aria-hidden
              />
              <Input
                placeholder={searchPlaceholder}
                className="h-9 border-[var(--sf-border)] bg-[var(--sf-surface)] pl-9 text-xs"
                onChange={(e) => {
                  if (onSearch) onSearch(e.target.value)
                  else {
                    setLocalQuery(e.target.value)
                    setLocalPage(1)
                  }
                }}
                aria-label="Search table"
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {!onPageChange && (
            <div className="flex items-center gap-2 text-xs text-[var(--sf-text-muted)]">
              <span>Show</span>
              <Select
                value={String(effectivePageSize)}
                onValueChange={(value) => {
                  setLocalPageSize(Number(value))
                  setLocalPage(1)
                }}
              >
                <SelectTrigger className="h-8 w-[76px] text-xs" aria-label="Rows per page">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 25, 50, 100].map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span>records</span>
            </div>
          )}
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport} className="h-8 px-3 text-xs border-[var(--sf-border)]">
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Grid Wrapper */}
      <div
        className="sf-table-wrap overflow-x-auto rounded-[var(--sf-radius)] border"
        style={{ borderColor: "var(--sf-border)" }}
      >
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((col) => {
                const isSorted = sortKey === col.key
                return (
                  <TableHead
                    key={col.key}
                    className="text-[10px] font-bold uppercase tracking-wider h-9"
                    style={{ color: "var(--sf-text-muted)" }}
                  >
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 hover:text-[var(--sf-text-primary)] transition-colors"
                      onClick={() => {
                        if (sortKey === col.key) {
                          setSortDirection((dir) => (dir === "asc" ? "desc" : "asc"))
                        } else {
                          setSortKey(col.key)
                          setSortDirection("asc")
                        }
                        setLocalPage(1)
                      }}
                      aria-label={`Sort by ${col.header}`}
                    >
                      <span>{col.header}</span>
                      {isSorted ? (
                        sortDirection === "asc" ? (
                          <ArrowUp className="h-3 w-3 text-[var(--sf-green-600)]" />
                        ) : (
                          <ArrowDown className="h-3 w-3 text-[var(--sf-green-600)]" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-40" />
                      )}
                    </button>
                  </TableHead>
                )
              })}
              {rowActions && (
                <TableHead className="w-12 h-9">
                  <span className="sr-only">Actions</span>
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (rowActions ? 1 : 0)}
                  className="p-0"
                >
                  <SoromaLoadingSkeleton rows={4} columns={Math.max(columns.length, 3)} />
                </TableCell>
              </TableRow>
            ) : visibleRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (rowActions ? 1 : 0)}
                  className="p-0"
                >
                  <SoromaEmptyState
                    title="No records found"
                    description={emptyMessage}
                  />
                </TableCell>
              </TableRow>
            ) : (
              visibleRows.map((row, i) => (
                <TableRow
                  key={i}
                  className="transition-colors hover:bg-[var(--sf-green-50)]"
                >
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      className="text-xs py-2 h-10 font-medium"
                      style={{ color: "var(--sf-text-secondary)" }}
                    >
                      {col.render
                        ? col.render(row)
                        : col.status && typeof row[col.key] === "string"
                          ? (
                              <SoromaStatusBadge status={row[col.key] as string} />
                            )
                          : String(row[col.key] ?? "—")}
                    </TableCell>
                  ))}
                  {rowActions && (
                    <TableCell className="py-2 h-10 text-right">
                      <div className="flex justify-end">
                        {rowActions(row) ?? (
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-slate-100">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                            <span className="sr-only">Row actions</span>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div
          className="flex items-center justify-between text-xs border-t border-[var(--sf-border)] pt-3"
          style={{ color: "var(--sf-text-muted)" }}
          aria-live="polite"
        >
          <span>
            Showing page <span className="font-semibold text-[var(--sf-text-primary)]">{effectivePage}</span> of <span className="font-semibold text-[var(--sf-text-primary)]">{totalPages}</span>
            {effectiveTotal !== undefined && ` · ${effectiveTotal} total records`}
          </span>
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border-[var(--sf-border)]"
              disabled={effectivePage <= 1}
              onClick={() => {
                if (onPageChange) onPageChange(effectivePage - 1)
                else setLocalPage((p) => Math.max(1, p - 1))
              }}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border-[var(--sf-border)]"
              disabled={effectivePage >= totalPages}
              onClick={() => {
                if (onPageChange) onPageChange(effectivePage + 1)
                else setLocalPage((p) => Math.min(totalPages, p + 1))
              }}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
