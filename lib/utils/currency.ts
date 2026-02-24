/**
 * Currency utilities for Collection Centers
 * Each MCC can configure its own operating currency
 */

export interface Currency {
  code: string
  name: string
  symbol: string
  decimals: number
  locale?: string
}

// Supported currencies for Collection Centers
// Focused on East African Community (EAC) member states + USD for international transactions
export const SUPPORTED_CURRENCIES: Currency[] = [
  // EAC Member States Currencies
  { code: "RWF", name: "Rwandan Franc", symbol: "FRw", decimals: 0, locale: "rw-RW" },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh", decimals: 2, locale: "en-KE" },
  { code: "UGX", name: "Ugandan Shilling", symbol: "USh", decimals: 0, locale: "en-UG" },
  { code: "TZS", name: "Tanzanian Shilling", symbol: "TSh", decimals: 0, locale: "sw-TZ" },
  { code: "BIF", name: "Burundian Franc", symbol: "FBu", decimals: 0, locale: "fr-BI" },
  { code: "SSP", name: "South Sudanese Pound", symbol: "SSP", decimals: 2, locale: "en-SS" },
  { code: "CDF", name: "Congolese Franc", symbol: "FC", decimals: 2, locale: "fr-CD" },
  // International currencies for cross-border transactions
  { code: "USD", name: "US Dollar", symbol: "$", decimals: 2, locale: "en-US" },
  { code: "EUR", name: "Euro", symbol: "€", decimals: 2, locale: "en-EU" },
  { code: "GBP", name: "British Pound", symbol: "£", decimals: 2, locale: "en-GB" },
]

// Default currency
export const DEFAULT_CURRENCY = "RWF"

/**
 * Get currency by code
 */
export function getCurrency(code: string): Currency | undefined {
  return SUPPORTED_CURRENCIES.find((c) => c.code === code)
}

/**
 * Get currency symbol by code
 */
export function getCurrencySymbol(code: string): string {
  return getCurrency(code)?.symbol || code
}

/**
 * Get currency name by code
 */
export function getCurrencyName(code: string): string {
  return getCurrency(code)?.name || code
}

/**
 * Format amount with currency
 */
export function formatCurrency(
  amount: number,
  currencyCode: string = DEFAULT_CURRENCY,
  options?: { showSymbol?: boolean; compact?: boolean }
): string {
  const currency = getCurrency(currencyCode)
  const { showSymbol = true, compact = false } = options || {}

  if (!currency) {
    return `${amount.toFixed(2)} ${currencyCode}`
  }

  const formatter = new Intl.NumberFormat(currency.locale || "en-US", {
    minimumFractionDigits: currency.decimals,
    maximumFractionDigits: currency.decimals,
    notation: compact ? "compact" : "standard",
  })

  const formattedAmount = formatter.format(amount)

  if (showSymbol) {
    return `${currency.symbol} ${formattedAmount}`
  }

  return formattedAmount
}

/**
 * Parse currency string to number
 */
export function parseCurrencyAmount(value: string): number {
  const cleaned = value.replace(/[^0-9.-]/g, "")
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Get MCC currency from settings
 */
export function getMCCCurrency(mccSettings: Record<string, unknown> | null | undefined): string {
  if (!mccSettings || typeof mccSettings !== "object") {
    return DEFAULT_CURRENCY
  }
  return (mccSettings as { currency?: string }).currency || DEFAULT_CURRENCY
}

/**
 * Validate currency code
 */
export function isValidCurrency(code: string): boolean {
  return SUPPORTED_CURRENCIES.some((c) => c.code === code)
}
