"use client"

import { HelpCircle } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface HelpTooltipProps {
  content: string
  onLearnMore?: () => void
  learnMoreText?: string
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  className?: string
  iconClassName?: string
  size?: "sm" | "md" | "lg"
}

const sizeClasses = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
}

export function HelpTooltip({
  content,
  onLearnMore,
  learnMoreText = "Learn more",
  side = "top",
  align = "center",
  className,
  iconClassName,
  size = "sm",
}: HelpTooltipProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ml-1.5 align-middle",
              className
            )}
            aria-label="Help"
          >
            <HelpCircle className={cn(sizeClasses[size], iconClassName)} />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          className="max-w-xs"
        >
          <p className="text-sm">{content}</p>
          {onLearnMore && (
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 mt-1 text-xs font-medium"
              onClick={(e) => {
                e.stopPropagation()
                onLearnMore()
              }}
            >
              {learnMoreText} →
            </Button>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

interface HelpLabelProps {
  label: string
  helpContent: string
  onLearnMore?: () => void
  required?: boolean
  className?: string
  htmlFor?: string
}

export function HelpLabel({
  label,
  helpContent,
  onLearnMore,
  required,
  className,
  htmlFor,
}: HelpLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 inline-flex items-center",
        className
      )}
    >
      {label}
      {required && <span className="text-destructive ml-0.5">*</span>}
      <HelpTooltip content={helpContent} onLearnMore={onLearnMore} />
    </label>
  )
}
