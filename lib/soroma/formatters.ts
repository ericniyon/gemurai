/** Locale-aware formatters for SOROMA dashboards */

export function formatSoromaCurrency(
  value: number,
  currency = "RWF",
  locale = "en-RW"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatSoromaCompact(
  value: number,
  currency = "RWF",
  locale = "en-RW"
): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B ${currency}`
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M ${currency}`
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K ${currency}`
  }
  return formatSoromaCurrency(value, currency, locale)
}

export function formatSoromaPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

export function formatSoromaDelta(delta: number): {
  direction: "up" | "down" | "flat"
  label: string
} {
  if (delta > 0) return { direction: "up", label: `+${delta.toFixed(1)}%` }
  if (delta < 0) return { direction: "down", label: `${delta.toFixed(1)}%` }
  return { direction: "flat", label: "0%" }
}

export function formatSoromaDate(
  date: Date | string,
  timezone = "Africa/Kigali"
): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("en-RW", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: timezone,
  }).format(d)
}
