"use client"

import dynamic from "next/dynamic"
import { SSRSafe } from "@/components/ssr-safe"

// Dynamically import ScrollArea with SSR disabled
const ScrollAreaComponent = dynamic(
  () => import("@/components/ui/scroll-area").then((mod) => ({ default: mod.ScrollArea })),
  {
    ssr: false,
    loading: () => <div className="h-64 overflow-auto border rounded-md p-4">Loading...</div>,
  },
)

const ScrollBarComponent = dynamic(
  () => import("@/components/ui/scroll-area").then((mod) => ({ default: mod.ScrollBar })),
  {
    ssr: false,
    loading: () => null,
  },
)

export function ScrollArea({ children, className, ...props }: any) {
  return (
    <SSRSafe fallback={<div className={`h-64 overflow-auto border rounded-md p-4 ${className || ""}`}>{children}</div>}>
      <ScrollAreaComponent className={className} {...props}>
        {children}
      </ScrollAreaComponent>
    </SSRSafe>
  )
}

export function ScrollBar(props: any) {
  return (
    <SSRSafe fallback={null}>
      <ScrollBarComponent {...props} />
    </SSRSafe>
  )
}
