import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"
import { v4 as uuidv4 } from 'uuid'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely extract error message from any error type
 * Avoids the "instanceof Error" issue that can occur in certain environments
 */
export function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }
  if (typeof error === 'string') {
    return error
  }
  return 'Unknown error'
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("rw-RW", {
    style: "currency",
    currency: "RWF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format a date string into a human-readable format
 * @param date - Date string in ISO format
 * @param formatStr - Optional format string (defaults to 'PPP')
 * @returns Formatted date string
 */
export function formatDate(date: string | Date, formatStr: string = 'PPP'): string {
  if (!date) return 'N/A'
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return format(dateObj, formatStr)
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid date'
  }
}

/**
 * Generate a unique application ID
 * Format: APP-YYYYMMDD-XXXX where XXXX is a random string
 */
export function generateApplicationId(): string {
  const date = new Date()
  const dateStr = format(date, 'yyyyMMdd')
  const randomStr = uuidv4().split('-')[0].toUpperCase()
  return `APP-${dateStr}-${randomStr}`
}
