"use client"

import { useState, useCallback, createContext, useContext, ReactNode } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle, AlertTriangle, Info, Save, Trash2, Edit, Send } from "lucide-react"
import { cn } from "@/lib/utils"

// ============================================
// CONFIRMATION MODAL COMPONENT
// ============================================

export type ConfirmationType = "save" | "delete" | "update" | "submit" | "warning" | "info"

interface ConfirmationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  details?: ReactNode
  type?: ConfirmationType
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  showDontAskAgain?: boolean
  dontAskAgainKey?: string
}

const typeConfig: Record<ConfirmationType, {
  icon: typeof CheckCircle
  iconColor: string
  confirmColor: string
}> = {
  save: {
    icon: Save,
    iconColor: "text-green-500",
    confirmColor: "bg-green-600 hover:bg-green-700",
  },
  delete: {
    icon: Trash2,
    iconColor: "text-red-500",
    confirmColor: "bg-red-600 hover:bg-red-700",
  },
  update: {
    icon: Edit,
    iconColor: "text-blue-500",
    confirmColor: "bg-blue-600 hover:bg-blue-700",
  },
  submit: {
    icon: Send,
    iconColor: "text-indigo-500",
    confirmColor: "bg-indigo-600 hover:bg-indigo-700",
  },
  warning: {
    icon: AlertTriangle,
    iconColor: "text-amber-500",
    confirmColor: "bg-amber-600 hover:bg-amber-700",
  },
  info: {
    icon: Info,
    iconColor: "text-blue-500",
    confirmColor: "bg-blue-600 hover:bg-blue-700",
  },
}

export function ConfirmationModal({
  open,
  onOpenChange,
  title,
  description,
  details,
  type = "save",
  confirmLabel,
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  isLoading = false,
  showDontAskAgain = false,
  dontAskAgainKey,
}: ConfirmationModalProps) {
  const [dontAskAgain, setDontAskAgain] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)

  const config = typeConfig[type]
  const Icon = config.icon

  const defaultConfirmLabels: Record<ConfirmationType, string> = {
    save: "Save",
    delete: "Delete",
    update: "Update",
    submit: "Submit",
    warning: "Continue",
    info: "OK",
  }

  const handleConfirm = async () => {
    if (showDontAskAgain && dontAskAgain && dontAskAgainKey) {
      localStorage.setItem(`confirmation_skip_${dontAskAgainKey}`, "true")
    }

    setIsConfirming(true)
    try {
      await onConfirm()
    } finally {
      setIsConfirming(false)
      onOpenChange(false)
    }
  }

  const handleCancel = () => {
    onCancel?.()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Icon className={cn("h-5 w-5", config.iconColor)} />
            {title}
          </AlertDialogTitle>
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>

        {details && (
          <div className="py-2">{details}</div>
        )}

        {showDontAskAgain && (
          <div className="flex items-center space-x-2 py-2">
            <Checkbox
              id="dont-ask-again"
              checked={dontAskAgain}
              onCheckedChange={(checked) => setDontAskAgain(checked as boolean)}
            />
            <Label htmlFor="dont-ask-again" className="text-sm text-gray-600 cursor-pointer">
              Don&apos;t ask me again
            </Label>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isConfirming || isLoading}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isConfirming || isLoading}
            className={cn(config.confirmColor, "text-white")}
          >
            {(isConfirming || isLoading) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {confirmLabel || defaultConfirmLabels[type]}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// ============================================
// SAVE CONFIRMATION MODAL
// ============================================

interface SaveConfirmationProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entityName: string
  summary?: { label: string; value: string | number }[]
  onConfirm: () => void | Promise<void>
  isLoading?: boolean
}

export function SaveConfirmation({
  open,
  onOpenChange,
  entityName,
  summary,
  onConfirm,
  isLoading,
}: SaveConfirmationProps) {
  return (
    <ConfirmationModal
      open={open}
      onOpenChange={onOpenChange}
      title={`Save ${entityName}?`}
      description={`Are you sure you want to save this ${entityName.toLowerCase()}?`}
      type="save"
      onConfirm={onConfirm}
      isLoading={isLoading}
      details={
        summary && summary.length > 0 ? (
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium text-gray-700 mb-2">Summary:</p>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {summary.map((item, i) => (
                <div key={i} className="contents">
                  <dt className="text-gray-500">{item.label}:</dt>
                  <dd className="font-medium text-gray-900">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : undefined
      }
    />
  )
}

// ============================================
// DELETE CONFIRMATION MODAL
// ============================================

interface DeleteConfirmationProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entityName: string
  entityDetails?: string
  onConfirm: () => void | Promise<void>
  isLoading?: boolean
}

export function DeleteConfirmation({
  open,
  onOpenChange,
  entityName,
  entityDetails,
  onConfirm,
  isLoading,
}: DeleteConfirmationProps) {
  return (
    <ConfirmationModal
      open={open}
      onOpenChange={onOpenChange}
      title={`Delete ${entityName}?`}
      description="This action cannot be undone."
      type="delete"
      confirmLabel="Delete"
      onConfirm={onConfirm}
      isLoading={isLoading}
      details={
        entityDetails ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700">
              You are about to delete: <strong>{entityDetails}</strong>
            </p>
          </div>
        ) : undefined
      }
    />
  )
}

