/**
 * Transaction History and Undo/Rollback System
 * Tracks recent operations and enables reversal
 */

export type TransactionType = 
  | "create_farmer"
  | "update_farmer"
  | "delete_farmer"
  | "create_collection"
  | "update_collection"
  | "delete_collection"
  | "create_input_usage"
  | "create_season_plan"
  | "create_payment"
  | "create_sale"
  | "generic"

export type TransactionStatus = "completed" | "undone" | "failed"

export interface Transaction<T = unknown> {
  id: string
  type: TransactionType
  entityType: string
  entityId: string
  entityName?: string
  action: "create" | "update" | "delete"
  timestamp: Date
  status: TransactionStatus
  data: T
  previousData?: T
  userId?: string
  mccId?: string
  description: string
  canUndo: boolean
  undoDeadline?: Date
}

export interface TransactionHistoryState {
  transactions: Transaction[]
  maxTransactions: number
}

const STORAGE_KEY = "yden_transaction_history"
const DEFAULT_MAX_TRANSACTIONS = 50
const DEFAULT_UNDO_WINDOW_MS = 5 * 60 * 1000 // 5 minutes

// ============================================
// TRANSACTION STORE
// ============================================

class TransactionStore {
  private transactions: Transaction[] = []
  private maxTransactions: number = DEFAULT_MAX_TRANSACTIONS
  private listeners: Set<() => void> = new Set()
  private initialized = false

  constructor() {
    if (typeof window !== "undefined") {
      this.loadFromStorage()
      this.initialized = true
    }
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        this.transactions = parsed.transactions.map((t: Transaction) => ({
          ...t,
          timestamp: new Date(t.timestamp),
          undoDeadline: t.undoDeadline ? new Date(t.undoDeadline) : undefined,
        }))
        this.maxTransactions = parsed.maxTransactions || DEFAULT_MAX_TRANSACTIONS
      }
    } catch (error) {
      console.error("Failed to load transaction history:", error)
      this.transactions = []
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        transactions: this.transactions,
        maxTransactions: this.maxTransactions,
      }))
    } catch (error) {
      console.error("Failed to save transaction history:", error)
    }
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener())
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  getTransactions(): Transaction[] {
    return [...this.transactions]
  }

  getRecentTransactions(limit: number = 10): Transaction[] {
    return this.transactions.slice(0, limit)
  }

  getUndoableTransactions(): Transaction[] {
    const now = new Date()
    return this.transactions.filter(
      (t) => 
        t.canUndo && 
        t.status === "completed" &&
        (!t.undoDeadline || t.undoDeadline > now)
    )
  }

  getTransaction(id: string): Transaction | undefined {
    return this.transactions.find((t) => t.id === id)
  }

  addTransaction<T>(transaction: Omit<Transaction<T>, "id" | "timestamp" | "status">): Transaction<T> {
    const newTransaction: Transaction<T> = {
      ...transaction,
      id: `txn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date(),
      status: "completed",
      undoDeadline: transaction.canUndo 
        ? new Date(Date.now() + DEFAULT_UNDO_WINDOW_MS) 
        : undefined,
    }

    this.transactions.unshift(newTransaction)

    // Trim old transactions
    if (this.transactions.length > this.maxTransactions) {
      this.transactions = this.transactions.slice(0, this.maxTransactions)
    }

    this.saveToStorage()
    this.notifyListeners()

    return newTransaction
  }

  markAsUndone(id: string): boolean {
    const transaction = this.transactions.find((t) => t.id === id)
    if (transaction && transaction.canUndo && transaction.status === "completed") {
      transaction.status = "undone"
      this.saveToStorage()
      this.notifyListeners()
      return true
    }
    return false
  }

  markAsFailed(id: string): void {
    const transaction = this.transactions.find((t) => t.id === id)
    if (transaction) {
      transaction.status = "failed"
      this.saveToStorage()
      this.notifyListeners()
    }
  }

  clearHistory(): void {
    this.transactions = []
    this.saveToStorage()
    this.notifyListeners()
  }

  clearOldTransactions(olderThanMs: number = 24 * 60 * 60 * 1000): void {
    const cutoff = new Date(Date.now() - olderThanMs)
    this.transactions = this.transactions.filter((t) => t.timestamp > cutoff)
    this.saveToStorage()
    this.notifyListeners()
  }
}

// Singleton instance
let transactionStore: TransactionStore | null = null

export function getTransactionStore(): TransactionStore {
  if (!transactionStore) {
    transactionStore = new TransactionStore()
  }
  return transactionStore
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export function recordTransaction<T>(params: {
  type: TransactionType
  entityType: string
  entityId: string
  entityName?: string
  action: "create" | "update" | "delete"
  data: T
  previousData?: T
  description: string
  canUndo?: boolean
  userId?: string
  mccId?: string
}): Transaction<T> {
  return getTransactionStore().addTransaction({
    ...params,
    canUndo: params.canUndo ?? true,
  })
}

export function getUndoableTransactions(): Transaction[] {
  return getTransactionStore().getUndoableTransactions()
}

export function getRecentTransactions(limit?: number): Transaction[] {
  return getTransactionStore().getRecentTransactions(limit)
}

export function undoTransaction(id: string): boolean {
  return getTransactionStore().markAsUndone(id)
}

// ============================================
// UNDO API HELPER
// ============================================

export interface UndoResult {
  success: boolean
  message: string
  restoredData?: unknown
}

export async function executeUndo(
  transaction: Transaction,
  undoHandler: (transaction: Transaction) => Promise<UndoResult>
): Promise<UndoResult> {
  try {
    const result = await undoHandler(transaction)
    
    if (result.success) {
      getTransactionStore().markAsUndone(transaction.id)
    } else {
      getTransactionStore().markAsFailed(transaction.id)
    }
    
    return result
  } catch (error) {
    getTransactionStore().markAsFailed(transaction.id)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Undo failed",
    }
  }
}

// ============================================
// COMMON UNDO HANDLERS
// ============================================

export function createUndoDeleteHandler(apiEndpoint: string, token: string) {
  return async (transaction: Transaction): Promise<UndoResult> => {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(transaction.data),
    })

    if (!response.ok) {
      const error = await response.json()
      return { success: false, message: error.message || "Failed to restore" }
    }

    return {
      success: true,
      message: `${transaction.entityType} restored successfully`,
      restoredData: transaction.data,
    }
  }
}

export function createUndoUpdateHandler(apiEndpoint: string, token: string) {
  return async (transaction: Transaction): Promise<UndoResult> => {
    if (!transaction.previousData) {
      return { success: false, message: "No previous data available" }
    }

    const response = await fetch(`${apiEndpoint}/${transaction.entityId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(transaction.previousData),
    })

    if (!response.ok) {
      const error = await response.json()
      return { success: false, message: error.message || "Failed to restore" }
    }

    return {
      success: true,
      message: `${transaction.entityType} restored to previous state`,
      restoredData: transaction.previousData,
    }
  }
}

export function createUndoCreateHandler(apiEndpoint: string, token: string) {
  return async (transaction: Transaction): Promise<UndoResult> => {
    const response = await fetch(`${apiEndpoint}/${transaction.entityId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      return { success: false, message: error.message || "Failed to undo creation" }
    }

    return {
      success: true,
      message: `${transaction.entityType} removed`,
    }
  }
}
