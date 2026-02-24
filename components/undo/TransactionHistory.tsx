"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  History,
  Undo2,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Droplets,
  Calendar,
  Package,
  Trash2,
  Edit,
  Plus,
  MoreHorizontal,
} from "lucide-react"
import {
  getTransactionStore,
  Transaction,
  TransactionType,
  TransactionStatus,
  executeUndo,
  UndoResult,
} from "@/lib/utils/transaction-history"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

interface TransactionHistoryProps {
  onUndo?: (transaction: Transaction) => Promise<UndoResult>
}

const typeIcons: Record<TransactionType, typeof User> = {
  create_farmer: User,
  update_farmer: User,
  delete_farmer: User,
  create_collection: Droplets,
  update_collection: Droplets,
  delete_collection: Droplets,
  create_input_usage: Package,
  create_season_plan: Calendar,
  create_payment: Clock,
  create_sale: Clock,
  generic: MoreHorizontal,
}

const actionIcons = {
  create: Plus,
  update: Edit,
  delete: Trash2,
}

const statusConfig: Record<TransactionStatus, { color: string; icon: typeof CheckCircle }> = {
  completed: { color: "text-green-500", icon: CheckCircle },
  undone: { color: "text-amber-500", icon: Undo2 },
  failed: { color: "text-red-500", icon: XCircle },
}

export function TransactionHistory({ onUndo }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [undoingId, setUndoingId] = useState<string | null>(null)

  useEffect(() => {
    const store = getTransactionStore()
    setTransactions(store.getTransactions())

    const unsubscribe = store.subscribe(() => {
      setTransactions(store.getTransactions())
    })

    return unsubscribe
  }, [])

  const handleUndo = async (transaction: Transaction) => {
    if (!onUndo) {
      toast.error("Undo not available for this action")
      return
    }

    setUndoingId(transaction.id)
    try {
      const result = await executeUndo(transaction, onUndo)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Failed to undo")
    } finally {
      setUndoingId(null)
    }
  }

  const handleClearHistory = () => {
    getTransactionStore().clearHistory()
    toast.success("Transaction history cleared")
  }

  const now = new Date()
  const undoableCount = transactions.filter(
    (t) => t.canUndo && t.status === "completed" && (!t.undoDeadline || t.undoDeadline > now)
  ).length

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <History className="h-4 w-4" />
          History
          {undoableCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {undoableCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Transaction History
          </SheetTitle>
          <SheetDescription>
            Recent actions with undo capability (within 5 minutes)
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {/* Quick Stats */}
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1 text-gray-600">
              <CheckCircle className="h-4 w-4 text-green-500" />
              {transactions.filter((t) => t.status === "completed").length} completed
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <Undo2 className="h-4 w-4 text-amber-500" />
              {undoableCount} undoable
            </div>
          </div>

          {/* Transactions List */}
          <ScrollArea className="h-[calc(100vh-240px)]">
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <History className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No recent transactions</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => {
                  const TypeIcon = typeIcons[transaction.type] || MoreHorizontal
                  const ActionIcon = actionIcons[transaction.action]
                  const statusConf = statusConfig[transaction.status]
                  const StatusIcon = statusConf.icon
                  const canUndo =
                    transaction.canUndo &&
                    transaction.status === "completed" &&
                    (!transaction.undoDeadline || transaction.undoDeadline > now)
                  const isUndoing = undoingId === transaction.id

                  return (
                    <div
                      key={transaction.id}
                      className={cn(
                        "p-3 rounded-lg border bg-white",
                        transaction.status === "undone" && "bg-gray-50 border-gray-200",
                        transaction.status === "failed" && "bg-red-50 border-red-200"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 p-2 rounded-lg bg-gray-100">
                          <TypeIcon className="h-4 w-4 text-gray-600" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <ActionIcon className="h-3 w-3 text-gray-400" />
                            <span className="font-medium text-sm truncate">
                              {transaction.description}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                            <StatusIcon className={cn("h-3 w-3", statusConf.color)} />
                            <span className="capitalize">{transaction.status}</span>
                            <span>•</span>
                            <span>
                              {formatDistanceToNow(transaction.timestamp, { addSuffix: true })}
                            </span>
                          </div>

                          {transaction.entityName && (
                            <p className="text-xs text-gray-400 mt-1 truncate">
                              {transaction.entityName}
                            </p>
                          )}
                        </div>

                        {canUndo && onUndo && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUndo(transaction)}
                            disabled={isUndoing}
                            className="flex-shrink-0"
                          >
                            {isUndoing ? (
                              <span className="text-xs animate-pulse">Undoing...</span>
                            ) : (
                              <>
                                <Undo2 className="h-3 w-3 mr-1" />
                                Undo
                              </>
                            )}
                          </Button>
                        )}

                        {transaction.status === "undone" && (
                          <Badge variant="secondary" className="flex-shrink-0">
                            Undone
                          </Badge>
                        )}
                      </div>

                      {canUndo && transaction.undoDeadline && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
                          <Clock className="h-3 w-3" />
                          <span>
                            Undo available for{" "}
                            {formatDistanceToNow(transaction.undoDeadline)}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>

          {/* Clear History */}
          {transactions.length > 0 && (
            <div className="pt-4 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearHistory}
                className="text-gray-500 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear History
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
