"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
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
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between rounded-lg border-[rgb(191,219,254)] focus:border-primary focus:ring-primary transition-all duration-200 hover:scale-[1.01]",
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
      <PopoverContent className="w-full p-0 bg-white z-[100]" align="start">
        <Command shouldFilter={true}>
          <CommandInput placeholder={searchPlaceholder} className="h-10" />
          <CommandList className="bg-white max-h-[300px] overflow-y-auto">
            <CommandEmpty className="py-6 text-center text-sm text-muted-foreground bg-white">{emptyText}</CommandEmpty>
            <CommandGroup className="bg-white">
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  keywords={[option.label]}
                  onSelect={(selectedValue) => {
                    // value is option.value (id) - passed directly from cmdk
                    onValueChange?.(selectedValue)
                    setOpen(false)
                    if (onBlur) {
                      setTimeout(onBlur, 100)
                    }
                  }}
                  className="cursor-pointer bg-white hover:bg-blue-50 transition-colors"
                >
                  <Check className={cn("mr-2 h-4 w-4", value === option.value ? "opacity-100 text-blue-600" : "opacity-0")} />
                  <span className={cn("truncate", value === option.value && "font-semibold text-blue-900")}>{option.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
