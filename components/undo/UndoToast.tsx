"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Undo2, X, Clock, CheckCircle } from "lucide-react"
import { Transaction, executeUndo, UndoResult } from "@/lib/utils/transaction-history"

interface UndoToastOptions {
  transaction: Transaction
  onUndo: (transaction: Transaction) => Promise<UndoResult>
  duration?: number
}

export function showUndoToast({ transaction, onUndo, duration = 10000 }: UndoToastOptions) {
  const toastId = toast.custom(
    (t) => (
      <UndoToastContent
        toastId={t}
        transaction={transaction}
        onUndo={onUndo}
        duration={duration}
      />
    ),
    {
      duration: duration,
      position: "bottom-right",
    }
  )
  return toastId
}

interface UndoToastContentProps {
  toastId: string | number
  transaction: Transaction
  onUndo: (transaction: Transaction) => Promise<UndoResult>
  duration: number
}

function UndoToastContent({ toastId, transaction, onUndo, duration }: UndoToastContentProps) {
  const [timeLeft, setTimeLeft] = useState(duration / 1000)
  const [isUndoing, setIsUndoing] = useState(false)
  const [undoComplete, setUndoComplete] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleUndo = useCallback(async () => {
    setIsUndoing(true)
    try {
      const result = await executeUndo(transaction, onUndo)
      if (result.success) {
        setUndoComplete(true)
        setTimeout(() => toast.dismiss(toastId), 1500)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Failed to undo")
    } finally {
      setIsUndoing(false)
    }
  }, [transaction, onUndo, toastId])

  if (undoComplete) {
    return (
      <div className="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]">
        <CheckCircle className="h-5 w-5" />
        <span className="flex-1 font-medium">Action undone successfully</span>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]">
      <div className="flex-1">
        <p className="font-medium text-sm">{transaction.description}</p>
        <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
          <Clock className="h-3 w-3" />
          <span>Undo in {timeLeft}s</span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleUndo}
        disabled={isUndoing || timeLeft === 0}
        className="text-white hover:bg-gray-700 px-3"
      >
        {isUndoing ? (
          <span className="animate-pulse">Undoing...</span>
        ) : (
          <>
            <Undo2 className="h-4 w-4 mr-1" />
            Undo
          </>
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => toast.dismiss(toastId)}
        className="text-gray-400 hover:text-white hover:bg-gray-700 h-6 w-6"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

// Hook for easy undo toast usage
export function useUndoToast() {
  const showUndo = useCallback((options: UndoToastOptions) => {
    return showUndoToast(options)
  }, [])

  return { showUndo }
}
