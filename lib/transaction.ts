import { prisma } from "@/lib/database"

/**
 * Wrapper for Prisma transactions with proper timeout configuration
 * This helps prevent "Transaction already closed" errors in production
 */
export async function executeTransaction<T>(
  fn: (tx: any) => Promise<T>,
  options: {
    timeout?: number
    maxWait?: number
    retries?: number
  } = {}
): Promise<T> {
  const {
    timeout = 30000,
    maxWait = 30000,
    retries = 2
  } = options

  let lastError: any

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`[TRANSACTION] Attempt ${attempt}/${retries} with timeout ${timeout}ms`)
      
      const result = await prisma.$transaction(fn, {
        timeout,
        maxWait,
        interactiveTransactionOptions: {
          timeout
        }
      })

      console.log(`[TRANSACTION] Success on attempt ${attempt}`)
      return result

    } catch (error: any) {
      lastError = error
      console.error(`[TRANSACTION] Attempt ${attempt} failed:`, error.message)

      // Check if it's a timeout error
      if (error.code === 'P2028' || error.message.includes('Transaction already closed')) {
        console.log(`[TRANSACTION] Timeout error detected, ${retries - attempt} retries remaining`)
        
        if (attempt < retries) {
          // Wait before retrying (exponential backoff)
          const waitTime = 1000 * Math.pow(2, attempt - 1)
          console.log(`[TRANSACTION] Waiting ${waitTime}ms before retry...`)
          await new Promise(resolve => setTimeout(resolve, waitTime))
          continue
        }
      }

      // For non-timeout errors, don't retry
      throw error
    }
  }

  // If we get here, all retries failed
  console.error(`[TRANSACTION] All ${retries} attempts failed`)
  throw lastError
}

/**
 * Execute a transaction with automatic retry and timeout handling
 * This is the recommended way to handle transactions in production
 */
export async function safeTransaction<T>(
  fn: (tx: any) => Promise<T>,
  context: string = "Unknown"
): Promise<T> {
  try {
    return await executeTransaction(fn, {
      timeout: 30000,
      maxWait: 30000,
      retries: 2
    })
  } catch (error: any) {
    console.error(`[SAFE_TRANSACTION] ${context} failed:`, error.message)
    
    // Provide more helpful error messages
    if (error.code === 'P2028') {
      throw new Error(`Transaction timeout in ${context}. The operation took too long to complete. Please try again.`)
    }
    
    if (error.message.includes('Transaction already closed')) {
      throw new Error(`Transaction error in ${context}. The database operation was interrupted. Please try again.`)
    }
    
    throw error
  }
}

/**
 * Execute a quick transaction (for simple operations)
 */
export async function quickTransaction<T>(
  fn: (tx: any) => Promise<T>,
  context: string = "Unknown"
): Promise<T> {
  try {
    return await executeTransaction(fn, {
      timeout: 15000,
      maxWait: 15000,
      retries: 1
    })
  } catch (error: any) {
    console.error(`[QUICK_TRANSACTION] ${context} failed:`, error.message)
    throw error
  }
}

/**
 * Execute a long-running transaction (for complex operations)
 */
export async function longTransaction<T>(
  fn: (tx: any) => Promise<T>,
  context: string = "Unknown"
): Promise<T> {
  try {
    return await executeTransaction(fn, {
      timeout: 60000, // 1 minute
      maxWait: 60000,
      retries: 3
    })
  } catch (error: any) {
    console.error(`[LONG_TRANSACTION] ${context} failed:`, error.message)
    throw error
  }
}
