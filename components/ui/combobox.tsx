"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface ComboboxOption {
  label: string
  value: string
}

interface ComboboxProps {
  value?: string
  onValueChange?: (value: string) => void
  options: ComboboxOption[]
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
  disabled?: boolean
  onBlur?: () => void
}

export function Combobox({
  value,
  onValueChange,
  options,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyText = "No option found.",
  className,
  disabled = false,
  onBlur,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const selectedOption = options.find((option) => option.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between rounded-lg border-gray-200 focus:border-primary focus:ring-primary transition-all duration-200 hover:scale-[1.01]",
            !selectedOption && "text-muted-foreground",
            className,
          )}
          disabled={disabled}
          onBlur={() => {
            if (!open && onBlur) {
              onBlur()
            }
          }}
        >
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder={searchPlaceholder}
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <CommandList>
            <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    const newValue = currentValue === value ? "" : currentValue
                    onValueChange?.(newValue)
                    setOpen(false)
                    if (onBlur) {
                      setTimeout(onBlur, 100)
                    }
                  }}
                  className="cursor-pointer"
                >
                  <Check className={cn("mr-2 h-4 w-4", value === option.value ? "opacity-100" : "opacity-0")} />
                  <span className="truncate">{option.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
