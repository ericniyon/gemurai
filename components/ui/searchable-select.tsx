"use client"

import * as React from "react"
import { ChevronsUpDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchableSelectOption {
  label: string
  value: string
}

interface SearchableSelectProps {
  value?: string
  onValueChange?: (value: string) => void
  options: SearchableSelectOption[]
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
  disabled?: boolean
}

/**
 * Searchable select that renders dropdown INLINE (no portal).
 * Use this inside Dialogs where Popover/Select portals can block pointer events.
 */
export function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder = "Select...",
  searchPlaceholder = "Type to search...",
  emptyText = "No results found.",
  className,
  disabled = false,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const containerRef = React.useRef<HTMLDivElement>(null)

  const selectedOption = options.find((opt) => opt.value === value)

  const filteredOptions = React.useMemo(() => {
    if (!search.trim()) return options
    const q = search.toLowerCase().trim()
    return options.filter((opt) => opt.label.toLowerCase().includes(q))
  }, [options, search])

  // Close on click outside
  React.useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  const handleSelect = (opt: SearchableSelectOption) => {
    onValueChange?.(opt.value)
    setOpen(false)
    setSearch("")
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-12 w-full items-center justify-between rounded-lg border-2 border-blue-200 bg-gradient-to-r from-white to-blue-50/30 px-4 text-left text-sm font-medium transition-all hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50",
          !selectedOption && "text-muted-foreground",
          className
        )}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </button>

      {open && (
        <div
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[300px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg"
          role="listbox"
        >
          <div className="border-b border-slate-100 p-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setOpen(false)
                  setSearch("")
                }
              }}
            />
          </div>
          <ul className="max-h-[240px] overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <li className="py-6 text-center text-sm text-muted-foreground">{emptyText}</li>
            ) : (
              filteredOptions.map((opt) => (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={value === opt.value}
                  onClick={() => handleSelect(opt)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      handleSelect(opt)
                    }
                  }}
                  tabIndex={0}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-blue-50",
                    value === opt.value && "bg-blue-50 font-semibold text-blue-900"
                  )}
                >
                  <Check className={cn("h-4 w-4 shrink-0", value === opt.value ? "text-blue-600 opacity-100" : "opacity-0")} />
                  <span className="truncate">{opt.label}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