// ============================================
// CONFIRMATION HOOK
// ============================================

interface ConfirmOptions {
  title: string
  description?: string
  type?: ConfirmationType
  confirmLabel?: string
  cancelLabel?: string
  details?: ReactNode
  skipKey?: string
}

interface UseConfirmationReturn {
  confirm: (options: ConfirmOptions) => Promise<boolean>
  ConfirmationDialog: () => JSX.Element | null
}

export function useConfirmation(): UseConfirmationReturn {
  const [state, setState] = useState<{
    open: boolean
    options: ConfirmOptions
    resolve: ((value: boolean) => void) | null
  }>({
    open: false,
    options: { title: "" },
    resolve: null,
  })

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    // Check if user has opted to skip this confirmation
    if (options.skipKey) {
      const skipKey = `confirmation_skip_${options.skipKey}`
      if (localStorage.getItem(skipKey) === "true") {
        return Promise.resolve(true)
      }
    }

    return new Promise((resolve) => {
      setState({
        open: true,
        options,
        resolve,
      })
    })
  }, [])

  const handleConfirm = useCallback(() => {
    state.resolve?.(true)
    setState((prev) => ({ ...prev, open: false, resolve: null }))
  }, [state.resolve])

  const handleCancel = useCallback(() => {
    state.resolve?.(false)
    setState((prev) => ({ ...prev, open: false, resolve: null }))
  }, [state.resolve])

  const ConfirmationDialog = useCallback(() => {
    if (!state.open) return null

    return (
      <ConfirmationModal
        open={state.open}
        onOpenChange={(open) => {
          if (!open) handleCancel()
        }}
        title={state.options.title}
        description={state.options.description}
        type={state.options.type}
        confirmLabel={state.options.confirmLabel}
        cancelLabel={state.options.cancelLabel}
        details={state.options.details}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        showDontAskAgain={!!state.options.skipKey}
        dontAskAgainKey={state.options.skipKey}
      />
    )
  }, [state, handleConfirm, handleCancel])

  return { confirm, ConfirmationDialog }
}

// ============================================
// CONFIRMATION CONTEXT (for global use)
// ============================================

interface ConfirmationContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmationContext = createContext<ConfirmationContextType | null>(null)

export function ConfirmationProvider({ children }: { children: ReactNode }) {
  const { confirm, ConfirmationDialog } = useConfirmation()

  return (
    <ConfirmationContext.Provider value={{ confirm }}>
      {children}
      <ConfirmationDialog />
    </ConfirmationContext.Provider>
  )
}

export function useGlobalConfirmation() {
  const context = useContext(ConfirmationContext)
  if (!context) {
    throw new Error("useGlobalConfirmation must be used within a ConfirmationProvider")
  }
  return context
}
