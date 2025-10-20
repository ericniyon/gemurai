"use client"

import dynamic from "next/dynamic"
import { SSRSafe } from "@/components/ssr-safe"

// Dynamically import all Dialog components with SSR disabled
const DialogComponents = dynamic(
  () =>
    import("@/components/ui/dialog").then((mod) => ({
      default: mod.Dialog,
      DialogContent: mod.DialogContent,
      DialogHeader: mod.DialogHeader,
      DialogTitle: mod.DialogTitle,
      DialogDescription: mod.DialogDescription,
      DialogFooter: mod.DialogFooter,
      DialogTrigger: mod.DialogTrigger,
      DialogClose: mod.DialogClose,
    })),
  {
    ssr: false,
    loading: () => null,
  },
)

export function Dialog({ children, ...props }: any) {
  return (
    <SSRSafe fallback={null}>
      <DialogComponents {...props}>{children}</DialogComponents>
    </SSRSafe>
  )
}

export function DialogContent({ children, className, ...props }: any) {
  const DialogContentComponent = dynamic(
    () => import("@/components/ui/dialog").then((mod) => ({ default: mod.DialogContent })),
    {
      ssr: false,
      loading: () => (
        <div className={`fixed inset-0 z-50 flex items-center justify-center ${className || ""}`}>
          <div className="bg-background p-6 rounded-lg shadow-lg max-w-lg w-full mx-4">{children}</div>
        </div>
      ),
    },
  )

  return (
    <SSRSafe fallback={null}>
      <DialogContentComponent className={className} {...props}>
        {children}
      </DialogContentComponent>
    </SSRSafe>
  )
}

export function DialogHeader({ children, ...props }: any) {
  return (
    <SSRSafe fallback={<div className="mb-4">{children}</div>}>
      <div className="flex flex-col space-y-1.5 text-center sm:text-left" {...props}>
        {children}
      </div>
    </SSRSafe>
  )
}

export function DialogTitle({ children, ...props }: any) {
  return (
    <SSRSafe fallback={<h2 className="text-lg font-semibold">{children}</h2>}>
      <h2 className="text-lg font-semibold leading-none tracking-tight" {...props}>
        {children}
      </h2>
    </SSRSafe>
  )
}

export function DialogDescription({ children, ...props }: any) {
  return (
    <SSRSafe fallback={<p className="text-sm text-muted-foreground">{children}</p>}>
      <p className="text-sm text-muted-foreground" {...props}>
        {children}
      </p>
    </SSRSafe>
  )
}

export function DialogFooter({ children, ...props }: any) {
  return (
    <SSRSafe fallback={<div className="flex justify-end space-x-2 mt-4">{children}</div>}>
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2" {...props}>
        {children}
      </div>
    </SSRSafe>
  )
}

export function DialogTrigger({ children, ...props }: any) {
  const DialogTriggerComponent = dynamic(
    () => import("@/components/ui/dialog").then((mod) => ({ default: mod.DialogTrigger })),
    {
      ssr: false,
      loading: () => <div>{children}</div>,
    },
  )

  return (
    <SSRSafe fallback={<div>{children}</div>}>
      <DialogTriggerComponent {...props}>{children}</DialogTriggerComponent>
    </SSRSafe>
  )
}

export function DialogClose({ children, ...props }: any) {
  const DialogCloseComponent = dynamic(
    () => import("@/components/ui/dialog").then((mod) => ({ default: mod.DialogClose })),
    {
      ssr: false,
      loading: () => <div>{children}</div>,
    },
  )

  return (
    <SSRSafe fallback={<div>{children}</div>}>
      <DialogCloseComponent {...props}>{children}</DialogCloseComponent>
    </SSRSafe>
  )
}
