"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export interface CalendarProps {
  mode?: "single" | "multiple" | "range"
  selected?: Date | Date[] | undefined
  onSelect?: (date: Date | undefined) => void
  disabled?: (date: Date) => boolean
  className?: string
  initialFocus?: boolean
}

function Calendar({
  mode = "single",
  selected,
  onSelect,
  disabled,
  className,
  initialFocus = false,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date())
  
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)
  
  const days = eachDayOfInterval({ start: startDate, end: endDate })
  
  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }
  
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }
  
  const isSelected = (date: Date) => {
    if (!selected) return false
    if (Array.isArray(selected)) {
      return selected.some(selectedDate => isSameDay(date, selectedDate))
    }
    return isSameDay(date, selected)
  }
  
  const isToday = (date: Date) => {
    return isSameDay(date, new Date())
  }
  
  const isDisabled = (date: Date) => {
    return disabled ? disabled(date) : false
  }
  
  const handleDateClick = (date: Date) => {
    if (isDisabled(date)) return
    onSelect?.(date)
  }
  
  return (
    <div className={cn("p-3", className)}>
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={previousMonth}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          )}
        >
          <ChevronLeft className="h-4 w-4 text-gray-500" />
        </button>
        <h2 className="text-sm font-medium text-gray-600">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <button
          type="button"
          onClick={nextMonth}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          )}
        >
          <ChevronRight className="h-4 w-4 text-gray-500" />
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center py-2"
          >
            {day}
          </div>
        ))}
        
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const selected = isSelected(day)
          const today = isToday(day)
          const disabled = isDisabled(day)
          
          return (
            <button
              type="button"
              key={day.toString()}
              onClick={() => handleDateClick(day)}
              disabled={disabled}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "h-9 w-9 p-0 font-normal text-gray-600",
                !isCurrentMonth && "text-gray-400 opacity-50",
                selected && "bg-gray-200 text-gray-800 hover:bg-gray-300 hover:text-gray-900 focus:bg-gray-300 focus:text-gray-900",
                today && !selected && "bg-gray-100 text-gray-700",
                disabled && "text-gray-300 opacity-50 cursor-not-allowed"
              )}
            >
              {format(day, "d")}
            </button>
          )
        })}
      </div>
    </div>
  )
}

Calendar.displayName = "Calendar"

export { Calendar } 